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

    // Redirect to edge function (no auth required at this stage)
    const functionsUrl = 'https://kjqoesfrehzcrtvrcktm.supabase.co';
    const url = `${functionsUrl}/functions/v1/gdrive_oauth_callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
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
