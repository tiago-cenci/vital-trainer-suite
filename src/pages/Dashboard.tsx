import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Dumbbell, ClipboardList, TrendingUp, Plus, Calendar, Target, Cloud } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

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

type Insights = {
  mrr: number;
  arpu: number;
  alunosComAssinatura: number;
  alunosAtivos: number;
  adesaoPct: number;
  duracaoMediaSeg: number;
  execSemanais: Array<{ semana: string; semana_dt: string; execucoes: number }>;
  correcoesStatus: Array<{ status: string; qtd: number }>;
  slaMedioSeg: number;
  mediaUsage: Array<{ provider: string; gb_total: number; avg_duracao_seg: number | null }>;
  topExercicios: Array<{ id: string; nome: string; execucoes: number }>;
};

const BRAND = {
  vinho: 'hsl(0,45%,21%)',
  acento: 'hsl(0,51%,55%)',
  bege: 'hsl(33,47%,85%)',
};

function secToMinLabel(sec?: number) {
  const m = Math.round(((sec || 0) / 60) * 10) / 10;
  return `${m} min`;
}
function secToHourLabel(sec?: number) {
  const h = Math.round(((sec || 0) / 3600) * 10) / 10;
  return `${h} h`;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAlunos: 0,
    totalExercicios: 0,
    totalTreinos: 0,
    treinosAtivos: 0,
  });
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insights | null>(null);
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
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/drive.file openid email profile',
      access_type: 'offline',
      prompt: 'consent',
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

  // === Fetch Views/Stats ===
  // tipagens leves das views (opcional, só pra autocomplete)
type VwMrr = { mrr: number; arpu: number; alunos_com_assinatura: number };
type VwExecSem = { semana: string; semana_dt: string; execucoes: number };
type VwCorrStatus = { status: string; qtd: number };
type VwMedia = { provider: string; gb_total: number; avg_duracao_seg: number | null };
type VwTopEx = { id: string; nome: string; execucoes: number };

// use 'sb' sem restrição de tipos para consultar views
const sb = supabase as any;

