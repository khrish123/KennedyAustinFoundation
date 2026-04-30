import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventForm } from "../../event-form"
import type { Event } from "@/types"

export const metadata: Metadata = {
  title: "Edit Event | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: eventData } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!eventData) notFound()

  return <EventForm eventData={eventData as Event} />
}
