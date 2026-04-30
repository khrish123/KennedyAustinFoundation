import { Metadata } from "next"
import { EventForm } from "../event-form"

export const metadata: Metadata = {
  title: "New Event | Admin",
}

export default function NewEventPage() {
  return <EventForm />
}
