export interface Faq {
  id: string
  question: string
  answer: string
  category: string | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export const DEFAULT_FAQS: Faq[] = [
  {
    id: "default-1",
    question: "Are your classes really free?",
    answer:
      "Most of our core classes — grief recovery, crisis support, youth programs — are free. A small number of specialized programs are paid; pricing is shown on each class page.",
    category: null,
    order_index: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "default-2",
    question: "What should I do if I'm in crisis right now?",
    answer:
      "If you are in immediate danger or having thoughts of suicide, call 988 (US Suicide & Crisis Lifeline) or 911. You can also call our line at 909-808-6866 during business hours.",
    category: null,
    order_index: 2,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
