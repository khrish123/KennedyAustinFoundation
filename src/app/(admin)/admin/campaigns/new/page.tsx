import { Metadata } from "next"
import {
  getActiveSubscriberCount,
  isEmailReady,
} from "@/lib/queries/campaigns"
import { CampaignForm } from "../campaign-form"

export const metadata: Metadata = {
  title: "New campaign | Admin",
}

export default async function NewCampaignPage() {
  const [subscriberCount, emailReady] = await Promise.all([
    getActiveSubscriberCount(),
    isEmailReady(),
  ])
  return (
    <CampaignForm
      subscriberCount={subscriberCount}
      emailReady={emailReady}
    />
  )
}