const fetchInsights = async () => {
  const [
    mrrRes,
    ativosRes,
    kpiRes,
    semRes,
    corrRes,
    slaRes,
    mediaRes,
    topRes,
  ] = await Promise.all([
    sb.from('vw_mrr').select('*').single() as Promise<{ data: VwMrr | null }>,
    sb
      .from('vw_alunos_ativos')
      .select('aluno_id', { count: 'exact', head: true }) as Promise<{ count: number }>,
    sb.from('vw_execucao_kpis').select('*').single() as Promise<{ data: { adesao_pct: number; duracao_media_seg: number } | null }>,
    sb
      .from('vw_execucoes_semana')
      .select('*')
      .order('semana_dt', { ascending: true }) as Promise<{ data: VwExecSem[] }>,
    sb.from('vw_correcoes_status').select('*') as Promise<{ data: VwCorrStatus[] }>,
    sb.from('vw_correcoes_sla').select('*').single() as Promise<{ data: { sla_medio_seg: number } | null }>,
    sb.from('vw_media_usage').select('*') as Promise<{ data: VwMedia[] }>,
    sb.from('vw_top_exercicios').select('*') as Promise<{ data: VwTopEx[] }>,
  ]);

  return {
    mrr: mrrRes.data?.mrr ?? 0,
    arpu: mrrRes.data?.arpu ?? 0,
    alunosComAssinatura: mrrRes.data?.alunos_com_assinatura ?? 0,
    alunosAtivos: ativosRes.count ?? 0,
    adesaoPct: kpiRes.data?.adesao_pct ?? 0,
    duracaoMediaSeg: kpiRes.data?.duracao_media_seg ?? 0,
    execSemanais: semRes.data ?? [],
    correcoesStatus: corrRes.data ?? [],
    slaMedioSeg: (slaRes.data as any)?.sla_medio_seg ?? 0,
    mediaUsage: mediaRes.data ?? [],
    topExercicios: topRes.data ?? [],
  };
};


  useEffect(() => {
    if (!user) return;

    const fetchAll = async () => {
      try {
        const [
          alunosRes,
          exerciciosRes,
          treinosRes,
          treinosAtivosRes,
          storageRes,
          insightsRes,
        ] = await Promise.all([
          supabase.from('alunos').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('exercicios').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('treinos').select('id', { count: 'exact', head: true }),
          supabase.from('treinos').select('id', { count: 'exact', head: true }).eq('ativo', true),
          (supabase as any).from('storage_settings').select('*').eq('user_id', user.id).maybeSingle(),
          fetchInsights(),
        ]);

        setStats({
          totalAlunos: alunosRes.count || 0,
          totalExercicios: exerciciosRes.count || 0,
          totalTreinos: treinosRes.count || 0,
          treinosAtivos: treinosAtivosRes.count || 0,
        });

        setStorageSettings((storageRes as any).data as StorageSettings);
        setInsights(insightsRes);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user]);

  // === UI helpers ===
  // const statCards = [
  //   { title: 'Total de Alunos', value: stats.totalAlunos, description: 'Alunos cadastrados', icon: Users, gradient: 'bg-gradient-primary', action: () => navigate('/alunos') },
  //   { title: 'Exercícios', value: stats.totalExercicios, description: 'Na sua biblioteca', icon: Dumbbell, gradient: 'bg-gradient-secondary', action: () => navigate('/exercicios') },
  //   { title: 'Treinos Criados', value: stats.totalTreinos, description: 'Total de treinos', icon: ClipboardList, gradient: 'bg-gradient-primary', action: () => navigate('/treinos') },
  //   { title: 'Treinos Ativos', value: stats.treinosAtivos, description: 'Em andamento', icon: TrendingUp, gradient: 'bg-gradient-secondary', action: () => navigate('/treinos') },
  // ];

  const quickActions = [
    { title: 'Adicionar Aluno', description: 'Cadastrar novo aluno', icon: Users, action: () => navigate('/alunos') },
    { title: 'Criar Treino', description: 'Montar novo treino', icon: ClipboardList, action: () => navigate('/treinos') },
    { title: 'Novo Exercício', description: 'Adicionar à biblioteca', icon: Dumbbell, action: () => navigate('/exercicios') },
    { title: 'Periodização', description: 'Criar nova periodização', icon: Target, action: () => navigate('/periodizacoes') },
  ];

  const providerLabel = storageSettings?.provider === 'gdrive' ? 'Google Drive (ativo)' : 'Supabase (ativo)';

  // === Subcomponentes visuais (mantém tua estética) ===
  const KpiRow = ({ data }: { data: Insights }) => {
    const cards = [
      { label: 'MRR (R$)', value: data.mrr?.toFixed(2) },
      { label: 'ARPU (R$)', value: data.arpu?.toFixed(2) },
      { label: 'Alunos Ativos', value: data.alunosAtivos },
      { label: 'Adesão 30d', value: `${data.adesaoPct}%` },
      { label: 'Duração Média', value: secToMinLabel(data.duracaoMediaSeg) },
    ];
    return (
      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Card key={c.label} className="dashboard-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="stat-number">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const ExecucoesSemana = ({ data }: { data: any[] }) => (
    <Card className="dashboard-card">
      <CardHeader><CardTitle className="text-primary">Execuções por Semana (8)</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="semana" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="execucoes" stroke={BRAND.vinho} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const CorrecoesStatus = ({ data }: { data: any[] }) => (
    <Card className="dashboard-card">
      <CardHeader><CardTitle className="text-primary">Correções por Status</CardTitle></CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="status" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="qtd" fill={BRAND.acento} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const MediaUsage = ({ data }: { data: any[] }) => {
    const COLORS = [BRAND.vinho, BRAND.acento, BRAND.bege];
    return (
      <Card className="dashboard-card">
        <CardHeader><CardTitle className="text-primary">Uso de Mídia por Provider</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="gb_total" nameKey="provider" innerRadius={50} outerRadius={80} label>
                {data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          {data?.length > 0 && (
            <p className="text-sm text-muted-foreground mt-3">
              Duração média de vídeos: {data.map(d => `${d.provider}: ${secToMinLabel(d.avg_duracao_seg)}`).join(' • ')}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  const TopExercicios = ({ data }: { data: any[] }) => (
    <Card className="dashboard-card">
      <CardHeader><CardTitle className="text-primary">Top Exercícios (30d)</CardTitle></CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {data.map((r: any) => (
            <li key={r.id} className="flex justify-between text-sm">
              <span className="text-foreground">{r.nome}</span>
              <span className="text-muted-foreground">{r.execucoes}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );

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
                    {/* SLA de Correção */}
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="text-primary">SLA Médio de Correção</CardTitle>
                <CardDescription>Tempo médio da execução até a primeira correção registrada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-lg text-muted-foreground">
                  {secToHourLabel(insights.slaMedioSeg)} em média
                </div>
              </CardContent>
            </Card>

        {/* KPIs estratégicos */}
        {insights && <KpiRow data={insights} />}

        {/* KPIs táticos antigos (mantidos) */}
        {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 mt-6">
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
        </div> */}

        {/* Gráficos principais */}
        {insights && (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <ExecucoesSemana data={insights.execSemanais} />
              <CorrecoesStatus data={insights.correcoesStatus} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <MediaUsage data={insights.mediaUsage} />
              <TopExercicios data={insights.topExercicios} />
            </div>


          </>
        )}

        {/* Quick Actions + Próximas Sessões (mantidos) */}
        {/* <div className="grid gap-6 md:grid-cols-2">
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
        </div> */}
      </div>
    </DashboardLayout>
  );
}
