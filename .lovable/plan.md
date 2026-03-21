

## Plano: Sistema de Anamnese Configurável para Alunos

### Problema atual
- Cadastro de aluno tem campos fixos (nome, email, peso, altura, objetivo, observações)
- Assinaturas e evolução ficam em modais separados, acessíveis apenas pelo menu do card
- Personal usa Google Forms para anamnese porque o sistema não suporta campos dinâmicos

### Solução proposta

A ideia central é criar um **form builder** onde o personal define os campos da anamnese, e esses campos são renderizados dinamicamente tanto para o personal preencher quanto para o aluno responder no app do atleta.

---

### 1. Banco de dados - Novas tabelas

**`anamnese_campos`** - Template de campos configurados pelo personal:
- `id`, `user_id` (personal), `label` (nome do campo), `tipo` (text, number, date, select, textarea, boolean), `opcoes` (jsonb - para campos select), `obrigatorio` (boolean), `ordem` (integer), `ativo` (boolean), `created_at`

**`anamnese_respostas`** - Respostas do aluno:
- `id`, `aluno_id`, `campo_id` (ref anamnese_campos), `valor` (text), `created_at`, `updated_at`

RLS: campos filtrados por `user_id = auth.uid()` para o personal; respostas acessíveis pelo personal dono do aluno e pelo próprio aluno.

Ao criar a conta do personal, inserir campos sugeridos padrão (os exemplos que você listou) via seed na primeira vez que ele acessar a configuração.

---

### 2. Simplificar cadastro do aluno

O formulário `AlunoForm` passa a ter apenas:
- **Nome** (obrigatório)
- **Email** (obrigatório)

Os campos antigos (peso, altura, data_nascimento, objetivo, observacoes) são removidos do form de criação. Esses dados passam a ser campos de anamnese configuráveis.

Não removeremos as colunas da tabela `alunos` agora para não quebrar nada, mas o form não as exibirá mais.

---

### 3. Página de perfil do aluno (nova)

Substituir o card + modais separados por uma **página dedicada** `/alunos/:id` com abas (Tabs):

- **Dados / Anamnese** - Exibe e permite editar as respostas dos campos configurados
- **Assinaturas** - O conteúdo atual do `AssinaturasModal`, inline na página
- **Evolução** - O gráfico `EvolucaoChart`, inline na página

O card do aluno na listagem vira um link para essa página, mantendo as ações rápidas (editar nome/email, excluir).

---

### 4. Configuração de campos da anamnese

Nova página acessível pelo menu lateral: **Configurações > Anamnese** (ou seção dentro de configurações).

- Lista dos campos com drag-and-drop para reordenar
- Cada campo mostra: label, tipo, obrigatório (toggle), ativo (toggle)
- Botão para adicionar novo campo com: label, tipo (select entre text/number/date/select/textarea/boolean), opções (se tipo=select), obrigatório
- Botão para editar/excluir campo
- Ao primeiro acesso, popular com os campos sugeridos padrão

---

### 5. Campos sugeridos padrão (seed)

Ao personal acessar a configuração pela primeira vez (0 campos), o sistema insere automaticamente:

| Label | Tipo | Obrigatório |
|-------|------|-------------|
| CPF | text | no |
| Data de Nascimento | date | no |
| Endereço | text | no |
| Como conheceu o personal | select (Instagram, Facebook, TikTok, YouTube, Indicação, Outro) | no |
| Telefone/WhatsApp | text | no |
| Frequência semanal de treino | number | no |
| Dias disponíveis para treinar | text | no |
| Altura (cm) | number | no |
| Peso atual (kg) | number | no |
| % Gordura | number | no |
| Profissão | text | no |
| Rotina diária (gasto calórico) | select (Sedentário, Moderado, Ativo, Trabalho braçal) | no |
| Objetivo curto prazo | textarea | no |
| Objetivo longo prazo | textarea | no |
| Dificuldade para ganhar/perder peso | textarea | no |
| Pode fazer aeróbicos nos dias sem musculação? | boolean | no |
| Uso de substâncias de desempenho | textarea | no |
| Restrições, lesões e problemas de saúde | textarea | no |
| Exercícios que não pode fazer | textarea | no |
| Patologias (doenças) | textarea | no |
| Medicamentos em uso | textarea | no |
| Uso de drogas recreativas | textarea | no |
| Dificuldades com treinamento | textarea | no |
| Horários para refeições | text | no |
| Preferências de treino | textarea | no |
| Preparação para TAF | textarea | no |
| Dieta atual | textarea | no |
| Observações adicionais | textarea | no |

---

### Resumo de arquivos

**Banco (migrations):**
- Criar tabela `anamnese_campos` + RLS
- Criar tabela `anamnese_respostas` + RLS

**Novos arquivos:**
- `src/hooks/useAnamneseCampos.ts` - CRUD dos campos
- `src/hooks/useAnameseRespostas.ts` - CRUD das respostas
- `src/pages/AlunoDetalhe.tsx` - Página com abas (dados, assinaturas, evolução)
- `src/pages/AnameseConfig.tsx` - Configuração dos campos
- `src/components/alunos/AnameseForm.tsx` - Renderizador dinâmico de campos

**Arquivos editados:**
- `src/components/alunos/AlunoForm.tsx` - Simplificar para nome + email
- `src/components/alunos/AlunoCard.tsx` - Card vira link para página de detalhe
- `src/pages/Alunos.tsx` - Ajustar navegação
- `src/App.tsx` - Adicionar rota `/alunos/:id` e `/anamnese-config`
- `src/components/layout/DashboardSidebar.tsx` - Adicionar link para config de anamnese

