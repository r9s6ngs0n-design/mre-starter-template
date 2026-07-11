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
      blog_posts: {
        Row: {
          archived_at: string | null
          author_id: string | null
          body: string | null
          category: string | null
          cover_image: string | null
          created_at: string
          excerpt: string | null
          faqs: Json
          id: string
          is_published: boolean
          keywords: string[]
          published_at: string | null
          read_time: number | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          author_id?: string | null
          body?: string | null
          category?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          faqs?: Json
          id?: string
          is_published?: boolean
          keywords?: string[]
          published_at?: string | null
          read_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          author_id?: string | null
          body?: string | null
          category?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt?: string | null
          faqs?: Json
          id?: string
          is_published?: boolean
          keywords?: string[]
          published_at?: string | null
          read_time?: number | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      cta_clicks: {
        Row: {
          created_at: string
          cta_label: string
          destination_url: string | null
          id: string
          page_path: string | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          cta_label: string
          destination_url?: string | null
          id?: string
          page_path?: string | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          cta_label?: string
          destination_url?: string | null
          id?: string
          page_path?: string | null
          session_id?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          display_order: number
          external_url: string | null
          file_url: string | null
          id: string
          is_active: boolean
          listing_id: string | null
          placements: string[]
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          listing_id?: string | null
          placements?: string[]
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          external_url?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          listing_id?: string | null
          placements?: string[]
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      document_placement_settings: {
        Row: {
          page_id: string
          placement: string
          section_order: number
          updated_at: string
        }
        Insert: {
          page_id: string
          placement: string
          section_order?: number
          updated_at?: string
        }
        Update: {
          page_id?: string
          placement?: string
          section_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          actor_id: string | null
          body: string | null
          created_at: string
          id: string
          lead_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          lead_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_statuses: {
        Row: {
          category: Database["public"]["Enums"]["lead_category"]
          display_order: number
          id: string
          label: string
          status: string
        }
        Insert: {
          category: Database["public"]["Enums"]["lead_category"]
          display_order?: number
          id?: string
          label: string
          status: string
        }
        Update: {
          category?: Database["public"]["Enums"]["lead_category"]
          display_order?: number
          id?: string
          label?: string
          status?: string
        }
        Relationships: []
      }
      lead_tasks: {
        Row: {
          assigned_to: string | null
          completed: boolean
          completed_at: string | null
          created_at: string
          due_at: string | null
          id: string
          lead_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          lead_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          lead_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          category: Database["public"]["Enums"]["lead_category"]
          contact_status: string
          created_at: string
          email: string
          enquiry_type: string
          full_name: string
          id: string
          listing_id: string | null
          mobile: string | null
          preferred_location: string | null
          requirements: string | null
          source: string | null
          status: string
          subtype: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          category: Database["public"]["Enums"]["lead_category"]
          contact_status?: string
          created_at?: string
          email: string
          enquiry_type: string
          full_name: string
          id?: string
          listing_id?: string | null
          mobile?: string | null
          preferred_location?: string | null
          requirements?: string | null
          source?: string | null
          status?: string
          subtype?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          category?: Database["public"]["Enums"]["lead_category"]
          contact_status?: string
          created_at?: string
          email?: string
          enquiry_type?: string
          full_name?: string
          id?: string
          listing_id?: string | null
          mobile?: string | null
          preferred_location?: string | null
          requirements?: string | null
          source?: string | null
          status?: string
          subtype?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_status_fk"
            columns: ["category", "status"]
            isOneToOne: false
            referencedRelation: "lead_statuses"
            referencedColumns: ["category", "status"]
          },
        ]
      }
      listing_inspection_times: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_cancelled: boolean
          listing_id: string
          notes: string | null
          starts_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_cancelled?: boolean
          listing_id: string
          notes?: string | null
          starts_at: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_cancelled?: boolean
          listing_id?: string
          notes?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_inspection_times_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          address: string | null
          amenities: string[]
          archived_at: string | null
          auction_at: string | null
          auction_cancelled: boolean
          auction_location: string | null
          auction_notes: string | null
          bathrooms: number | null
          bedrooms: number | null
          brochure_url: string | null
          carspaces: number | null
          category: Database["public"]["Enums"]["listing_category"]
          city_slug: string | null
          completion_date: string | null
          created_at: string
          description: string | null
          developer: string | null
          display_order: number
          featured: boolean
          floor_area_sqm: number | null
          floorplans: string[]
          headline: string | null
          id: string
          images: string[]
          intent_slugs: string[]
          is_published: boolean
          key_features: string[]
          listing_slug: string | null
          price_display: string | null
          price_max: number | null
          price_min: number | null
          property_type: string | null
          project_phase: string | null
          register_interest_enabled: boolean
          renders: string[]
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          suburb: string | null
          suburb_slug: string | null
          title: string
          type_slug: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          address?: string | null
          amenities?: string[]
          archived_at?: string | null
          auction_at?: string | null
          auction_cancelled?: boolean
          auction_location?: string | null
          auction_notes?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          brochure_url?: string | null
          carspaces?: number | null
          category: Database["public"]["Enums"]["listing_category"]
          city_slug?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          display_order?: number
          featured?: boolean
          floor_area_sqm?: number | null
          floorplans?: string[]
          headline?: string | null
          id?: string
          images?: string[]
          intent_slugs?: string[]
          is_published?: boolean
          key_features?: string[]
          listing_slug?: string | null
          price_display?: string | null
          price_max?: number | null
          price_min?: number | null
          property_type?: string | null
          project_phase?: string | null
          register_interest_enabled?: boolean
          renders?: string[]
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          suburb?: string | null
          suburb_slug?: string | null
          title: string
          type_slug?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          address?: string | null
          amenities?: string[]
          archived_at?: string | null
          auction_at?: string | null
          auction_cancelled?: boolean
          auction_location?: string | null
          auction_notes?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          brochure_url?: string | null
          carspaces?: number | null
          category?: Database["public"]["Enums"]["listing_category"]
          city_slug?: string | null
          completion_date?: string | null
          created_at?: string
          description?: string | null
          developer?: string | null
          display_order?: number
          featured?: boolean
          floor_area_sqm?: number | null
          floorplans?: string[]
          headline?: string | null
          id?: string
          images?: string[]
          intent_slugs?: string[]
          is_published?: boolean
          key_features?: string[]
          listing_slug?: string | null
          price_display?: string | null
          price_max?: number | null
          price_min?: number | null
          property_type?: string | null
          project_phase?: string | null
          register_interest_enabled?: boolean
          renders?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          suburb?: string | null
          suburb_slug?: string | null
          title?: string
          type_slug?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          interest: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [        ]
      }
      page_sections: {
        Row: {
          content: Json
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          page_id: string
          section_key: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          page_id: string
          section_key: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          page_id?: string
          section_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_queries: {
        Row: {
          created_at: string
          id: string
          query: string
          result_count: number | null
          session_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          result_count?: number | null
          session_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          result_count?: number | null
          session_id?: string | null
        }
        Relationships: []
      }
      team_members: {
        Row: {
          archived_at: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_order: number
          email: string | null
          id: string
          is_published: boolean
          linkedin_url: string | null
          name: string
          phone: string | null
          role_title: string | null
          slug: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          id?: string
          is_published?: boolean
          linkedin_url?: string | null
          name: string
          phone?: string | null
          role_title?: string | null
          slug: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_order?: number
          email?: string | null
          id?: string
          is_published?: boolean
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          role_title?: string | null
          slug?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          archived_at: string | null
          client_name: string
          client_type: string | null
          created_at: string
          display_order: number
          id: string
          is_published: boolean
          quote: string
          rating: number
          suburb: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          client_name: string
          client_type?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          quote: string
          rating?: number
          suburb?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          client_name?: string
          client_type?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_published?: boolean
          quote?: string
          rating?: number
          suburb?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_bookings: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favourites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favourites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inspections: {
        Row: {
          created_at: string
          id: string
          inspection_date: string
          inspection_time: string
          listing_id: string
          notes: string | null
          status: Database["public"]["Enums"]["inspection_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inspection_date: string
          inspection_time: string
          listing_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["inspection_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inspection_date?: string
          inspection_time?: string
          listing_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["inspection_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inspections_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          suspended_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          suspended_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          suspended_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      is_site_user: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      inspection_status: "registered" | "attended" | "cancelled"
      lead_category: "buyer" | "vendor" | "landlord" | "tenant"
      listing_category: "project" | "buy" | "commercial" | "rent"
      listing_status:
        | "available"
        | "under_offer"
        | "sold"
        | "leased"
        | "coming_soon"
      user_role: "admin" | "agent" | "user"
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
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      inspection_status: ["registered", "attended", "cancelled"],
      lead_category: ["buyer", "vendor", "landlord", "tenant"],
      listing_category: ["project", "buy", "commercial", "rent"],
      listing_status: [
        "available",
        "under_offer",
        "sold",
        "leased",
        "coming_soon",
      ],
      user_role: ["admin", "agent", "user"],
    },
  },
} as const

/** Convenience aliases — prefer these over re-declaring Enums<'…'> at call sites. */
export type ListingCategory = Enums<'listing_category'>
export type ListingStatus = Enums<'listing_status'>
export type LeadCategory = Enums<'lead_category'>
export type UserRole = Enums<'user_role'>
export type BookingStatus = Enums<'booking_status'>
export type InspectionStatus = Enums<'inspection_status'>
