import { Metadata } from "next"
import Link from "next/link"
import { MessageSquare, ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMyRequests } from "@/lib/queries/support"

export const metadata: Metadata = {
  title: "My Messages",
}

function statusBadge(status: string) {
  switch (status) {
    case "new":
      return <Badge className="bg-amber-500 text-xs">New</Badge>
    case "in_progress":
      return <Badge className="bg-blue-500 text-xs">In progress</Badge>
    case "resolved":
      return <Badge variant="secondary" className="text-xs">Resolved</Badge>
    default:
      return <Badge variant="outline" className="text-xs">{status}</Badge>
  }
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

export default async function MyMessagesPage() {
  const requests = await getMyRequests()

  return (
    <div className="mx-auto max-w-4xl w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Messages
            </h1>
            <p className="text-slate-600">
              Conversations with the Kennedy Austin Foundation team.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/contact">
              <Plus className="mr-2 h-4 w-4" />
              New message
            </Link>
          </Button>
        </div>

        {requests.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
              <p className="font-medium text-slate-900">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Reach out via the contact form and your conversation will appear here.
              </p>
              <Button asChild>
                <Link href="/contact">Start a conversation</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <Link key={req.id} href={`/messages/${req.id}`} className="block">
                <Card className="hover:border-teal-300 transition">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">
                          {req.subject || "Untitled conversation"}
                        </CardTitle>
                        <CardDescription className="line-clamp-1 mt-1">
                          {req.message}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {statusBadge(req.status)}
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(req.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <span className="inline-flex items-center text-sm text-teal-700">
                      Open conversation
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
