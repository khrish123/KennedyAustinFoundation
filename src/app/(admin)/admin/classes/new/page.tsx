import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { ClassForm } from "../class-form"

export const metadata: Metadata = {
  title: "New Class | Admin",
}

export default async function NewClassPage() {
  const supabase = await createClient()
  const { data: instructors } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .in("role", ["instructor", "admin", "super_admin"])
    .order("full_name", { ascending: true })

  return <ClassForm instructors={instructors || []} />
}
