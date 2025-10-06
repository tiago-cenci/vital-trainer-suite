import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const debug = url.searchParams.get('debug');

    console.log('[gdrive_oauth_callback] Recebido code:', code ? 'SIM' : 'NÃO');
    console.log('[gdrive_oauth_callback] Recebido state:', state ? 'SIM' : 'NÃO');

    if (!code || !state) {
      console.error('[gdrive_oauth_callback] code ou state ausente');
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://vital-trainer-suite.lovable.app/dashboard?error=missing_code'
        }
      });
    }

    const parsedState = JSON.parse(state);
    const userId = parsedState.user_id;
    console.log('[gdrive_oauth_callback] user_id extraído:', userId);

    // Trocar code por tokens
    const clientId = Deno.env.get('gdrive_client_id');
    const clientSecret = Deno.env.get('gdrive_client_secret');
    const redirectUri = Deno.env.get('gdrive_redirect_uri');

    console.log('[gdrive_oauth_callback] Trocando code por tokens...');
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri!,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error('[gdrive_oauth_callback] Erro ao trocar code:', errText);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://vital-trainer-suite.lovable.app/dashboard?error=token_exchange_failed'
        }
      });
    }

    const tokens = await tokenResponse.json();
    console.log('[gdrive_oauth_callback] Tokens obtidos com sucesso');

    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();

    // Usar Service Role Key para salvar tokens
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('supabase_service_role_key')!,
      { auth: { persistSession: false } }
    );

    console.log('[gdrive_oauth_callback] Salvando tokens no banco...');

    const { error: upsertError } = await supabaseAdmin
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: 'gdrive',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt
      }, {
        onConflict: 'user_id,provider'
      });

    if (upsertError) {
      console.error('[gdrive_oauth_callback] Erro ao salvar tokens:', upsertError);
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': 'https://vital-trainer-suite.lovable.app/dashboard?error=save_tokens_failed'
        }
      });
    }

    console.log('[gdrive_oauth_callback] Tokens salvos. Criando pasta raiz no Drive...');

    // Criar pasta raiz no Drive
    const driveResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Vital Trainer Suite',
        mimeType: 'application/vnd.google-apps.folder'
      })
    });

    if (!driveResponse.ok) {
      console.error('[gdrive_oauth_callback] Erro ao criar pasta:', await driveResponse.text());
    }

    const folder = await driveResponse.json();
    const folderId = folder.id;
    console.log('[gdrive_oauth_callback] Pasta criada:', folderId);

    // Salvar storage_settings
    const { error: settingsError } = await supabaseAdmin
      .from('storage_settings')
      .upsert({
        user_id: userId,
        provider: 'gdrive',
        gdrive_root_folder_id: folderId
      }, {
        onConflict: 'user_id'
      });

    if (settingsError) {
      console.error('[gdrive_oauth_callback] Erro ao salvar settings:', settingsError);
    }

    console.log('[gdrive_oauth_callback] Sucesso! Redirecionando...');

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://vital-trainer-suite.lovable.app/dashboard?connected=1'
      }
    });

  } catch (error: any) {
    console.error('[gdrive_oauth_callback] Erro geral:', error.message);
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': 'https://vital-trainer-suite.lovable.app/dashboard?error=general_error'
      }
    });
  }
});
