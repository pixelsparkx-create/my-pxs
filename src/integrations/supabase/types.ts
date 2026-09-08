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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string
          email: string
        }
        Insert: {
          created_at?: string
          email: string
        }
        Update: {
          created_at?: string
          email?: string
        }
        Relationships: []
      }
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          created_at: string
          detail: string | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_email?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_email?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      contact_events: {
        Row: {
          business_name: string | null
          client_name: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          goldie_session_id: string | null
          id: string
          kind: string
          lead_id: string | null
          message: string | null
          metadata: Json
          plan_id: string | null
          priority: string
          project: string | null
          recommended_plan: string | null
          source: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          goldie_session_id?: string | null
          id?: string
          kind?: string
          lead_id?: string | null
          message?: string | null
          metadata?: Json
          plan_id?: string | null
          priority?: string
          project?: string | null
          recommended_plan?: string | null
          source: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          goldie_session_id?: string | null
          id?: string
          kind?: string
          lead_id?: string | null
          message?: string | null
          metadata?: Json
          plan_id?: string | null
          priority?: string
          project?: string | null
          recommended_plan?: string | null
          source?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "goldie_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      error_events: {
        Row: {
          admin_notes: string | null
          category: string
          context: Json
          created_at: string
          environment: string
          feature: string
          fingerprint: string
          first_seen: string
          goldie_session_id: string | null
          id: string
          last_seen: string
          lead_id: string | null
          message: string
          occurrences: number
          operation: string | null
          proposal_id: string | null
          resolved_at: string | null
          route: string | null
          severity: string
          side: string
          stack: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          context?: Json
          created_at?: string
          environment?: string
          feature?: string
          fingerprint: string
          first_seen?: string
          goldie_session_id?: string | null
          id?: string
          last_seen?: string
          lead_id?: string | null
          message: string
          occurrences?: number
          operation?: string | null
          proposal_id?: string | null
          resolved_at?: string | null
          route?: string | null
          severity?: string
          side?: string
          stack?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          context?: Json
          created_at?: string
          environment?: string
          feature?: string
          fingerprint?: string
          first_seen?: string
          goldie_session_id?: string | null
          id?: string
          last_seen?: string
          lead_id?: string | null
          message?: string
          occurrences?: number
          operation?: string | null
          proposal_id?: string | null
          resolved_at?: string | null
          route?: string | null
          severity?: string
          side?: string
          stack?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "error_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "goldie_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      error_occurrences: {
        Row: {
          context: Json
          created_at: string
          error_id: string
          id: string
          route: string | null
        }
        Insert: {
          context?: Json
          created_at?: string
          error_id: string
          id?: string
          route?: string | null
        }
        Update: {
          context?: Json
          created_at?: string
          error_id?: string
          id?: string
          route?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_occurrences_error_id_fkey"
            columns: ["error_id"]
            isOneToOne: false
            referencedRelation: "error_events"
            referencedColumns: ["id"]
          },
        ]
      }
      goldie_leads: {
        Row: {
          admin_notes: string | null
          business_name: string | null
          business_type: string | null
          client_name: string | null
          contact_email: string | null
          contact_phone: string | null
          conversation_summary: string | null
          created_at: string
          estimated_range: string | null
          id: string
          last_contacted_at: string | null
          lead_score: number
          location: string | null
          priority: string
          project_state: Json
          project_type: string | null
          proposal_markdown: string | null
          recommended_plan: string | null
          status: string
          timeline: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          business_name?: string | null
          business_type?: string | null
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          conversation_summary?: string | null
          created_at?: string
          estimated_range?: string | null
          id?: string
          last_contacted_at?: string | null
          lead_score?: number
          location?: string | null
          priority?: string
          project_state?: Json
          project_type?: string | null
          proposal_markdown?: string | null
          recommended_plan?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          business_name?: string | null
          business_type?: string | null
          client_name?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          conversation_summary?: string | null
          created_at?: string
          estimated_range?: string | null
          id?: string
          last_contacted_at?: string | null
          lead_score?: number
          location?: string | null
          priority?: string
          project_state?: Json
          project_type?: string | null
          proposal_markdown?: string | null
          recommended_plan?: string | null
          status?: string
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_followups: {
        Row: {
          completed_at: string | null
          created_at: string
          failure_reason: string | null
          followup_type: string
          id: string
          lead_id: string
          notes: string | null
          proposal_id: string | null
          rescheduled_at: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          failure_reason?: string | null
          followup_type?: string
          id?: string
          lead_id: string
          notes?: string | null
          proposal_id?: string | null
          rescheduled_at?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          failure_reason?: string | null
          followup_type?: string
          id?: string
          lead_id?: string
          notes?: string | null
          proposal_id?: string | null
          rescheduled_at?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_followups_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "goldie_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_followups_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          actor: string | null
          created_at: string
          detail: string | null
          event_type: string
          from_status: string | null
          id: string
          payment_request_id: string
          to_status: string | null
        }
        Insert: {
          actor?: string | null
          created_at?: string
          detail?: string | null
          event_type: string
          from_status?: string | null
          id?: string
          payment_request_id: string
          to_status?: string | null
        }
        Update: {
          actor?: string | null
          created_at?: string
          detail?: string | null
          event_type?: string
          from_status?: string | null
          id?: string
          payment_request_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_payment_request_id_fkey"
            columns: ["payment_request_id"]
            isOneToOne: false
            referencedRelation: "payment_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_requests: {
        Row: {
          amount: number
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: string | null
          expires_at: string | null
          flutterwave_payment_link: string | null
          flutterwave_reference: string | null
          flutterwave_transaction_id: string | null
          id: string
          internal_note: string | null
          lead_id: string | null
          paid_at: string | null
          payment_type: string
          project_name: string | null
          project_type: string | null
          request_code: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          expires_at?: string | null
          flutterwave_payment_link?: string | null
          flutterwave_reference?: string | null
          flutterwave_transaction_id?: string | null
          id?: string
          internal_note?: string | null
          lead_id?: string | null
          paid_at?: string | null
          payment_type?: string
          project_name?: string | null
          project_type?: string | null
          request_code: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_email?: string | null
          client_name?: string | null
          client_phone?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: string | null
          expires_at?: string | null
          flutterwave_payment_link?: string | null
          flutterwave_reference?: string | null
          flutterwave_transaction_id?: string | null
          id?: string
          internal_note?: string | null
          lead_id?: string | null
          paid_at?: string | null
          payment_type?: string
          project_name?: string | null
          project_type?: string | null
          request_code?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_requests_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "goldie_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          answers: Json
          base_price: number
          business_name: string | null
          client_name: string | null
          complexity_factors: Json
          created_at: string
          currency: string
          design_direction: string | null
          estimate_max: number
          estimate_min: number
          goldie_session_id: string | null
          id: string
          industry: string | null
          lead_id: string | null
          project_goal: string | null
          rationale: string | null
          recommended_plan: string
          reference: string
          required_features: Json
          required_integrations: Json
          required_pages: Json
          share_count: number
          status: string
          target_audience: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          answers?: Json
          base_price?: number
          business_name?: string | null
          client_name?: string | null
          complexity_factors?: Json
          created_at?: string
          currency?: string
          design_direction?: string | null
          estimate_max?: number
          estimate_min?: number
          goldie_session_id?: string | null
          id?: string
          industry?: string | null
          lead_id?: string | null
          project_goal?: string | null
          rationale?: string | null
          recommended_plan?: string
          reference: string
          required_features?: Json
          required_integrations?: Json
          required_pages?: Json
          share_count?: number
          status?: string
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          answers?: Json
          base_price?: number
          business_name?: string | null
          client_name?: string | null
          complexity_factors?: Json
          created_at?: string
          currency?: string
          design_direction?: string | null
          estimate_max?: number
          estimate_min?: number
          goldie_session_id?: string | null
          id?: string
          industry?: string | null
          lead_id?: string | null
          project_goal?: string | null
          rationale?: string | null
          recommended_plan?: string
          reference?: string
          required_features?: Json
          required_integrations?: Json
          required_pages?: Json
          share_count?: number
          status?: string
          target_audience?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_plans_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "goldie_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      project_baselines: {
        Row: {
          base_appreciations: number
          base_live_visits: number
          base_views: number
          created_at: string
          project_id: string
        }
        Insert: {
          base_appreciations: number
          base_live_visits: number
          base_views: number
          created_at?: string
          project_id: string
        }
        Update: {
          base_appreciations?: number
          base_live_visits?: number
          base_views?: number
          created_at?: string
          project_id?: string
        }
        Relationships: []
      }
      project_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          project_id: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          project_id: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          project_id?: string
          visitor_id?: string
        }
        Relationships: []
      }
      proposal_versions: {
        Row: {
          change_summary: string | null
          created_at: string
          editor_email: string | null
          id: string
          new_pricing: string | null
          previous_pricing: string | null
          proposal_id: string
          snapshot: Json
          version: number
        }
        Insert: {
          change_summary?: string | null
          created_at?: string
          editor_email?: string | null
          id?: string
          new_pricing?: string | null
          previous_pricing?: string | null
          proposal_id: string
          snapshot?: Json
          version: number
        }
        Update: {
          change_summary?: string | null
          created_at?: string
          editor_email?: string | null
          id?: string
          new_pricing?: string | null
          previous_pricing?: string | null
          proposal_id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposal_versions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          accent_color: string
          assets: Json
          client_name: string | null
          created_at: string
          description: string | null
          estimated_range: string | null
          id: string
          lead_id: string | null
          logo_url: string | null
          notes: string | null
          official_quote: string | null
          project_name: string | null
          recommended_plan: string | null
          reference: string
          secondary_color: string
          sections: Json
          status: string
          subtitle: string | null
          support_period: string | null
          template: string
          terms: string | null
          timeline: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          accent_color?: string
          assets?: Json
          client_name?: string | null
          created_at?: string
          description?: string | null
          estimated_range?: string | null
          id?: string
          lead_id?: string | null
          logo_url?: string | null
          notes?: string | null
          official_quote?: string | null
          project_name?: string | null
          recommended_plan?: string | null
          reference?: string
          secondary_color?: string
          sections?: Json
          status?: string
          subtitle?: string | null
          support_period?: string | null
          template?: string
          terms?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Update: {
          accent_color?: string
          assets?: Json
          client_name?: string | null
          created_at?: string
          description?: string | null
          estimated_range?: string | null
          id?: string
          lead_id?: string | null
          logo_url?: string | null
          notes?: string | null
          official_quote?: string | null
          project_name?: string | null
          recommended_plan?: string | null
          reference?: string
          secondary_color?: string
          sections?: Json
          status?: string
          subtitle?: string | null
          support_period?: string | null
          template?: string
          terms?: string | null
          timeline?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "goldie_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          approved: boolean
          created_at: string
          display_name: string
          full_name: string
          id: string
          message: string
          rating: number
          title: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          display_name: string
          full_name: string
          id?: string
          message: string
          rating: number
          title: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          display_name?: string
          full_name?: string
          id?: string
          message?: string
          rating?: number
          title?: string
        }
        Relationships: []
      }
      transcript_exports: {
        Row: {
          created_at: string
          created_by: string | null
          export_type: string
          filename: string
          format: string
          goldie_session_id: string | null
          id: string
          lead_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          export_type?: string
          filename: string
          format?: string
          goldie_session_id?: string | null
          id?: string
          lead_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          export_type?: string
          filename?: string
          format?: string
          goldie_session_id?: string | null
          id?: string
          lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transcript_exports_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "goldie_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_draft_proposal: {
        Args: {
          _client_name: string
          _description: string
          _estimated_range: string
          _lead_id: string
          _project_name: string
          _recommended_plan: string
          _sections?: Json
          _timeline: string
          _title: string
        }
        Returns: string
      }
      ensure_project_baseline: {
        Args: { _project_id: string }
        Returns: undefined
      }
      generate_payment_code: { Args: never; Returns: string }
      get_project_engagement: {
        Args: { _project_ids: string[] }
        Returns: {
          appreciations: number
          live_visits: number
          project_id: string
          views: number
        }[]
      }
      get_public_payment_request: {
        Args: { _code: string }
        Returns: {
          amount: number
          client_name: string
          created_at: string
          currency: string
          description: string
          expires_at: string
          paid_at: string
          payment_type: string
          project_name: string
          project_type: string
          request_code: string
          status: string
        }[]
      }
      get_shared_plan: { Args: { _reference: string }; Returns: Json }
      has_appreciated: {
        Args: { _project_id: string; _visitor_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      log_error_event: {
        Args: {
          _category?: string
          _context?: Json
          _environment?: string
          _feature?: string
          _fingerprint: string
          _goldie_session_id?: string
          _lead_id?: string
          _message: string
          _operation?: string
          _proposal_id?: string
          _route?: string
          _severity?: string
          _side?: string
          _stack?: string
        }
        Returns: string
      }
      mark_plan_shared: { Args: { _reference: string }; Returns: undefined }
      record_project_interaction: {
        Args: {
          _interaction_type: string
          _project_id: string
          _visitor_id: string
        }
        Returns: {
          appreciations: number
          live_visits: number
          project_id: string
          views: number
        }[]
      }
      submit_plan: {
        Args: {
          _client_name?: string
          _contact_email?: string
          _contact_phone?: string
          _note?: string
          _reference: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
