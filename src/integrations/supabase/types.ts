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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_chat_history: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          message_content: string
          message_type: string
          topic_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          message_content: string
          message_type: string
          topic_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          message_content?: string
          message_type?: string
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_history_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_chat_history_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_results: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty_level: string | null
          id: string
          is_correct: boolean
          question_id: string
          question_text: string
          time_spent_seconds: number | null
          topic_category: string | null
          user_answer: string | null
          user_id: string
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          is_correct: boolean
          question_id: string
          question_text: string
          time_spent_seconds?: number | null
          topic_category?: string | null
          user_answer?: string | null
          user_id: string
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty_level?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string
          question_text?: string
          time_spent_seconds?: number | null
          topic_category?: string | null
          user_answer?: string | null
          user_id?: string
        }
        Relationships: []
      }
      downloaded_content: {
        Row: {
          content_data: Json
          content_type: string
          downloaded_at: string
          file_size_bytes: number | null
          id: string
          last_synced_at: string | null
          lesson_id: string | null
          topic_id: string | null
          user_id: string
        }
        Insert: {
          content_data: Json
          content_type: string
          downloaded_at?: string
          file_size_bytes?: number | null
          id?: string
          last_synced_at?: string | null
          lesson_id?: string | null
          topic_id?: string | null
          user_id: string
        }
        Update: {
          content_data?: Json
          content_type?: string
          downloaded_at?: string
          file_size_bytes?: number | null
          id?: string
          last_synced_at?: string | null
          lesson_id?: string | null
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloaded_content_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downloaded_content_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          common_mistakes: string[] | null
          content_challenge: Json | null
          content_fast_revision: Json | null
          content_practice_heavy: Json | null
          content_step_by_step: Json | null
          created_at: string
          estimated_duration_minutes: number | null
          exam_tips: string[] | null
          id: string
          is_downloadable: boolean | null
          key_formulas: string[] | null
          order_index: number
          title: string
          topic_id: string
        }
        Insert: {
          common_mistakes?: string[] | null
          content_challenge?: Json | null
          content_fast_revision?: Json | null
          content_practice_heavy?: Json | null
          content_step_by_step?: Json | null
          created_at?: string
          estimated_duration_minutes?: number | null
          exam_tips?: string[] | null
          id?: string
          is_downloadable?: boolean | null
          key_formulas?: string[] | null
          order_index: number
          title: string
          topic_id: string
        }
        Update: {
          common_mistakes?: string[] | null
          content_challenge?: Json | null
          content_fast_revision?: Json | null
          content_practice_heavy?: Json | null
          content_step_by_step?: Json | null
          created_at?: string
          estimated_duration_minutes?: number | null
          exam_tips?: string[] | null
          id?: string
          is_downloadable?: boolean | null
          key_formulas?: string[] | null
          order_index?: number
          title?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_questions: {
        Row: {
          correct_answer: string
          created_at: string
          difficulty_level: string | null
          explanation: string | null
          hint: string | null
          id: string
          is_waec_past_question: boolean | null
          lesson_id: string
          options: Json | null
          question_text: string
          question_type: string | null
          waec_year: number | null
        }
        Insert: {
          correct_answer: string
          created_at?: string
          difficulty_level?: string | null
          explanation?: string | null
          hint?: string | null
          id?: string
          is_waec_past_question?: boolean | null
          lesson_id: string
          options?: Json | null
          question_text: string
          question_type?: string | null
          waec_year?: number | null
        }
        Update: {
          correct_answer?: string
          created_at?: string
          difficulty_level?: string | null
          explanation?: string | null
          hint?: string | null
          id?: string
          is_waec_past_question?: boolean | null
          lesson_id?: string
          options?: Json | null
          question_text?: string
          question_type?: string | null
          waec_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_questions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          diagnostic_completed: boolean | null
          full_name: string | null
          grade_level: string | null
          id: string
          learning_pace: string | null
          onboarding_completed: boolean | null
          preferred_mode: string | null
          school_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          diagnostic_completed?: boolean | null
          full_name?: string | null
          grade_level?: string | null
          id?: string
          learning_pace?: string | null
          onboarding_completed?: boolean | null
          preferred_mode?: string | null
          school_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          diagnostic_completed?: boolean | null
          full_name?: string | null
          grade_level?: string | null
          id?: string
          learning_pace?: string | null
          onboarding_completed?: boolean | null
          preferred_mode?: string | null
          school_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_streaks: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_study_date: string | null
          longest_streak: number | null
          total_study_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          total_study_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          total_study_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          description: string | null
          estimated_duration_minutes: number | null
          icon: string | null
          id: string
          is_premium: boolean | null
          order_index: number
          title: string
          waec_chapter: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          order_index: number
          title: string
          waec_chapter?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_duration_minutes?: number | null
          icon?: string | null
          id?: string
          is_premium?: boolean | null
          order_index?: number
          title?: string
          waec_chapter?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          accuracy_percentage: number | null
          attempts_count: number | null
          completed_at: string | null
          created_at: string
          id: string
          last_accessed_at: string | null
          learning_mode_used: string | null
          lesson_id: string
          status: string | null
          time_spent_seconds: number | null
          topic_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy_percentage?: number | null
          attempts_count?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          learning_mode_used?: string | null
          lesson_id: string
          status?: string | null
          time_spent_seconds?: number | null
          topic_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy_percentage?: number | null
          attempts_count?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          learning_mode_used?: string | null
          lesson_id?: string
          status?: string | null
          time_spent_seconds?: number | null
          topic_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
