import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REDIRECT_BASE = 'https://muvtrainer.com/configuracoes';

function redirect(url: string) {
  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, 'Location': url },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    console.log('[gdrive_oauth_callback] Recebido code:', code ? 'SIM' : 'NÃO');
    console.log('[gdrive_oauth_callback] Recebido state:', state ? 'SIM' : 'NÃO');

    if (!code || !state) {
      console.error('[gdrive_oauth_callback] code ou state ausente');
      return redirect(`${REDIRECT_BASE}?error=missing_code`);
    }

    const parsedState = JSON.parse(state);
    const userId = parsedState.user_id;
    console.log('[gdrive_oauth_callback] user_id extraído:', userId);

    const clientId = Deno.env.get('gdrive_client_id');
    const clientSecret = Deno.env.get('gdrive_client_secret');
    const redirectUri = Deno.env.get('gdrive_redirect_uri');

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('[gdrive_oauth_callback] Secrets missing!');
      return redirect(`${REDIRECT_BASE}?error=missing_secrets`);
    }

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
      return redirect(`${REDIRECT_BASE}?error=token_exchange_failed`);
    }

    const tokens = await tokenResponse.json();
    console.log('[gdrive_oauth_callback] Tokens obtidos com sucesso');

    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();

    // Buscar email do usuário Google
    let userEmail: string | null = null;
    try {
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      if (userInfoRes.ok) {
        const info = await userInfoRes.json();
        userEmail = info?.email ?? null;
        console.log('[gdrive_oauth_callback] Email obtido:', userEmail);
      }
    } catch (e) {
      console.warn('[gdrive_oauth_callback] Falha ao buscar userinfo:', e);
    }

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
      return redirect(`${REDIRECT_BASE}?error=save_tokens_failed`);
    }

    console.log('[gdrive_oauth_callback] Tokens salvos. Verificando pasta raiz...');

    // Verificar se já existe gdrive_root_folder_id; só cria se for necessário
    const { data: existing } = await supabaseAdmin
      .from('storage_settings')
      .select('gdrive_root_folder_id')
      .eq('user_id', userId)
      .maybeSingle();

    let folderId: string | null = existing?.gdrive_root_folder_id ?? null;

    if (!folderId) {
      const driveResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'MUVTRAINER',
          mimeType: 'application/vnd.google-apps.folder'
        })
      });

      if (driveResponse.ok) {
        const folder = await driveResponse.json();
        folderId = folder.id;
        console.log('[gdrive_oauth_callback] Pasta criada:', folderId);
      } else {
        console.error('[gdrive_oauth_callback] Erro ao criar pasta:', await driveResponse.text());
      }
    }

    const { error: settingsError } = await supabaseAdmin
      .from('storage_settings')
      .upsert({
        user_id: userId,
        provider: 'gdrive',
        gdrive_root_folder_id: folderId,
        gdrive_email: userEmail,
      }, {
        onConflict: 'user_id'
      });

    if (settingsError) {
      console.error('[gdrive_oauth_callback] Erro ao salvar settings:', settingsError);
      return redirect(`${REDIRECT_BASE}?error=save_tokens_failed`);
    }

    console.log('[gdrive_oauth_callback] Sucesso! Redirecionando...');

    return redirect(`${REDIRECT_BASE}?gdrive=success`);

  } catch (error: any) {
    console.error('[gdrive_oauth_callback] Erro geral:', error.message);
    return redirect(`${REDIRECT_BASE}?error=general_error`);
  }
});
