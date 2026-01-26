import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import {
  MessageSquare, Search, MoreHorizontal, Phone, Mail, Eye,
  CheckCircle, Clock, AlertCircle, User
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const metadata: Metadata = {
  title: "Support Requests | Admin",
}

function getStatusBadge(status: string) {
  switch (status) {
    case "new":
      return (
        <Badge className="bg-amber-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          New
        </Badge>
      )
    case "in_progress":
      return (
        <Badge className="bg-blue-500 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          In Progress
        </Badge>
      )
    case "resolved":
      return (
        <Badge className="bg-emerald-500 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Resolved
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

function getTypeBadge(type: string) {
  const colors: Record<string, string> = {
    crisis: "bg-red-500",
    general: "bg-gray-500",
    class_inquiry: "bg-blue-500",
    donation: "bg-emerald-500",
  }
  const labels: Record<string, string> = {
    crisis: "Crisis",
    general: "General",
    class_inquiry: "Class Inquiry",
    donation: "Donation",
  }
  return (
    <Badge className={colors[type] || "bg-gray-500"}>
      {labels[type] || type}
    </Badge>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function timeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export default async function AdminSupportPage() {
  const supabase = await createClient()

  // Fetch support requests
  const { data: requests } = await supabase
    .from("support_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  // Get stats
  const { count: totalRequests } = await supabase
    .from("support_requests")
    .select("*", { count: "exact", head: true })

  const { count: newCount } = await supabase
    .from("support_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")

  const { count: inProgressCount } = await supabase
    .from("support_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "in_progress")

  const { count: crisisCount } = await supabase
    .from("support_requests")
    .select("*", { count: "exact", head: true })
    .eq("type", "crisis")
    .eq("status", "new")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Support Requests</h1>
          <p className="text-muted-foreground mt-1">
            Manage incoming support and contact requests
          </p>
        </div>
      </div>

      {/* Crisis Alert */}
      {crisisCount && crisisCount > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-300">
                  {crisisCount} Crisis Request{crisisCount > 1 ? "s" : ""} Pending
                </p>
                <p className="text-sm text-red-600 dark:text-red-400">
                  These require immediate attention
                </p>
              </div>
              <Button className="ml-auto bg-red-500 hover:bg-red-600">
                View Crisis Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests || 0}</div>
          </CardContent>
        </Card>
        <Card className={newCount && newCount > 0 ? "border-amber-500" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{newCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{inProgressCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Being handled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {(totalRequests || 0) - (newCount || 0) - (inProgressCount || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All Status</Button>
              <Button variant="outline" size="sm">All Types</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contact</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests && requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id} className={request.type === "crisis" && request.status === "new" ? "bg-red-50 dark:bg-red-950/30" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{request.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {request.email}
                          </div>
                          {request.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {request.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(request.type)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                        {request.message}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">{timeAgo(request.created_at)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(request.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          {request.phone && (
                            <DropdownMenuItem>
                              <Phone className="mr-2 h-4 w-4" />
                              Call
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Clock className="mr-2 h-4 w-4" />
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No support requests</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Requests from the contact form will appear here
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
