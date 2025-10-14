import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    const code = qs.get("code");
    const state = qs.get("state");

    if (!code || !state) {
      window.location.replace("/dashboard?error=missing_code");
      return;
    }

    const functionsUrl = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL;
    const url = `${functionsUrl}/gdrive_oauth_callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    window.location.replace(url);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">Conectando ao Google Drive…</p>
      </div>
    </div>
  );
}
