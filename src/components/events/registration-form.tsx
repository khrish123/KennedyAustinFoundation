"use client"

import { useState } from "react"
import { Plus, Trash2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { RegistrationType } from "@/types/events"

interface ChildRow {
  name: string
  age: string
  gender: string
  gift_idea: string
}

interface RegistrationFormProps {
  eventId: string
  eventTitle: string
  registrationType: Exclude<RegistrationType, "none">
}

const TITLES: Record<Exclude<RegistrationType, "none">, string> = {
  rsvp: "RSVP for this event",
  volunteer: "Volunteer signup",
  toy_request: "Request toys for your child(ren)",
}

const DESCRIPTIONS: Record<Exclude<RegistrationType, "none">, string> = {
  rsvp: "Let us know you're coming so we can plan space, food, and materials.",
  volunteer: "Tell us when you're available and how you'd like to help.",
  toy_request:
    "Parents or guardians: list each child below. We'll match them with age-appropriate gifts.",
}

const newChild = (): ChildRow => ({
  name: "",
  age: "",
  gender: "",
  gift_idea: "",
})

export function RegistrationForm({
  eventId,
  eventTitle,
  registrationType,
}: RegistrationFormProps) {
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState<
    | { kind: "ok"; status: string }
    | { kind: "err"; message: string }
    | null
  >(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [guestsCount, setGuestsCount] = useState("1")
  const [notes, setNotes] = useState("")
  const [confirmHasKids, setConfirmHasKids] = useState(false)
  const [children, setChildren] = useState<ChildRow[]>(
    registrationType === "toy_request" ? [newChild()] : []
  )

  const addChild = () => setChildren((c) => [...c, newChild()])
  const removeChild = (i: number) =>
    setChildren((c) => (c.length === 1 ? c : c.filter((_, idx) => idx !== i)))
  const updateChild = (i: number, key: keyof ChildRow, value: string) =>
    setChildren((c) => c.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDone(null)

    if (registrationType === "toy_request" && !confirmHasKids) {
      setDone({
        kind: "err",
        message:
          "You must confirm you are the parent/guardian of the child(ren) listed below.",
      })
      return
    }

    setPending(true)

    let parsedChildren = children
      .map((c) => ({
        name: c.name.trim(),
        age: parseInt(c.age, 10),
        gender: c.gender.trim() || undefined,
        gift_idea: c.gift_idea.trim() || undefined,
      }))
      .filter((c) => c.name && Number.isFinite(c.age))

    if (registrationType !== "toy_request") parsedChildren = []

    if (registrationType === "toy_request" && parsedChildren.length === 0) {
      setDone({
        kind: "err",
        message: "Please list at least one child with a name and age.",
      })
      setPending(false)
      return
    }

    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone,
          address,
          guests_count: Number(guestsCount) || 1,
          children: parsedChildren,
          notes,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Could not submit")
      setDone({ kind: "ok", status: data.status || "pending" })
    } catch (e) {
      setDone({
        kind: "err",
        message: e instanceof Error ? e.message : "Something went wrong",
      })
    } finally {
      setPending(false)
    }
  }

  if (done?.kind === "ok") {
    return (
      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="text-emerald-900">
            Thank you — your signup is in.
          </CardTitle>
          <CardDescription className="text-emerald-900/80">
            {done.status === "waitlist" ? (
              <>
                <strong>{eventTitle}</strong> has reached capacity, so you&apos;re
                on the waitlist. We&apos;ll email you if a spot opens up.
              </>
            ) : (
              <>
                We&apos;ve received your signup for <strong>{eventTitle}</strong>.
                A confirmation email is on its way.
              </>
            )}
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{TITLES[registrationType]}</CardTitle>
        <CardDescription>{DESCRIPTIONS[registrationType]}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="full_name">
                Your full name <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">
                Email <span className="text-rose-600">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(909) 555-1234"
              />
            </div>
            {registrationType === "rsvp" && (
              <div>
                <Label htmlFor="guests_count">How many people total?</Label>
                <Input
                  id="guests_count"
                  type="number"
                  min={1}
                  max={20}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                />
              </div>
            )}
            {registrationType === "toy_request" && (
              <div>
                <Label htmlFor="address">
                  Address <span className="text-rose-600">*</span>
                </Label>
                <Input
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, city, ZIP"
                />
              </div>
            )}
          </div>

          {registrationType === "toy_request" && (
            <div className="space-y-3 pt-2">
              <div>
                <Label className="block">
                  Children <span className="text-rose-600">*</span>
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Add one row per child. Age must be 0–17.
                </p>
              </div>

              {children.map((c, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-muted/20 p-3 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Child #{i + 1}
                    </span>
                    {children.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeChild(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs">Name</Label>
                      <Input
                        required
                        value={c.name}
                        onChange={(e) => updateChild(i, "name", e.target.value)}
                        placeholder="First name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Age</Label>
                      <Input
                        required
                        type="number"
                        min={0}
                        max={17}
                        value={c.age}
                        onChange={(e) => updateChild(i, "age", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Gender (optional)</Label>
                      <Input
                        value={c.gender}
                        onChange={(e) =>
                          updateChild(i, "gender", e.target.value)
                        }
                        placeholder="Boy / Girl / Either"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Gift idea (optional)</Label>
                      <Input
                        value={c.gift_idea}
                        onChange={(e) =>
                          updateChild(i, "gift_idea", e.target.value)
                        }
                        placeholder="Action figure, books…"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button type="button" variant="outline" size="sm" onClick={addChild}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add another child
              </Button>

              <label className="flex items-start gap-2 text-sm pt-2">
                <input
                  type="checkbox"
                  checked={confirmHasKids}
                  onChange={(e) => setConfirmHasKids(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  I confirm I am the <strong>parent or legal guardian</strong> of
                  the child(ren) listed above.
                </span>
              </label>
            </div>
          )}

          <div>
            <Label htmlFor="notes">
              {registrationType === "volunteer"
                ? "Availability + how you'd like to help"
                : "Notes (optional)"}
            </Label>
            <Textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                registrationType === "volunteer"
                  ? "I can help with setup on Friday afternoon, food prep, etc."
                  : "Anything else we should know"
              }
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Please don&apos;t share medical, insurance, or other sensitive
              health information here.
            </p>
          </div>

          {done?.kind === "err" && (
            <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {done.message}
            </div>
          )}

          <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
            <Send className="h-4 w-4 mr-2" />
            {pending ? "Submitting…" : "Submit signup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
