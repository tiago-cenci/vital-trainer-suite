import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { action, ...params } = await req.json();

    // Usar Service Role para ler tokens
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('supabase_service_role_key');
    if (!serviceRoleKey) {
      console.error('[gdrive_proxy] Service role key não encontrada');
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      serviceRoleKey,
      { auth: { persistSession: false } }
    );

    console.log('[gdrive_proxy] Buscando tokens para user:', user.id);

    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'gdrive')
      .single();

    console.log('[gdrive_proxy] Token query result:', tokenError ? `ERROR: ${tokenError.message}` : 'found');

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: 'No Drive tokens found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verificar se token expirou e renovar se necessário
    let accessToken = tokenData.access_token;
    const expiresAt = new Date(tokenData.expires_at);
    
    if (expiresAt <= new Date()) {
      console.log('[gdrive_proxy] Token expirado, renovando...');
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: tokenData.refresh_token,
          client_id: Deno.env.get('gdrive_client_id')!,
          client_secret: Deno.env.get('gdrive_client_secret')!,
          grant_type: 'refresh_token'
        })
      });

      if (!refreshResponse.ok) {
        return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const newTokens = await refreshResponse.json();
      accessToken = newTokens.access_token;
      const newExpiresAt = new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString();

      await supabaseAdmin
        .from('oauth_tokens')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt
        })
        .eq('user_id', user.id)
        .eq('provider', 'gdrive');
    }

    // Executar ação solicitada
    if (action === 'upload-init') {
      const { fileName, mimeType, refTable, refId, alunoId } = params;
      
      // Buscar root folder
      const { data: settings } = await supabaseAdmin
        .from('storage_settings')
        .select('gdrive_root_folder_id')
        .eq('user_id', user.id)
        .single();

      if (!settings?.gdrive_root_folder_id) {
        return new Response(JSON.stringify({ error: 'Root folder not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const rootFolderId = settings.gdrive_root_folder_id;

      // Buscar ou criar pasta do aluno
      let alunoFolderId = rootFolderId;
      if (alunoId) {
        const { data: aluno } = await supabaseClient
          .from('alunos')
          .select('nome')
          .eq('id', alunoId)
          .single();

        if (aluno) {
          // Buscar pasta do aluno
          const searchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(aluno.nome)}' and '${rootFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
            { headers: { 'Authorization': `Bearer ${accessToken}` } }
          );
          
          const searchData = await searchRes.json();
          
          if (searchData.files && searchData.files.length > 0) {
            alunoFolderId = searchData.files[0].id;
          } else {
            // Criar pasta do aluno
            const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: aluno.nome,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [rootFolderId]
              })
            });
            const alunoFolder = await createRes.json();
            alunoFolderId = alunoFolder.id;
          }
        }
      }

      // Buscar ou criar pasta do tipo de conteúdo (correcoes, treinos, etc)
      let contentFolderId = alunoFolderId;
      if (refTable) {
        const folderName = refTable === 'correcoes_midias' ? 'Correções' : 
                          refTable === 'treinos_execucoes' ? 'Treinos' : 
                          'Outros';
        
        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(folderName)}' and '${alunoFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        
        const searchData = await searchRes.json();
        
        if (searchData.files && searchData.files.length > 0) {
          contentFolderId = searchData.files[0].id;
        } else {
          // Criar pasta do tipo de conteúdo
          const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: folderName,
              mimeType: 'application/vnd.google-apps.folder',
              parents: [alunoFolderId]
            })
          });
          const contentFolder = await createRes.json();
          contentFolderId = contentFolder.id;
        }
      }

      // Criar arquivo no Drive
      const driveResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fileName,
          mimeType: mimeType,
          parents: [contentFolderId]
        })
      });

      if (!driveResponse.ok) {
        const errText = await driveResponse.text();
        return new Response(JSON.stringify({ error: 'Drive upload init failed', details: errText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const file = await driveResponse.json();
      
      return new Response(JSON.stringify({ 
        fileId: file.id,
        uploadUrl: `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
        folderPath: `MUVTRAINER/${alunoId ? 'aluno' : 'root'}/${refTable || 'outros'}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'download') {
      const { fileId } = params;
      
      const driveResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!driveResponse.ok) {
        return new Response(JSON.stringify({ error: 'Drive download failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const blob = await driveResponse.blob();
      
      return new Response(blob, {
        headers: {
          ...corsHeaders,
          'Content-Type': driveResponse.headers.get('Content-Type') || 'application/octet-stream'
        }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[gdrive_proxy] Erro:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
