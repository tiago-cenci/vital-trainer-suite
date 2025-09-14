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
          },
        ]
      }
      periodizacoes_semanas: {
        Row: {
          created_at: string | null
          id: string
          periodizacao_id: string | null
          semana_num: number
          tipo_semana: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          periodizacao_id?: string | null
          semana_num: number
          tipo_semana: string
        }
        Update: {
          created_at?: string | null
          id?: string
          periodizacao_id?: string | null
          semana_num?: number
          tipo_semana?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodizacoes_semanas_periodizacao_id_fkey"
            columns: ["periodizacao_id"]
            isOneToOne: false
            referencedRelation: "periodizacoes"
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
      sessoes: {
        Row: {
          created_at: string | null
          id: string
          nome: string
          treino_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome: string
          treino_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome?: string
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
      sessoes_exercicios: {
        Row: {
          created_at: string | null
          exercicio_id: string | null
          id: string
          ordem: number
          sessao_id: string | null
        }
        Insert: {
          created_at?: string | null
          exercicio_id?: string | null
          id?: string
          ordem: number
          sessao_id?: string | null
        }
        Update: {
          created_at?: string | null
          exercicio_id?: string | null
          id?: string
          ordem?: number
          sessao_id?: string | null
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
            foreignKeyName: "treinos_periodizacao_id_fkey"
            columns: ["periodizacao_id"]
            isOneToOne: false
            referencedRelation: "periodizacoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
    },
  },
} as const
