"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [pending, setPending] = useState(false)
  const [message, setMessage] = useState<
    | { kind: "ok"; text: string }
    | { kind: "err"; text: string }
    | null
  >(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setPending(true)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || "Could not subscribe")
      }
      const text =
        data.status === "already-subscribed"
          ? "You're already on the list — thank you."
          : "Thanks for subscribing. Check your inbox for a welcome note."
      setMessage({ kind: "ok", text })
      setEmail("")
    } catch (e) {
      setMessage({
        kind: "err",
        text: e instanceof Error ? e.message : "Something went wrong",
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          disabled={pending}
          className="bg-white border-white text-slate-900 placeholder:text-slate-500"
        />
        <Button
          variant="secondary"
          type="submit"
          disabled={pending}
          className="bg-white text-teal-700 hover:bg-slate-100 shadow-warm font-semibold"
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </Button>
      </form>
      {message && (
        <p
          className={
            message.kind === "ok"
              ? "text-xs text-white/95"
              : "text-xs text-rose-100"
          }
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
