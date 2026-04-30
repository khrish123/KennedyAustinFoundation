import { Metadata } from "next"
import { ServiceForm } from "../service-form"

export const metadata: Metadata = {
  title: "New service | Admin",
}

export default function NewServicePage() {
  return <ServiceForm />
}
