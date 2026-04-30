import { createClient } from "@/lib/supabase/server"
import { DEFAULT_FAQS, type Faq } from "@/types/faq"

export async function getPublishedFaqs(): Promise<Faq[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("order_index", { ascending: true })

    if (error || !data || data.length === 0) return DEFAULT_FAQS
    return data as Faq[]
  } catch {
    return DEFAULT_FAQS
  }
}

export async function getAllFaqs(): Promise<{
  faqs: Faq[]
  tableMissing: boolean
}> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("order_index", { ascending: true })

    if (error) {
      const tableMissing = /relation .* does not exist/i.test(error.message)
      return { faqs: [], tableMissing }
    }
    return { faqs: (data || []) as Faq[], tableMissing: false }
  } catch {
    return { faqs: [], tableMissing: false }
  }
}
