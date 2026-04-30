import { Metadata } from "next"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Mail, User, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { getThread } from "@/lib/queries/support"
import { FollowUpForm } from "../follow-up-form"

export const metadata: Metadata = {
  title: "Conversation",
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

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MessageThreadPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/messages/${id}`)

  const thread = await getThread(id)
  if (!thread) notFound()
  if (thread.request.user_id !== user.id) notFound()

  const { request, messages } = thread

  return (
    <div className="mx-auto max-w-3xl w-full">
        <Link
          href="/messages"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All messages
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {request.subject || "Conversation"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {request.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Started {formatDateTime(request.created_at)}
            </span>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((m) => {
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
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        {isInbound ? (
                          <>
                            <User className="h-4 w-4 text-slate-500" />
                            You
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 text-teal-700" />
                            Foundation
                          </>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(m.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 whitespace-pre-line">
                      {m.body}
                    </p>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Send a follow-up</CardTitle>
            <CardDescription>
              Your message goes to the foundation team. They&apos;ll reply here and
              you&apos;ll get an email notification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FollowUpForm requestId={request.id} />
          </CardContent>
        </Card>
    </div>
  )
}
