import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Loader2, ClipboardList, CreditCard, TrendingUp } from 'lucide-react';
import { useAluno } from '@/hooks/useAlunos';
import { useAnamneseCampos } from '@/hooks/useAnamneseCampos';
import { AnamneseForm } from '@/components/alunos/AnamneseForm';
import { AssinaturasInline } from '@/components/alunos/AssinaturasInline';
import { EvolucaoChart } from '@/components/alunos/EvolucaoChart';

export default function AlunoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: aluno, isLoading } = useAluno(id || '');
  const { campos } = useAnamneseCampos();

  if (isLoading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Alunos', href: '/alunos' }, { label: '...' }]}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!aluno) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Alunos', href: '/alunos' }, { label: 'Não encontrado' }]}>
        <div className="text-center py-12 text-muted-foreground">Aluno não encontrado.</div>
      </DashboardLayout>
    );
  }

  const initials = aluno.nome.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Alunos', href: '/alunos' }, { label: aluno.nome }]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/alunos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-gradient-primary text-white text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{aluno.nome}</h1>
            {aluno.email && <p className="text-muted-foreground text-sm">{aluno.email}</p>}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="anamnese">
          <TabsList>
            <TabsTrigger value="anamnese" className="gap-2">
              <ClipboardList className="h-4 w-4" /> Anamnese
            </TabsTrigger>
            <TabsTrigger value="assinaturas" className="gap-2">
              <CreditCard className="h-4 w-4" /> Assinaturas
            </TabsTrigger>
            <TabsTrigger value="evolucao" className="gap-2">
              <TrendingUp className="h-4 w-4" /> Evolução
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anamnese" className="mt-6">
            <AnamneseForm alunoId={aluno.id} campos={campos} />
          </TabsContent>

          <TabsContent value="assinaturas" className="mt-6">
            <AssinaturasInline alunoId={aluno.id} />
          </TabsContent>

          <TabsContent value="evolucao" className="mt-6">
            <EvolucaoChart alunoId={aluno.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
