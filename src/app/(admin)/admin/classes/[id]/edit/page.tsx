import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ClassForm } from "../../class-form"
import type { Class } from "@/types"

export const metadata: Metadata = {
  title: "Edit Class | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditClassPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: classData }, { data: instructors }] = await Promise.all([
    supabase.from("classes").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("profiles")
      .select("id, full_name, role")
      .in("role", ["instructor", "admin", "super_admin"])
      .order("full_name", { ascending: true }),
  ])

  if (!classData) notFound()

  return (
    <ClassForm
      classData={classData as Class}
      instructors={instructors || []}
    />
  )
}
