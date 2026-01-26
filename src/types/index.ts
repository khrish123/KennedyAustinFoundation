// User & Profile Types
export type UserRole = 'user' | 'instructor' | 'admin' | 'super_admin'

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: UserRole
  language_preference: string
  notification_preferences: NotificationPreferences
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  email_marketing: boolean
  email_updates: boolean
  push_notifications: boolean
  sms_notifications: boolean
}

// Class Types
export type ClassCategory = 'grief' | 'dv' | 'self_help' | 'therapy' | 'wellness'
export type ClassType = 'live' | 'recorded' | 'in_person'
export type EnrollmentStatus = 'enrolled' | 'completed' | 'dropped'

export interface Class {
  id: string
  title: string
  slug: string
  description: string
  category: ClassCategory
  type: ClassType
  instructor_id: string
  instructor?: Profile
  thumbnail_url: string | null
  price: number
  duration_minutes: number
  max_participants: number | null
  schedule: ClassSchedule | null
  location: string | null
  zoom_link: string | null
  video_url: string | null
  is_published: boolean
  translations: Record<string, ClassTranslation>
  created_at: string
  updated_at: string
}

export interface ClassSchedule {
  start_date: string
  end_date?: string
  days_of_week?: number[]
  time: string
  timezone: string
  recurring: boolean
}

export interface ClassTranslation {
  title: string
  description: string
}

export interface Lesson {
  id: string
  class_id: string
  title: string
  description: string | null
  video_url: string | null
  order_index: number
  duration_minutes: number
  resources: LessonResource[]
}

export interface LessonResource {
  title: string
  type: 'pdf' | 'link' | 'video'
  url: string
}

export interface Enrollment {
  id: string
  user_id: string
  class_id: string
  status: EnrollmentStatus
  progress_percent: number
  payment_id: string | null
  enrolled_at: string
  completed_at: string | null
  class?: Class
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  watch_time_seconds: number
  completed_at: string | null
}

// Journal Types
export interface JournalEntry {
  id: string
  user_id: string
  title: string
  content: string
  mood: number
  tags: string[]
  is_private: boolean
  created_at: string
  updated_at: string
}

// Forum Types
export interface ForumCategory {
  id: string
  name: string
  slug: string
  description: string
  order_index: number
}

export interface ForumPost {
  id: string
  category_id: string
  user_id: string
  title: string
  content: string
  is_pinned: boolean
  is_anonymous: boolean
  created_at: string
  updated_at: string
  user?: Profile
  category?: ForumCategory
  _count?: {
    comments: number
  }
}

export interface ForumComment {
  id: string
  post_id: string
  user_id: string
  content: string
  parent_id: string | null
  is_anonymous: boolean
  created_at: string
  user?: Profile
}

// Chat Types
export interface ChatSession {
  id: string
  user_id: string
  started_at: string
  ended_at: string | null
}

export interface ChatMessage {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
}

// Donation Types
export interface Donation {
  id: string
  user_id: string | null
  amount: number
  currency: string
  stripe_payment_id: string
  is_recurring: boolean
  donor_name: string
  donor_email: string
  message: string | null
  is_anonymous: boolean
  created_at: string
}

// Subscription Types
export type SubscriptionPlan = 'basic' | 'premium' | 'professional'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  plan_type: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string
  current_period_end: string
  canceled_at: string | null
}

// Campaign Types
export type CampaignType = 'email' | 'push' | 'social'
export type CampaignStatus = 'draft' | 'scheduled' | 'sent' | 'completed'

export interface Campaign {
  id: string
  title: string
  type: CampaignType
  status: CampaignStatus
  content: CampaignContent
  images: string[]
  target_audience: TargetAudience
  scheduled_at: string | null
  sent_at: string | null
  stats: CampaignStats
  created_by: string
  created_at: string
}

export interface CampaignContent {
  subject?: string
  body: string
  cta_text?: string
  cta_url?: string
}

export interface TargetAudience {
  roles?: UserRole[]
  enrolled_in_category?: ClassCategory[]
  language?: string[]
  all_subscribers?: boolean
}

export interface CampaignStats {
  sent: number
  delivered: number
  opened: number
  clicked: number
  unsubscribed: number
}

// Subscriber Types
export interface Subscriber {
  id: string
  email: string
  name: string | null
  user_id: string | null
  subscribed_categories: string[]
  is_active: boolean
  unsubscribed_at: string | null
  created_at: string
}

// Daily Inspiration Types
export interface DailyInspiration {
  id: string
  content: string
  category: string
  language: string
  generated_at: string
  is_active: boolean
}

// Resource Types
export type ResourceType = 'article' | 'video' | 'pdf' | 'link'

export interface Resource {
  id: string
  title: string
  description: string
  category: string
  type: ResourceType
  url: string | null
  content: string | null
  is_crisis_resource: boolean
  translations: Record<string, ResourceTranslation>
  created_at: string
}

export interface ResourceTranslation {
  title: string
  description: string
  content?: string
}

// Event Types
export interface Event {
  id: string
  title: string
  description: string
  date: string
  location: string
  image_url: string | null
  registration_required: boolean
  max_attendees: number | null
  created_at: string
}

// Support Request Types
export type SupportRequestType = 'general' | 'crisis' | 'class_inquiry' | 'donation'
export type SupportRequestStatus = 'new' | 'in_progress' | 'resolved'

export interface SupportRequest {
  id: string
  user_id: string | null
  name: string
  email: string
  phone: string | null
  type: SupportRequestType
  message: string
  status: SupportRequestStatus
  assigned_to: string | null
  created_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}
