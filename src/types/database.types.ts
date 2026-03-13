export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'parent' | 'babysitter'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          location: string | null
          lat: number | null
          lng: number | null
          hourly_rate: number | null
          years_experience: number | null
          certifications: string[] | null
          languages: string[] | null
          rating_avg: number | null
          rating_count: number | null
          is_admin: boolean
          is_banned: boolean
          created_at: string
        }
        Insert: {
          id: string
          role?: UserRole | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          lat?: number | null
          lng?: number | null
          hourly_rate?: number | null
          years_experience?: number | null
          certifications?: string[] | null
          languages?: string[] | null
          rating_avg?: number | null
          rating_count?: number | null
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          lat?: number | null
          lng?: number | null
          hourly_rate?: number | null
          years_experience?: number | null
          certifications?: string[] | null
          languages?: string[] | null
          rating_avg?: number | null
          rating_count?: number | null
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
        }
        Relationships: []
      }
      invite_tokens: {
        Row: {
          id: string
          token: string
          note: string | null
          assigned_email: string | null
          created_by: string
          used_by: string | null
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          token?: string
          note?: string | null
          assigned_email?: string | null
          created_by: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          token?: string
          note?: string | null
          assigned_email?: string | null
          created_by?: string
          used_by?: string | null
          used_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      availability: {
        Row: {
          id: string
          babysitter_id: string
          start_time: string
          end_time: string
          is_recurring: boolean
          recurrence_rule: string | null
        }
        Insert: {
          id?: string
          babysitter_id: string
          start_time: string
          end_time: string
          is_recurring?: boolean
          recurrence_rule?: string | null
        }
        Update: {
          id?: string
          babysitter_id?: string
          start_time?: string
          end_time?: string
          is_recurring?: boolean
          recurrence_rule?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          id: string
          parent_id: string
          babysitter_id: string | null
          start_time: string
          end_time: string
          status: BookingStatus
          notes: string | null
          total_price: number | null
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          babysitter_id?: string | null
          start_time: string
          end_time: string
          status?: BookingStatus
          notes?: string | null
          total_price?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          babysitter_id?: string | null
          start_time?: string
          end_time?: string
          status?: BookingStatus
          notes?: string | null
          total_price?: number | null
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment: string | null
          created_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          reviewer_id: string
          reviewee_id: string
          rating: number
          comment?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          booking_id?: string
          reviewer_id?: string
          reviewee_id?: string
          rating?: number
          comment?: string | null
          created_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          parent_id: string
          babysitter_id: string
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          babysitter_id: string
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          babysitter_id?: string
          created_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          body: string
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          body: string
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          body?: string
          read_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      booking_status: BookingStatus
    }
    CompositeTypes: Record<string, never>
  }
}
