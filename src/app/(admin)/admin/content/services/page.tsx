import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllServices } from "@/lib/queries/cms"
import { getIcon } from "@/lib/icon-registry"
import { ServiceRowActions } from "./service-row-actions"

export const metadata: Metadata = {
  title: "Services | Admin",
}

export default async function AdminServicesPage() {
  const { services, tableMissing } = await getAllServices()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Content
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Service offerings shown on the homepage and{" "}
            <Link href="/services" className="text-teal-700 hover:underline">
              /services
            </Link>
            .
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/services/new">
            <Plus className="mr-2 h-4 w-4" />
            New service
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
                supabase/migrations/011_about_services_cms.sql
              </code>
              .
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.length > 0 ? (
                services.map((s) => {
                  const Icon = getIcon(s.icon_name)
                  return (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg_color_class || "bg-teal-50"}`}
                        >
                          <Icon
                            className={`h-4 w-4 ${s.color_class || "text-teal-700"}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{s.title}</div>
                        {s.short_description && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                            {s.short_description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{s.order_index}</TableCell>
                      <TableCell className="font-mono text-xs">{s.slug}</TableCell>
                      <TableCell className="text-right">
                        <ServiceRowActions
                          id={s.id}
                          title={s.title}
                          isPublished={s.is_published}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No services yet.</p>
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
