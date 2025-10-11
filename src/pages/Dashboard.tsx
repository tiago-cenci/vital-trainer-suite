import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Dumbbell, ClipboardList, TrendingUp, Plus, Calendar, Target, Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalAlunos: number;
  totalExercicios: number;
  totalTreinos: number;
  treinosAtivos: number;
}

type StorageSettings = {
  user_id: string;
  provider: 'supabase' | 'gdrive';
  gdrive_root_folder_id: string | null;
} | null;

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    totalExercicios: 0,
    totalTreinos: 0,
    treinosAtivos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [storageSettings, setStorageSettings] = useState<StorageSettings>(null);
  const [savingProvider, setSavingProvider] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  // === Google Drive OAuth ===
  const handleConnectDrive = () => {
    if (!user) return;
    const p = new URLSearchParams({
      client_id: import.meta.env.VITE_GDRIVE_CLIENT_ID || '',
      redirect_uri: 'https://vital-trainer-suite.lovable.app/auth/callback',
      response_type: "code",
      scope: "https://www.googleapis.com/auth/drive.file openid email profile",
      access_type: "offline",
      prompt: "consent",
      state: JSON.stringify({ user_id: user.id }),
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  };


  const handleUseDriveAsProvider = useCallback(async () => {
    if (!user) return;
    try {
      setSavingProvider(true);
      const { error } = await (supabase as any)
        .from('storage_settings')
        .upsert({
          user_id: user.id,
          provider: 'gdrive',
          gdrive_root_folder_id: storageSettings?.gdrive_root_folder_id ?? null,
        });
      if (error) throw error;

      setStorageSettings((prev) =>
        prev ? { ...prev, provider: 'gdrive' } : { user_id: user.id, provider: 'gdrive', gdrive_root_folder_id: null }
      );
    } catch (e) {
      console.error('Erro ao salvar provider=gdrive', e);
    } finally {
      setSavingProvider(false);
    }
  }, [user, storageSettings]);

  // === Stats + Storage Settings ===
  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      try {
        const [alunosRes, exerciciosRes, treinosRes, treinosAtivosRes, storageRes] = await Promise.all([
          supabase.from('alunos').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('exercicios').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('treinos').select('id', { count: 'exact', head: true }),
          supabase.from('treinos').select('id', { count: 'exact', head: true }).eq('ativo', true),
          (supabase as any).from('storage_settings').select('*').eq('user_id', user.id).maybeSingle(),
        ]);

        setStats({
          totalAlunos: alunosRes.count || 0,
          totalExercicios: exerciciosRes.count || 0,
          totalTreinos: treinosRes.count || 0,
          treinosAtivos: treinosAtivosRes.count || 0,
        });

        setStorageSettings((storageRes as any).data as StorageSettings);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  const statCards = [
    { title: 'Total de Alunos', value: stats.totalAlunos, description: 'Alunos cadastrados', icon: Users, gradient: 'bg-gradient-primary', action: () => navigate('/alunos') },
    { title: 'Exercícios', value: stats.totalExercicios, description: 'Na sua biblioteca', icon: Dumbbell, gradient: 'bg-gradient-secondary', action: () => navigate('/exercicios') },
    { title: 'Treinos Criados', value: stats.totalTreinos, description: 'Total de treinos', icon: ClipboardList, gradient: 'bg-gradient-primary', action: () => navigate('/treinos') },
    { title: 'Treinos Ativos', value: stats.treinosAtivos, description: 'Em andamento', icon: TrendingUp, gradient: 'bg-gradient-secondary', action: () => navigate('/treinos') },
  ];

  const quickActions = [
    { title: 'Adicionar Aluno', description: 'Cadastrar novo aluno', icon: Users, action: () => navigate('/alunos') },
    { title: 'Criar Treino', description: 'Montar novo treino', icon: ClipboardList, action: () => navigate('/treinos') },
    { title: 'Novo Exercício', description: 'Adicionar à biblioteca', icon: Dumbbell, action: () => navigate('/exercicios') },
    { title: 'Periodização', description: 'Criar nova periodização', icon: Target, action: () => navigate('/periodizacoes') },
  ];

  const providerLabel =
    storageSettings?.provider === 'gdrive' ? 'Google Drive (ativo)' : 'Supabase (ativo)';

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8">
        {/* Welcome */}
        <div className="space-y-2 mb-8">
          <h1 className="text-4xl font-bold font-display tracking-tight text-primary">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Gerencie sua plataforma de forma científica e profissional</p>
        </div>

        {/* Storage / Drive */}
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Armazenamento de Mídia
              </CardTitle>
              <CardDescription>
                Provider atual: <strong>{providerLabel}</strong>
                {storageSettings?.gdrive_root_folder_id ? ' • Drive conectado' : ' • Drive não conectado'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleConnectDrive}>
                Conectar Google Drive
              </Button>
              <Button
                onClick={handleUseDriveAsProvider}
                disabled={savingProvider || !storageSettings?.gdrive_root_folder_id}
              >
                {savingProvider ? 'Salvando...' : 'Usar Google Drive'}
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="dashboard-card cursor-pointer group"
              onClick={stat.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-xl ${stat.gradient} shadow-sm group-hover:shadow-glow transition-all duration-300`}>
                  <stat.icon className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-number mb-1">{loading ? '...' : stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions + Próximas Sessões */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary font-display">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>Acesse as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start h-auto p-4 hover:bg-muted/80 rounded-lg transition-all duration-200 group"
                  onClick={action.action}
                >
                  <action.icon className="h-5 w-5 mr-3 text-primary group-hover:text-accent transition-colors" strokeWidth={1.5} />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary font-display">
                <Calendar className="h-5 w-5" />
                Próximas Sessões
              </CardTitle>
              <CardDescription>Suas próximas atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" strokeWidth={1.5} />
                <p className="font-medium mb-1">Nenhuma sessão agendada</p>
                <p className="text-sm">Comece criando treinos para seus alunos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
