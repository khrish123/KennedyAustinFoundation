import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getCampaignById,
  getActiveSubscriberCount,
  isEmailReady,
} from "@/lib/queries/campaigns"
import { CampaignForm } from "../../campaign-form"

export const metadata: Metadata = {
  title: "Edit campaign | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCampaignPage({ params }: PageProps) {
  const { id } = await params
  const [campaign, subscriberCount, emailReady] = await Promise.all([
    getCampaignById(id),
    getActiveSubscriberCount(),
    isEmailReady(),
  ])
  if (!campaign) notFound()
  return (
    <CampaignForm
      campaign={campaign}
      subscriberCount={subscriberCount}
      emailReady={emailReady}
    />
  )
}
