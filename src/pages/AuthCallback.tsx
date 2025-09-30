import { useEffect } from "react";


export default function AuthCallback() {
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const code = qs.get("code");
    const state = qs.get("state");

    if (!code || !state) {
      window.location.replace("/storage?error=missing_code");
      return;
    }

    // Redireciona o navegador para a Edge Function (evita CORS)
    // AuthCallback.tsx
    const base = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
    const url = `${base}/gdrive_oauth_callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}&debug=1`;
    window.location.replace(url);

    
  }, []);

  return <div style={{ padding: 24 }}>Conectando ao Google Drive…</div>;
}

