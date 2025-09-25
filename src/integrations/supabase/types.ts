export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      alunos: {
        Row: {
          altura: number | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          objetivo: string | null
          observacoes: string | null
          peso: number | null
          user_id: string | null
          aluno_user_id?: string | null // pode existir no teu schema
        }
        Insert: {
          altura?: number | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          objetivo?: string | null
          observacoes?: string | null
          peso?: number | null
          user_id?: string | null
          aluno_user_id?: string | null
        }
        Update: {
          altura?: number | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          objetivo?: string | null
          observacoes?: string | null
          peso?: number | null
          user_id?: string | null
          aluno_user_id?: string | null
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
          }
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
          }
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
          }
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
          }
        ]
      }
      series_execucoes: {
        Row: {
          id: string
          sessao_exercicio_execucao_id: string
          indice: number
          carga: number | null
          reps: number | null
          descanso_seg: number | null
          rpe: number | null
          completada: boolean
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sessao_exercicio_execucao_id: string
          indice: number
          carga?: number | null
          reps?: number | null
          descanso_seg?: number | null
          rpe?: number | null
          completada?: boolean
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sessao_exercicio_execucao_id?: string
          indice?: number
          carga?: number | null
          reps?: number | null
          descanso_seg?: number | null
          rpe?: number | null
          completada?: boolean
          observacoes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_execucoes_sessao_exercicio_execucao_id_fkey"
            columns: ["sessao_exercicio_execucao_id"]
            isOneToOne: false
            referencedRelation: "sessoes_exercicios_execucoes"
            referencedColumns: ["id"]
          }
        ]
      }
      sessoes: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          treino_id: string | null
          ordem: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          treino_id?: string | null
          ordem?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
          treino_id?: string | null
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          }
        ]
      }
      sessoes_exercicios: {
        Row: {
          created_at: string | null
          exercicio_id: string | null
          id: string
          ordem: number
          sessao_id: string | null
          prescricao_tipo?: Database["public"]["Enums"]["tipo_serie"] | null
          series_qtd?: number | null
          reps_min?: number | null
          reps_max?: number | null
          descanso_seg?: number | null
          usar_periodizacao?: boolean | null
        }
        Insert: {
          created_at?: string | null
          exercicio_id?: string | null
          id?: string
          ordem: number
          sessao_id?: string | null
          prescricao_tipo?: Database["public"]["Enums"]["tipo_serie"] | null
          series_qtd?: number | null
          reps_min?: number | null
          reps_max?: number | null
          descanso_seg?: number | null
          usar_periodizacao?: boolean | null
        }
        Update: {
          created_at?: string | null
          exercicio_id?: string | null
          id?: string
          ordem?: number
          sessao_id?: string | null
          prescricao_tipo?: Database["public"]["Enums"]["tipo_serie"] | null
          series_qtd?: number | null
          reps_min?: number | null
          reps_max?: number | null
          descanso_seg?: number | null
          usar_periodizacao?: boolean | null
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
            foreignKeyName: "sessoes_exercicios_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          }
        ]
      }
      sessoes_exercicios_execucoes: {
        Row: {
          id: string
          treino_execucao_id: string
          sessoes_exercicios_id: string
          ordem: number
          started_at: string | null
          ended_at: string | null
          observacoes: string | null
          created_at: string
          video_path: string | null
        }
        Insert: {
          id?: string
          treino_execucao_id: string
          sessoes_exercicios_id: string
          ordem: number
          started_at?: string | null
          ended_at?: string | null
          observacoes?: string | null
          created_at?: string
          video_path?: string | null
        }
        Update: {
          id?: string
          treino_execucao_id?: string
          sessoes_exercicios_id?: string
          ordem?: number
          started_at?: string | null
          ended_at?: string | null
          observacoes?: string | null
          created_at?: string
          video_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessoes_exercicios_execucoes_treino_execucao_id_fkey"
            columns: ["treino_execucao_id"]
            isOneToOne: false
            referencedRelation: "treinos_execucoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessoes_exercicios_execucoes_sessoes_exercicios_id_fkey"
            columns: ["sessoes_exercicios_id"]
            isOneToOne: false
            referencedRelation: "sessoes_exercicios"
            referencedColumns: ["id"]
          }
        ]
      }
      correcoes: {
        Row: {
          id: string
          sessoes_exercicios_execucoes_id: string
          personal_user_id: string
          texto: string
          status: Database["public"]["Enums"]["correcao_status"]
          pontuacao_opcional: number | null
          criterios_json: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sessoes_exercicios_execucoes_id: string
          personal_user_id: string
          texto: string
          status?: Database["public"]["Enums"]["correcao_status"]
          pontuacao_opcional?: number | null
          criterios_json?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sessoes_exercicios_execucoes_id?: string
          personal_user_id?: string
          texto?: string
          status?: Database["public"]["Enums"]["correcao_status"]
          pontuacao_opcional?: number | null
          criterios_json?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correcoes_sessoes_exercicios_execucoes_id_fkey"
            columns: ["sessoes_exercicios_execucoes_id"]
            isOneToOne: false
            referencedRelation: "sessoes_exercicios_execucoes"
            referencedColumns: ["id"]
          }
        ]
      }
      correcoes_midias: {
        Row: {
          id: string
          correcao_id: string
          tipo: Database["public"]["Enums"]["midia_tipo"]
          path: string
          duracao_seg: number | null
          created_at: string
        }
        Insert: {
          id?: string
          correcao_id: string
          tipo: Database["public"]["Enums"]["midia_tipo"]
          path: string
          duracao_seg?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          correcao_id?: string
          tipo?: Database["public"]["Enums"]["midia_tipo"]
          path?: string
          duracao_seg?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "correcoes_midias_correcao_id_fkey"
            columns: ["correcao_id"]
            isOneToOne: false
            referencedRelation: "correcoes"
            referencedColumns: ["id"]
          }
        ]
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
          }
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
            foreignKeyName: "treinos_periodizacao_id_fkey"
            columns: ["periodizacao_id"]
            isOneToOne: false
            referencedRelation: "periodizacoes"
            referencedColumns: ["id"]
          }
        ]
      }
      // +++ NOVAS TABELAS +++
      alongamento_tags: {
        Row: {
          id: string
          user_id: string
          nome: string
          descricao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          descricao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          descricao?: string | null
          created_at?: string
        }
        Relationships: [] // (FK para auth.users não é mapeada aqui)
      }

      alongamentos: {
        Row: {
          id: string
          user_id: string
          descricao: string
          grupo_muscular: Database['public']['Enums']['grupo_muscular']
          forma_execucao: string | null
          musculos_envolvidos: string | null
          observacoes: string | null
          link_video: string | null
          tag_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          descricao: string
          grupo_muscular: Database['public']['Enums']['grupo_muscular']
          forma_execucao?: string | null
          musculos_envolvidos?: string | null
          observacoes?: string | null
          link_video?: string | null
          tag_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          descricao?: string
          grupo_muscular?: Database['public']['Enums']['grupo_muscular']
          forma_execucao?: string | null
          musculos_envolvidos?: string | null
          observacoes?: string | null
          link_video?: string | null
          tag_id?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'alongamentos_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'alongamento_tags'
            referencedColumns: ['id']
          },
        ]
      }

      sessoes_alongamentos: {
        Row: {
          id: string
          sessao_id: string
          alongamento_id: string
          ordem: number
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sessao_id: string
          alongamento_id: string
          ordem?: number
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sessao_id?: string
          alongamento_id?: string
          ordem?: number
          observacoes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sessoes_alongamentos_sessao_id_fkey'
            columns: ['sessao_id']
            isOneToOne: false
            referencedRelation: 'sessoes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sessoes_alongamentos_alongamento_id_fkey'
            columns: ['alongamento_id']
            isOneToOne: false
            referencedRelation: 'alongamentos'
            referencedColumns: ['id']
          },
        ]
      }

      treinos_execucoes: {
        Row: {
          id: string
          aluno_id: string
          treino_id: string
          sessao_id: string
          status: string
          started_at: string
          ended_at: string | null
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aluno_id: string
          treino_id: string
          sessao_id: string
          status?: string
          started_at?: string
          ended_at?: string | null
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aluno_id?: string
          treino_id?: string
          sessao_id?: string
          status?: string
          started_at?: string
          ended_at?: string | null
          observacoes?: string | null
          created_at?: string
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
            foreignKeyName: "treinos_execucoes_treino_id_fkey"
            columns: ["treino_id"]
            isOneToOne: false
            referencedRelation: "treinos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinos_execucoes_sessao_id_fkey"
            columns: ["sessao_id"]
            isOneToOne: false
            referencedRelation: "sessoes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
    listar_alongamentos_sessao: {
      Args: { p_sessao_id: string }
      Returns: {
        sessao_along_id: string
        sessao_id: string
        ordem: number
        observacoes: string | null
        alongamento_id: string
        descricao: string
        grupo_muscular: Database['public']['Enums']['grupo_muscular']
        forma_execucao: string | null
        musculos_envolvidos: string | null
        along_observacoes: string | null
        link_video: string | null
        tag_id: string
        tag_nome: string
      }[]
    }
    ,
    adicionar_alongamentos_por_tag: {
      Args: { p_sessao_id: string; p_tag_id: string }
      Returns: number
    }
  }

    Enums: {
      grupo_muscular:
        | "Peito"
        | "Costas"
        | "Ombro"
        | "Bíceps"
        | "Tríceps"
        | "Perna"
        | "Abdômen"
        | "Glúteo"
      tipo_serie: "WARM-UP" | "FEEDER" | "WORK SET"
      correcao_status: "RASCUNHO" | "ENVIADA"
      midia_tipo: "FOTO" | "VIDEO"
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
      tipo_serie: ["WARM-UP", "FEEDER", "WORK SET"],
      correcao_status: ["RASCUNHO", "ENVIADA"],
      midia_tipo: ["FOTO", "VIDEO"],
    },
  },
} as const
