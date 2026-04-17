import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Cloud, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStorageProvider } from '@/hooks/useStorageProvider';

const GDRIVE_CLIENT_ID =
  '735901705166-34jjdvajlnf4m6sftfvte9bih0frehta.apps.googleusercontent.com';
const GDRIVE_REDIRECT_URI = 'https://muvtrainer.com/auth/callback';

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: 'O Google não retornou o código de autorização. Tente novamente.',
  missing_secrets: 'Configuração do servidor incompleta. Contate o suporte.',
  token_exchange_failed:
    'Não foi possível trocar o código pelo token de acesso. Tente conectar novamente.',
  save_tokens_failed: 'Falha ao salvar as credenciais no banco. Tente novamente.',
  general_error: 'Ocorreu um erro inesperado. Tente conectar novamente.',
};

export default function Configuracoes() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { settings, isMediaConfigured, gdriveEmail, isLoading, refetch } =
    useStorageProvider();

  const successFlag = searchParams.get('gdrive');
  const errorFlag = searchParams.get('error');

  // Limpa parâmetros depois de exibidos uma vez
  React.useEffect(() => {
    if (successFlag === 'success') {
      refetch();
    }
  }, [successFlag, refetch]);

  const handleConnect = () => {
    if (!user) return;
    const p = new URLSearchParams({
      client_id: GDRIVE_CLIENT_ID,
      redirect_uri: GDRIVE_REDIRECT_URI,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: JSON.stringify({ user_id: user.id }),
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  };

  const dismissBanner = () => {
    const next = new URLSearchParams(searchParams);
    next.delete('gdrive');
    next.delete('error');
    setSearchParams(next, { replace: true });
  };

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: 'Configurações' },
      ]}
    >
      <div className="space-y-8 max-w-3xl">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display tracking-tight text-primary">
            Configurações
          </h1>
          <p className="text-muted-foreground">
            Gerencie integrações e preferências da sua conta.
          </p>
        </div>

        {successFlag === 'success' && (
          <Alert className="border-success/40 bg-success/5">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <AlertTitle>Google Drive conectado</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>Sua conta foi vinculada com sucesso.</span>
              <Button size="sm" variant="ghost" onClick={dismissBanner}>
                OK
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {errorFlag && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Falha ao conectar o Google Drive</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>
                {ERROR_MESSAGES[errorFlag] ?? `Erro: ${errorFlag}`}
              </span>
              <Button size="sm" variant="ghost" onClick={dismissBanner}>
                Fechar
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Integrações de Mídia
            </h2>
            <p className="text-sm text-muted-foreground">
              Conecte um serviço para armazenar fotos e vídeos das correções dos seus alunos.
            </p>
          </div>

          {/* Card Google Drive */}
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <Cloud className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Google Drive
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : isMediaConfigured ? (
                        <Badge className="bg-success text-success-foreground hover:bg-success/90">Conectado</Badge>
                      ) : (
                        <Badge variant="outline">Desconectado</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Vídeos e fotos ficam organizados na sua conta Google, pasta MUVTRAINER.
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {isMediaConfigured ? (
                <div className="space-y-3">
                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Conta vinculada</span>
                    </div>
                    {gdriveEmail ? (
                      <p className="text-sm text-muted-foreground pl-6">
                        {gdriveEmail}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground pl-6 italic">
                        Conta Google ativa (e-mail não disponível)
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground pl-6">
                      Pasta raiz:{' '}
                      <a
                        href={`https://drive.google.com/drive/folders/${settings?.gdrive_root_folder_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Abrir no Drive
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleConnect}
                  >
                    Reconectar conta
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Você ainda não conectou nenhuma conta do Google Drive. Sem essa
                    integração ativa, não é possível enviar fotos ou vídeos nas correções.
                  </p>
                  <Button onClick={handleConnect} disabled={!user}>
                    <Cloud className="h-4 w-4 mr-2" />
                    Conectar Google Drive
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}
