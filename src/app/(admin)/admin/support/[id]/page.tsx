import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Phone, Mail, User, Clock, AlertCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getThread } from "@/lib/queries/support"
import { ReplyForm } from "./reply-form"
import { StatusControl } from "./status-control"

export const metadata: Metadata = {
  title: "Support Request | Admin",
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function emailStatusBadge(status: string | null, error: string | null) {
  if (!status) return null
  if (status === "sent" || status === "delivered") {
    return <Badge className="bg-emerald-500 text-xs">Email sent</Badge>
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="text-xs" title={error || undefined}>
        Email failed
      </Badge>
    )
  }
  return (
    <Badge variant="secondary" className="text-xs">
      {status}
    </Badge>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminSupportDetailPage({ params }: PageProps) {
  const { id } = await params
  const thread = await getThread(id)

  if (!thread) notFound()

  const { request, messages } = thread

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/support"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All requests
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {request.subject || "Support request"}
            </h1>
            <p className="text-muted-foreground">
              From {request.name} · {formatDateTime(request.created_at)}
            </p>
          </div>
          <StatusControl requestId={request.id} status={request.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation</CardTitle>
              <CardDescription>
                Most recent messages at the bottom. The user can also see this thread
                in their account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No messages yet.
                </p>
              )}
              {messages.map((m) => {
                const isInbound = m.direction === "inbound"
                return (
                  <div
                    key={m.id}
                    className={
                      isInbound
                        ? "rounded-lg border border-slate-200 bg-slate-50 p-4"
                        : "rounded-lg border border-teal-200 bg-teal-50 p-4 ml-6"
                    }
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        {isInbound ? (
                          <>
                            <User className="h-4 w-4 text-slate-500" />
                            <span>
                              {m.from_name || request.name}
                              {m.from_email && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  &lt;{m.from_email}&gt;
                                </span>
                              )}
                            </span>
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 text-teal-700" />
                            <span>Foundation reply</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {emailStatusBadge(m.email_status, m.email_error)}
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(m.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-line">
                      {m.body}
                    </p>
                    {m.email_provider_id && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Resend ID: <code>{m.email_provider_id}</code>
                      </p>
                    )}
                    {m.email_error && (
                      <p className="mt-2 text-xs text-rose-700 inline-flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {m.email_error}
                      </p>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reply</CardTitle>
              <CardDescription>
                Sends an email to {request.email} and stores the reply in this
                thread.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReplyForm
                requestId={request.id}
                recipientEmail={request.email}
                recipientName={request.name}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${request.email}`}
                  className="text-teal-700 hover:underline truncate"
                >
                  {request.email}
                </a>
              </div>
              {request.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${request.phone}`}
                    className="text-teal-700 hover:underline"
                  >
                    {request.phone}
                  </a>
                </div>
              )}
              <Separator />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <Badge variant="outline" className="text-xs">
                    {request.type}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="text-xs">
                    {request.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">User account</span>
                  <span className="text-xs">
                    {request.user_id ? "Linked" : "Guest"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
