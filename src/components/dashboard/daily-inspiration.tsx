import { Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getRandomInspiration } from "@/lib/queries/inspirations"

/**
 * Server component that fetches a random active daily inspiration and
 * renders it as a small card. If nothing is configured, falls back to a
 * default message rather than nothing — keeps the dashboard from feeling
 * empty out-of-the-box.
 */
export async function DailyInspiration() {
  const inspiration = await getRandomInspiration()

  const content =
    inspiration?.content ||
    "Every sunrise brings new hope. Every step forward is a victory. Your healing journey starts with the courage to reach out."
  const category = inspiration?.category

  return (
    <Card className="bg-gradient-to-br from-teal-50 via-amber-50/50 to-rose-50 border-teal-200 shadow-warm">
      <CardContent className="py-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/70 shadow-warm">
            <Sparkles className="h-5 w-5 text-teal-700" />
          </div>
          <div className="flex-1">
            {category && (
              <p className="text-xs font-semibold uppercase tracking-wider text-teal-800 mb-1">
                {category}
              </p>
            )}
            <p className="text-base sm:text-lg italic text-slate-800 leading-relaxed">
              &ldquo;{content}&rdquo;
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
