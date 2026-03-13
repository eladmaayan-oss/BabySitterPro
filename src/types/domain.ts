import type { Database, UserRole, BookingStatus } from './database.types'

export type { UserRole, BookingStatus }

export type Profile = Database['public']['Tables']['profiles']['Row']
export type InviteToken = Database['public']['Tables']['invite_tokens']['Row']

export interface AdminUser {
  id: string
  full_name: string | null
  role: UserRole | null
  is_admin: boolean
  is_banned: boolean
  email: string
  created_at: string
}
export type Availability = Database['public']['Tables']['availability']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export interface BookingWithProfiles extends Booking {
  parent: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  babysitter: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'hourly_rate'> | null
}

export interface ConversationWithProfiles extends Conversation {
  parent: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  babysitter: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  last_message?: Pick<Message, 'body' | 'created_at' | 'sender_id'>
  unread_count?: number
}
