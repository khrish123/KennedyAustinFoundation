import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getServiceById } from "@/lib/queries/cms"
import { ServiceForm } from "../../service-form"

export const metadata: Metadata = {
  title: "Edit service | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params
  const service = await getServiceById(id)
  if (!service) notFound()
  return <ServiceForm service={service} />
}
