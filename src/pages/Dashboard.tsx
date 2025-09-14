import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Dumbbell, ClipboardList, TrendingUp, Plus, Calendar, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalAlunos: number;
  totalExercicios: number;
  totalTreinos: number;
  treinosAtivos: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    totalExercicios: 0,
    totalTreinos: 0,
    treinosAtivos: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      try {
        const [alunosRes, exerciciosRes, treinosRes, treinosAtivosRes] = await Promise.all([
          supabase.from('alunos').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('exercicios').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('treinos').select('id', { count: 'exact', head: true }),
          supabase.from('treinos').select('id', { count: 'exact', head: true }).eq('ativo', true),
        ]);

        setStats({
          totalAlunos: alunosRes.count || 0,
          totalExercicios: exerciciosRes.count || 0,
          totalTreinos: treinosRes.count || 0,
          treinosAtivos: treinosAtivosRes.count || 0,
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const statCards = [
    {
      title: 'Total de Alunos',
      value: stats.totalAlunos,
      description: 'Alunos cadastrados',
      icon: Users,
      gradient: 'bg-gradient-primary',
      action: () => navigate('/alunos'),
    },
    {
      title: 'Exercícios',
      value: stats.totalExercicios,
      description: 'Na sua biblioteca',
      icon: Dumbbell,
      gradient: 'bg-gradient-secondary',
      action: () => navigate('/exercicios'),
    },
    {
      title: 'Treinos Criados',
      value: stats.totalTreinos,
      description: 'Total de treinos',
      icon: ClipboardList,
      gradient: 'bg-gradient-primary',
      action: () => navigate('/treinos'),
    },
    {
      title: 'Treinos Ativos',
      value: stats.treinosAtivos,
      description: 'Em andamento',
      icon: TrendingUp,
      gradient: 'bg-gradient-secondary',
      action: () => navigate('/treinos'),
    },
  ];

  const quickActions = [
    {
      title: 'Adicionar Aluno',
      description: 'Cadastrar novo aluno',
      icon: Users,
      action: () => navigate('/alunos'),
    },
    {
      title: 'Criar Treino',
      description: 'Montar novo treino',
      icon: ClipboardList,
      action: () => navigate('/treinos'),
    },
    {
      title: 'Novo Exercício',
      description: 'Adicionar à biblioteca',
      icon: Dumbbell,
      action: () => navigate('/exercicios'),
    },
    {
      title: 'Periodização',
      description: 'Criar nova periodização',
      icon: Target,
      action: () => navigate('/periodizacoes'),
    },
  ];

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard' }]}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral da sua plataforma de personal training
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => (
            <Card 
              key={index}
              className="dashboard-card cursor-pointer transition-all hover:scale-105"
              onClick={stat.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.gradient}`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="stat-number">
                  {loading ? '...' : stat.value}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Actions Grid */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
              <CardDescription>
                Acesse as principais funcionalidades
              </CardDescription>
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

          {/* Recent Activity Placeholder */}
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Próximas Sessões
              </CardTitle>
              <CardDescription>
                Suas próximas atividades
              </CardDescription>
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