import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  BookOpen, Plus, Search, MoreHorizontal, Video, MapPin, Eye, Edit, Trash2,
  Users, Clock
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
  title: "Class Management | Admin",
}

function getTypeIcon(type: string) {
  switch (type) {
    case "live":
      return <Video className="h-4 w-4" />
    case "in_person":
      return <MapPin className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "live":
      return "Live"
    case "recorded":
      return "Recorded"
    case "in_person":
      return "In-Person"
    default:
      return type
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    grief: "Grief & Loss",
    dv: "Domestic Violence",
    self_help: "Self-Help",
    therapy: "Therapy",
    wellness: "Wellness",
    youth: "Youth",
  }
  return labels[category] || category
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default async function AdminClassesPage() {
  const supabase = await createClient()

  // Fetch classes
  const { data: classes } = await supabase
    .from("classes")
    .select(`
      *,
      instructor:profiles(full_name)
    `)
    .order("created_at", { ascending: false })

  // Get stats
  const { count: totalClasses } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })

  const { count: publishedCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: enrollmentsCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Class Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage classes and workshops
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/classes/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Class
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClasses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalClasses || 0) - (publishedCount || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollmentsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Classes Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search classes..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All Categories</Button>
              <Button variant="outline" size="sm">All Types</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes && classes.length > 0 ? (
                classes.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{classItem.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {classItem.instructor?.full_name || "No instructor"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getTypeIcon(classItem.type)}
                        {getTypeLabel(classItem.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryLabel(classItem.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {classItem.price === 0 ? (
                        <Badge className="bg-emerald-500">Free</Badge>
                      ) : (
                        <span>${classItem.price}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {classItem.is_published ? (
                        <Badge className="bg-emerald-500">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(classItem.created_at)}</TableCell>
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
                            View Class
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="mr-2 h-4 w-4" />
                            View Enrollments
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No classes yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first class to get started
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/admin/classes/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Class
                      </Link>
                    </Button>
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
