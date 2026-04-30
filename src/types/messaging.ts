import type { SupportRequest, SupportRequestType, SupportRequestStatus } from "./index"

export type MessageDirection = "inbound" | "outbound"
export type EmailStatus = "sent" | "delivered" | "bounced" | "failed" | null

export interface SupportMessage {
  id: string
  support_request_id: string
  direction: MessageDirection
  body: string
  from_name: string | null
  from_email: string | null
  sent_by_admin_id: string | null
  email_provider_id: string | null
  email_status: EmailStatus
  email_error: string | null
  email_sent_at: string | null
  created_at: string
}

export interface SupportRequestWithSubject extends SupportRequest {
  subject: string | null
}

export type { SupportRequestType, SupportRequestStatus }

export interface SupportThread {
  request: SupportRequestWithSubject
  messages: SupportMessage[]
}
