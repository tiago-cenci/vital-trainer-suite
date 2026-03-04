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

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('supabase_service_role_key');
    if (!serviceRoleKey) {
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

    // Get Drive access token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'gdrive')
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: 'No Drive tokens found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
        .update({ access_token: accessToken, expires_at: newExpiresAt })
        .eq('user_id', user.id)
        .eq('provider', 'gdrive');
    }

    // ─── ACTION: upload-init ───
    if (action === 'upload-init') {
      const { fileName, mimeType, refTable, refId, alunoId } = params;
      
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

      // Helper: find or create folder
      async function findOrCreateFolder(name: string, parentId: string): Promise<string> {
        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(name)}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        const searchData = await searchRes.json();
        if (searchData.files && searchData.files.length > 0) {
          return searchData.files[0].id;
        }
        const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId]
          })
        });
        const folder = await createRes.json();
        return folder.id;
      }

      // Build folder hierarchy
      let targetFolderId = rootFolderId;
      
      if (alunoId) {
        const { data: aluno } = await supabaseClient
          .from('alunos')
          .select('nome')
          .eq('id', alunoId)
          .single();
        if (aluno) {
          targetFolderId = await findOrCreateFolder(aluno.nome, rootFolderId);
        }
      }

      if (refTable) {
        const folderName = refTable === 'correcoes_midias' ? 'Correções' : 
                          refTable === 'treinos_execucoes' ? 'Treinos' : 'Outros';
        targetFolderId = await findOrCreateFolder(folderName, targetFolderId);
      }

      // Create file metadata on Drive first
      const driveResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: fileName,
          mimeType: mimeType,
          parents: [targetFolderId]
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

      // Share with student (reader) if email exists
      if (alunoId) {
        const { data: alunoData } = await supabaseAdmin
          .from('alunos')
          .select('email')
          .eq('id', alunoId)
          .single();

        if (alunoData?.email) {
          try {
            const permRes = await fetch(
              `https://www.googleapis.com/drive/v3/files/${file.id}/permissions`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  role: 'reader',
                  type: 'user',
                  emailAddress: alunoData.email,
                }),
              }
            );
            console.log('[gdrive_proxy] Permissão de leitura:', permRes.ok, alunoData.email);
          } catch (permErr: any) {
            console.error('[gdrive_proxy] Erro ao compartilhar:', permErr.message);
          }
        }
      }

      return new Response(JSON.stringify({ 
        fileId: file.id,
        uploadUrl: `https://www.googleapis.com/upload/drive/v3/files/${file.id}?uploadType=media`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ─── ACTION: upload-content (upload file bytes through edge function to avoid CORS) ───
    if (action === 'upload-content') {
      const { fileId, mimeType, fileBase64 } = params;

      // Decode base64 to bytes
      const binaryStr = atob(fileBase64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const uploadRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': mimeType,
          },
          body: bytes,
        }
      );

      if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        console.error('[gdrive_proxy] upload-content failed:', errText);
        return new Response(JSON.stringify({ error: 'Upload content failed', details: errText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const result = await uploadRes.json();
      console.log('[gdrive_proxy] upload-content success, fileId:', result.id);

      return new Response(JSON.stringify({ ok: true, fileId: result.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ─── ACTION: download ───
    if (action === 'download') {
      const { fileId } = params;
      
      const driveResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
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

    // ─── ACTION: delete ───
    if (action === 'delete') {
      const { fileId } = params;

      const deleteRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }
      );

      if (!deleteRes.ok && deleteRes.status !== 404) {
        const errText = await deleteRes.text();
        console.error('[gdrive_proxy] delete failed:', errText);
        return new Response(JSON.stringify({ error: 'Delete failed', details: errText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('[gdrive_proxy] Arquivo deletado do Drive:', fileId);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
