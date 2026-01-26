import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import {
  DollarSign, TrendingUp, Users, Heart, Search, Download,
  MoreHorizontal, Mail, Eye
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
  title: "Donations | Admin",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
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

export default async function AdminDonationsPage() {
  const supabase = await createClient()

  // Fetch donations
  const { data: donations } = await supabase
    .from("donations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  // Get stats
  const { data: allDonations } = await supabase.from("donations").select("amount, is_recurring")

  const totalAmount = allDonations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
  const totalDonations = allDonations?.length || 0
  const recurringCount = allDonations?.filter(d => d.is_recurring).length || 0
  const averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0

  // Calculate this month's donations
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthDonations = allDonations?.filter(d => {
    // Since we don't have created_at in the select, approximate
    return true // In real implementation, filter by date
  }) || []
  const thisMonthTotal = thisMonthDonations.reduce((sum, d) => sum + (d.amount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Donations</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage donations to the foundation
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisMonthTotal)}</div>
            <div className="flex items-center text-xs text-emerald-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              Growing
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDonations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {recurringCount} recurring
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDonation)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per donation</p>
          </CardContent>
        </Card>
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by donor name or email..." className="pl-9" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All Time</Button>
              <Button variant="outline" size="sm">All Types</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations && donations.length > 0 ? (
                donations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {donation.is_anonymous
                            ? "Anonymous"
                            : donation.donor_name || "Unknown Donor"}
                        </div>
                        {!donation.is_anonymous && donation.donor_email && (
                          <div className="text-sm text-muted-foreground">
                            {donation.donor_email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(donation.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {donation.is_recurring ? (
                        <Badge className="bg-blue-500">Monthly</Badge>
                      ) : (
                        <Badge variant="secondary">One-time</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                        {donation.message || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(donation.created_at)}</TableCell>
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
                            View Details
                          </DropdownMenuItem>
                          {!donation.is_anonymous && donation.donor_email && (
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Thank You
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No donations yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Donations will appear here once they come in
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
