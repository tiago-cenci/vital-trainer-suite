export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alongamento_tags: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          user_id?: string
        }
        Relationships: []
      }
      alongamentos: {
        Row: {
          created_at: string
          descricao: string
          forma_execucao: string | null
          grupo_muscular: Database["public"]["Enums"]["grupo_muscular"]
          id: string
          link_video: string | null
          musculos_envolvidos: string | null
          observacoes: string | null
          tag_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          forma_execucao?: string | null
          grupo_muscular: Database["public"]["Enums"]["grupo_muscular"]
          id?: string
          link_video?: string | null
          musculos_envolvidos?: string | null
          observacoes?: string | null
          tag_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string
          forma_execucao?: string | null
          grupo_muscular?: Database["public"]["Enums"]["grupo_muscular"]
          id?: string
          link_video?: string | null
          musculos_envolvidos?: string | null
          observacoes?: string | null
          tag_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alongamentos_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "alongamento_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      alunos: {
        Row: {
          altura: number | null
          aluno_user_id: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          objetivo: string | null
          observacoes: string | null
          peso: number | null
          user_id: string | null
        }
        Insert: {
          altura?: number | null
          aluno_user_id?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          objetivo?: string | null
          observacoes?: string | null
          peso?: number | null
          user_id?: string | null
        }
        Update: {
          altura?: number | null
          aluno_user_id?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          objetivo?: string | null
          observacoes?: string | null
          peso?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      assinaturas: {
        Row: {
          aluno_id: string | null
          created_at: string | null
          data_inicio: string
          data_vencimento: string
          forma_pagamento: string | null
          id: string
          valor: number
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string | null
          data_inicio: string
          data_vencimento: string
          forma_pagamento?: string | null
          id?: string
          valor: number
        }
        Update: {
          aluno_id?: string | null
          created_at?: string | null
          data_inicio?: string
          data_vencimento?: string
          forma_pagamento?: string | null
          id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinaturas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "vw_alunos_ativos"
            referencedColumns: ["aluno_id"]
          },
        ]
      }
      correcoes: {
        Row: {
          created_at: string
          criterios_json: Json | null
          id: string
          personal_user_id: string
          pontuacao_opcional: number | null
          sessoes_exercicios_execucoes_id: string
          status: Database["public"]["Enums"]["correcao_status"]
          texto: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criterios_json?: Json | null
          id?: string
          personal_user_id: string
          pontuacao_opcional?: number | null
          sessoes_exercicios_execucoes_id: string
          status?: Database["public"]["Enums"]["correcao_status"]
          texto: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criterios_json?: Json | null
          id?: string
          personal_user_id?: string
          pontuacao_opcional?: number | null
          sessoes_exercicios_execucoes_id?: string
          status?: Database["public"]["Enums"]["correcao_status"]
          texto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correcoes_sessoes_exercicios_execucoes_id_fkey"
            columns: ["sessoes_exercicios_execucoes_id"]
            isOneToOne: false
            referencedRelation: "sessoes_exercicios_execucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      correcoes_midias: {
        Row: {
          correcao_id: string
          created_at: string
          duracao_seg: number | null
          id: string
          path: string
          tipo: Database["public"]["Enums"]["midia_tipo"]
        }
        Insert: {
          correcao_id: string
          created_at?: string
          duracao_seg?: number | null
          id?: string
          path: string
          tipo: Database["public"]["Enums"]["midia_tipo"]
        }
        Update: {
          correcao_id?: string
          created_at?: string
          duracao_seg?: number | null
          id?: string
          path?: string
          tipo?: Database["public"]["Enums"]["midia_tipo"]
        }
        Relationships: [
          {
            foreignKeyName: "correcoes_midias_correcao_id_fkey"
            columns: ["correcao_id"]
            isOneToOne: false
            referencedRelation: "correcoes"
            referencedColumns: ["id"]
          },
        ]
      }
      exercicios: {
        Row: {
          created_at: string | null
          descricao: string | null
          grupos_musculares: Database["public"]["Enums"]["grupo_muscular"][]
          id: string
          link_video: string | null
          nome: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          grupos_musculares: Database["public"]["Enums"]["grupo_muscular"][]
          id?: string
          link_video?: string | null
          nome: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          grupos_musculares?: Database["public"]["Enums"]["grupo_muscular"][]
          id?: string
          link_video?: string | null
          nome?: string
          user_id?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          aluno_id: string | null
          created_at: string
          deleted_at: string | null
          duration_sec: number | null
          expires_at: string | null
          gdrive_file_id: string | null
          id: string
          kind: string
          mime_type: string | null
          owner_user_id: string
          provider: string
          ref_id: string
          ref_table: string
          size_bytes: number | null
          supabase_path: string | null
        }
        Insert: {
          aluno_id?: string | null
          created_at?: string
          deleted_at?: string | null
          duration_sec?: number | null
          expires_at?: string | null
          gdrive_file_id?: string | null
          id?: string
          kind: string
          mime_type?: string | null
          owner_user_id: string
          provider: string
          ref_id: string
          ref_table: string
          size_bytes?: number | null
          supabase_path?: string | null
        }
        Update: {
          aluno_id?: string | null
          created_at?: string
          deleted_at?: string | null
          duration_sec?: number | null
          expires_at?: string | null
          gdrive_file_id?: string | null
          id?: string
          kind?: string
          mime_type?: string | null
          owner_user_id?: string
          provider?: string
          ref_id?: string
          ref_table?: string
          size_bytes?: number | null
          supabase_path?: string | null
        }
        Relationships: []
      }
      oauth_tokens: {
        Row: {
          access_token: string
          expires_at: string
          provider: string
          refresh_token: string | null
          user_id: string
        }
        Insert: {
          access_token: string
          expires_at: string
          provider: string
          refresh_token?: string | null
          user_id: string
        }
        Update: {
          access_token?: string
          expires_at?: string
          provider?: string
          refresh_token?: string | null
          user_id?: string
        }
        Relationships: []
      }
      periodizacoes: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          user_id?: string | null
        }
        Relationships: []
      }
      periodizacoes_semana_config: {
        Row: {
          created_at: string | null
          descanso_max: number
          descanso_min: number
          id: string
          rep_max: number
          rep_min: number
          semana_id: string | null
          tipo_serie: Database["public"]["Enums"]["tipo_serie"]
        }
        Insert: {
          created_at?: string | null
          descanso_max: number
          descanso_min: number
          id?: string
          rep_max: number
          rep_min: number
          semana_id?: string | null
          tipo_serie: Database["public"]["Enums"]["tipo_serie"]
        }
        Update: {
          created_at?: string | null
          descanso_max?: number
          descanso_min?: number
          id?: string
          rep_max?: number
          rep_min?: number
          semana_id?: string | null
          tipo_serie?: Database["public"]["Enums"]["tipo_serie"]
        }
        Relationships: [
          {
            foreignKeyName: "periodizacoes_semana_config_semana_id_fkey"
            columns: ["semana_id"]
            isOneToOne: false
            referencedRelation: "periodizacoes_semanas"
            referencedColumns: ["id"]
          },
        ]
      }
      periodizacoes_semanas: {
        Row: {
          created_at: string | null
          id: string
          ordem: number
          periodizacao_id: string | null
          semana_num: number
          tipo_microciclo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ordem?: number
          periodizacao_id?: string | null
          semana_num: number
          tipo_microciclo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ordem?: number
          periodizacao_id?: string | null
          semana_num?: number
          tipo_microciclo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "periodizacoes_semanas_periodizacao_id_fkey"
            columns: ["periodizacao_id"]
            isOneToOne: false
            referencedRelation: "periodizacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "periodizacoes_semanas_tipo_microciclo_id_fkey"
            columns: ["tipo_microciclo_id"]
            isOneToOne: false
            referencedRelation: "tipos_microciclos"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          created_at: string | null
          id: string
          sessao_exercicio_id: string | null
          tipo: Database["public"]["Enums"]["tipo_serie"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          sessao_exercicio_id?: string | null
          tipo: Database["public"]["Enums"]["tipo_serie"]
        }
        Update: {
          created_at?: string | null
          id?: string
          sessao_exercicio_id?: string | null
          tipo?: Database["public"]["Enums"]["tipo_serie"]
        }
        Relationships: [
          {
            foreignKeyName: "series_sessao_exercicio_id_fkey"
            columns: ["sessao_exercicio_id"]
            isOneToOne: false
            referencedRelation: "sessoes_exercicios"
            referencedColumns: ["id"]
          },
        ]
      }
      series_execucoes: {
        Row: {
          carga: number | null
          completada: boolean
          created_at: string
          descanso_seg: number | null
          id: string
          indice: number
          observacoes: string | null
          reps: number | null
          rpe: number | null
          sessao_exercicio_execucao_id: string
        }
        Insert: {
          carga?: number | null
          completada?: boolean
          created_at?: string
          descanso_seg?: number | null
          id?: string
          indice: number
          observacoes?: string | null
          reps?: number | null
          rpe?: number | null
          sessao_exercicio_execucao_id: string
        }
        Update: {
          carga?: number | null
          completada?: boolean
          created_at?: string
          descanso_seg?: number | null
          id?: string
          indice?: number
          observacoes?: string | null
          reps?: number | null
          rpe?: number | null
          sessao_exercicio_execucao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_execucoes_sessao_exercicio_execucao_id_fkey"
            columns: ["sessao_exercicio_execucao_id"]
            isOneToOne: false
            referencedRelation: "sessoes_exercicios_execucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          ordem: number
          treino_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          ordem?: number
          treino_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          ordem?: number
          treino_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_alongamentos: {
        Row: {
          alongamento_id: string
          created_at: string
          id: string
          observacoes: string | null
          ordem: number
          sessao_id: string
        }
        Insert: {
          alongamento_id: string
          created_at?: string
          id?: string
          observacoes?: string | null
          ordem?: number
          sessao_id: string
        }
        Update: {
          alongamento_id?: string
          created_at?: string
          id?: string
          observacoes?: string | null
          ordem?: number
          sessao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_alongamentos_alongamento_id_fkey"
            columns: ["alongamento_id"]
            isOneToOne: false
            referencedRelation: "alongamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_alongamentos_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_exercicios: {
        Row: {
          created_at: string | null
          descanso_seg: number | null
          exercicio_id: string | null
          id: string
          ordem: number
          prescricao_tipo: Database["public"]["Enums"]["prescricao_tipo_enum"]
          reps_max: number | null
          reps_min: number | null
          series_qtd: number | null
          sessao_id: string | null
          usar_periodizacao: boolean
        }
        Insert: {
          created_at?: string | null
          descanso_seg?: number | null
          exercicio_id?: string | null
          id?: string
          ordem: number
          prescricao_tipo?: Database["public"]["Enums"]["prescricao_tipo_enum"]
          reps_max?: number | null
          reps_min?: number | null
          series_qtd?: number | null
          sessao_id?: string | null
          usar_periodizacao?: boolean
        }
        Update: {
          created_at?: string | null
          descanso_seg?: number | null
          exercicio_id?: string | null
          id?: string
          ordem?: number
          prescricao_tipo?: Database["public"]["Enums"]["prescricao_tipo_enum"]
          reps_max?: number | null
          reps_min?: number | null
          series_qtd?: number | null
          sessao_id?: string | null
          usar_periodizacao?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_exercicios_exercicio_id_fkey"
            columns: ["exercicio_id"]
            isOneToOne: false
            referencedRelation: "vw_top_exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_exercicios_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
        ]
      }
      sessoes_exercicios_execucoes: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          observacoes: string | null
          ordem: number
          sessoes_exercicios_id: string
          started_at: string | null
          treino_execucao_id: string
          video_path: string | null
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          observacoes?: string | null
          ordem: number
          sessoes_exercicios_id: string
          started_at?: string | null
          treino_execucao_id: string
          video_path?: string | null
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          observacoes?: string | null
          ordem?: number
          sessoes_exercicios_id?: string
          started_at?: string | null
          treino_execucao_id?: string
          video_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_exercicios_execucoes_sessoes_exercicios_id_fkey"
            columns: ["sessoes_exercicios_id"]
            isOneToOne: false
            referencedRelation: "sessoes_exercicios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_exercicios_execucoes_treino_execucao_id_fkey"
            columns: ["treino_execucao_id"]
            isOneToOne: false
            referencedRelation: "treinos_execucoes"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_settings: {
        Row: {
          created_at: string
          gdrive_root_folder_id: string | null
          provider: string
          retention_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gdrive_root_folder_id?: string | null
          provider?: string
          retention_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gdrive_root_folder_id?: string | null
          provider?: string
          retention_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tipos_microciclos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tipos_microciclos_config: {
        Row: {
          created_at: string
          descanso_max: number
          descanso_min: number
          id: string
          rep_max: number
          rep_min: number
          tipo_microciclo_id: string
          tipo_serie: Database["public"]["Enums"]["tipo_serie"]
        }
        Insert: {
          created_at?: string
          descanso_max: number
          descanso_min: number
          id?: string
          rep_max: number
          rep_min: number
          tipo_microciclo_id: string
          tipo_serie: Database["public"]["Enums"]["tipo_serie"]
        }
        Update: {
          created_at?: string
          descanso_max?: number
          descanso_min?: number
          id?: string
          rep_max?: number
          rep_min?: number
          tipo_microciclo_id?: string
          tipo_serie?: Database["public"]["Enums"]["tipo_serie"]
        }
        Relationships: [
          {
            foreignKeyName: "tipos_microciclos_config_tipo_microciclo_id_fkey"
            columns: ["tipo_microciclo_id"]
            isOneToOne: false
            referencedRelation: "tipos_microciclos"
            referencedColumns: ["id"]
          },
        ]
      }
      treinos: {
        Row: {
          aluno_id: string | null
          ativo: boolean | null
          created_at: string | null
          id: string
          nome: string
          periodizacao_id: string | null
          sessoes_semanais: number | null
        }
        Insert: {
          aluno_id?: string | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome: string
          periodizacao_id?: string | null
          sessoes_semanais?: number | null
        }
        Update: {
          aluno_id?: string | null
          ativo?: boolean | null
          created_at?: string | null
          id?: string
          nome?: string
          periodizacao_id?: string | null
          sessoes_semanais?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "treinos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "vw_alunos_ativos"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "treinos_periodizacao_id_fkey"
            columns: ["periodizacao_id"]
            isOneToOne: false
            referencedRelation: "periodizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      treinos_execucoes: {
        Row: {
          aluno_id: string
          created_at: string
          ended_at: string | null
          id: string
          observacoes: string | null
          sessao_id: string
          started_at: string
          status: string
          treino_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          observacoes?: string | null
          sessao_id: string
          started_at?: string
          status?: string
          treino_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          observacoes?: string | null
          sessao_id?: string
          started_at?: string
          status?: string
          treino_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinos_execucoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinos_execucoes_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "vw_alunos_ativos"
            referencedColumns: ["aluno_id"]
          },
          {
            foreignKeyName: "treinos_execucoes_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinos_execucoes_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_active_subscriptions: {
        Row: {
          aluno_id: string | null
          data_inicio: string | null
          data_vencimento: string | null
          id: string | null
          valor: number | null
        }
        Insert: {
          aluno_id?: string | null
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: string | null
          valor?: number | null
        }
        Update: {
          aluno_id?: string | null
          data_inicio?: string | null
          data_vencimento?: string | null
          id?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assinaturas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "alunos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assinaturas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "vw_alunos_ativos"
            referencedColumns: ["aluno_id"]
          },
        ]
      }
      vw_alunos_ativos: {
        Row: {
          aluno_id: string | null
        }
        Relationships: []
      }
      vw_correcoes_sla: {
        Row: {
          sla_medio_seg: number | null
        }
        Relationships: []
      }
      vw_correcoes_status: {
        Row: {
          qtd: number | null
          status: string | null
        }
        Relationships: []
      }
      vw_execucao_kpis: {
        Row: {
          adesao_pct: number | null
          concluidas: number | null
          duracao_media_seg: number | null
          iniciadas: number | null
        }
        Relationships: []
      }
      vw_execucoes_semana: {
        Row: {
          execucoes: number | null
          semana: string | null
          semana_dt: string | null
        }
        Relationships: []
      }
      vw_media_usage: {
        Row: {
          avg_duracao_seg: number | null
          bytes_total: number | null
          gb_total: number | null
          provider: string | null
        }
        Relationships: []
      }
      vw_mrr: {
        Row: {
          alunos_com_assinatura: number | null
          arpu: number | null
          mrr: number | null
        }
        Relationships: []
      }
      vw_top_exercicios: {
        Row: {
          execucoes: number | null
          id: string | null
          nome: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      adicionar_alongamentos_por_tag: {
        Args: { p_sessao_id: string; p_tag_id: string }
        Returns: number
      }
      is_exec_do_aluno: { Args: { exec_id: string }; Returns: boolean }
      is_exec_do_meu_aluno: { Args: { exec_id: string }; Returns: boolean }
      listar_alongamentos_sessao: {
        Args: { p_sessao_id: string }
        Returns: {
          along_observacoes: string
          alongamento_id: string
          descricao: string
          forma_execucao: string
          grupo_muscular: Database["public"]["Enums"]["grupo_muscular"]
          link_video: string
          musculos_envolvidos: string
          observacoes: string
          ordem: number
          sessao_along_id: string
          sessao_id: string
          tag_id: string
          tag_nome: string
        }[]
      }
      listar_historico_execucao: {
        Args: { exec_id: string; lim?: number }
        Returns: {
          aluno_id: string
          correcao_created_at: string
          correcao_id: string
          correcao_status: Database["public"]["Enums"]["correcao_status"]
          correcao_texto: string
          ended_at: string
          exec_id: string
          exercicio_id: string
          started_at: string
          video_path: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      correcao_status: "RASCUNHO" | "ENVIADA"
      grupo_muscular:
        | "Peito"
        | "Costas"
        | "Ombro"
        | "Bíceps"
        | "Tríceps"
        | "Perna"
        | "Abdômen"
        | "Glúteo"
      midia_tipo: "FOTO" | "VIDEO"
      prescricao_tipo_enum: "DETALHADA" | "PERIODIZACAO"
      tipo_prescricao: "DETALHADA" | "SIMPLES"
      tipo_serie: "WARM-UP" | "FEEDER" | "WORK SET"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      correcao_status: ["RASCUNHO", "ENVIADA"],
      grupo_muscular: [
        "Peito",
        "Costas",
        "Ombro",
        "Bíceps",
        "Tríceps",
        "Perna",
        "Abdômen",
        "Glúteo",
      ],
      midia_tipo: ["FOTO", "VIDEO"],
      prescricao_tipo_enum: ["DETALHADA", "PERIODIZACAO"],
      tipo_prescricao: ["DETALHADA", "SIMPLES"],
      tipo_serie: ["WARM-UP", "FEEDER", "WORK SET"],
    },
  },
} as const
