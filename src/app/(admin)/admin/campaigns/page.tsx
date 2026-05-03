import { Metadata } from "next"
import Link from "next/link"
import { Mail, Plus, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getAllCampaigns,
  getActiveSubscriberCount,
  isEmailReady,
} from "@/lib/queries/campaigns"

export const metadata: Metadata = {
  title: "Campaigns | Admin",
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function statusBadge(status: string) {
  switch (status) {
    case "sent":
      return <Badge className="bg-emerald-500">Sent</Badge>
    case "scheduled":
      return <Badge className="bg-blue-500">Scheduled</Badge>
    case "completed":
      return <Badge className="bg-emerald-500">Completed</Badge>
    case "draft":
    default:
      return (
        <Badge variant="secondary" className="bg-slate-200 text-slate-800">
          Draft
        </Badge>
      )
  }
}

export default async function AdminCampaignsPage() {
  const [{ campaigns, tableMissing }, subscriberCount, emailReady] =
    await Promise.all([
      getAllCampaigns(),
      getActiveSubscriberCount(),
      isEmailReady(),
    ])

  const sentCount = campaigns.filter((c) => c.status === "sent").length
  const draftCount = campaigns.filter((c) => c.status === "draft").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground">
            Send email newsletters to your subscriber list.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/new">
            <Plus className="mr-2 h-4 w-4" />
            New campaign
          </Link>
        </Button>
      </div>

      {tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Database table not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/001_initial_schema.sql
              </code>{" "}
              first — it includes the <code>campaigns</code> + <code>subscribers</code>{" "}
              tables.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!emailReady && !tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Email transport not configured
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Save SMTP or a Resend API key at{" "}
              <Link
                href="/admin/settings/email"
                className="underline font-medium"
              >
                Settings → Email
              </Link>{" "}
              before sending. You can still create and save drafts.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriberCount}</div>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentCount}</div>
            <p className="text-xs text-muted-foreground">Total campaigns sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="py-10 text-center">
              <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                No campaigns yet — create your first one.
              </p>
              <Button asChild>
                <Link href="/admin/campaigns/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New campaign
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => {
                  const stats = (c.stats || {}) as {
                    sent?: number
                    failed?: number
                    attempted?: number
                  }
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium">{c.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {(c.content as { subject?: string })?.subject || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                      <TableCell>
                        {c.status === "sent" ? (
                          <span className="text-sm">
                            {stats.sent ?? 0}
                            {stats.failed ? (
                              <span className="text-rose-700">
                                {" "}
                                · {stats.failed} failed
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(c.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/campaigns/${c.id}/edit`}>
                            {c.status === "draft" ? (
                              <>
                                <Send className="h-3.5 w-3.5 mr-1" />
                                Open
                              </>
                            ) : (
                              "View"
                            )}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
