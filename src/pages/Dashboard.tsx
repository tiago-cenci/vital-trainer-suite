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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-display">Dashboard</h1>
          <p className="text-muted-foreground">Gerencie sua plataforma de forma científica e profissional</p>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card
              key={index}
              className="dashboard-card cursor-pointer transition-all hover:scale-105"
              onClick={stat.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-number">{loading ? '...' : stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions + Próximas Sessões */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>Acesse as principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="justify-start h-auto p-4 hover:bg-muted/50"
                  onClick={action.action}
                >
                  <action.icon className="h-5 w-5 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Sessões
              </CardTitle>
              <CardDescription>Suas próximas atividades</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma sessão agendada</p>
                <p className="text-sm">Comece criando treinos para seus alunos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
