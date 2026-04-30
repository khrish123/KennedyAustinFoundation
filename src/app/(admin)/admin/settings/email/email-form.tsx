"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Mail, Send, KeyRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  SMTP_PRESETS,
  type EmailSettingsForAdmin,
  type SmtpEncryption,
  type EmailTransport,
} from "@/types/email"
import {
  saveEmailSettingsAction,
  sendTestEmailAction,
  clearSmtpPasswordAction,
  clearResendKeyAction,
} from "./actions"

interface EmailFormProps {
  settings: EmailSettingsForAdmin | null
}

export function EmailForm({ settings }: EmailFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [host, setHost] = useState(settings?.smtp_host || "")
  const [port, setPort] = useState<string>(
    settings?.smtp_port ? String(settings.smtp_port) : "465"
  )
  const [username, setUsername] = useState(settings?.smtp_username || "")
  const [password, setPassword] = useState("")
  const [encryption, setEncryption] = useState<SmtpEncryption>(
    settings?.smtp_encryption || "ssl"
  )
  const [transport, setTransport] = useState<EmailTransport>(
    settings?.transport || "auto"
  )
  const [fromEmail, setFromEmail] = useState(settings?.from_email || "")
  const [fromName, setFromName] = useState(settings?.from_name || "")
  const [replyTo, setReplyTo] = useState(settings?.reply_to_email || "")
  const [resendKey, setResendKey] = useState("")

  // Test email state
  const [testTo, setTestTo] = useState("")
  const [testPending, startTestTransition] = useTransition()
  const [testResult, setTestResult] = useState<
    | { kind: "ok"; transport?: string; id?: string }
    | { kind: "err"; message: string; transport?: string }
    | null
  >(null)

  const passwordSet = settings?.smtp_password_set
  const resendKeySet = settings?.resend_api_key_set

  const applyPreset = (presetLabel: string) => {
    const preset = SMTP_PRESETS.find((p) => p.label === presetLabel)
    if (!preset) return
    setHost(preset.host)
    setPort(String(preset.port))
    setEncryption(preset.encryption)
  }

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)
    formData.set("smtp_host", host)
    formData.set("smtp_port", port)
    formData.set("smtp_username", username)
    formData.set("smtp_password", password) // empty = leave unchanged
    formData.set("smtp_encryption", encryption)
    formData.set("transport", transport)
    formData.set("from_email", fromEmail)
    formData.set("from_name", fromName)
    formData.set("reply_to_email", replyTo)
    formData.set("resend_api_key", resendKey)

    startTransition(async () => {
      const result = await saveEmailSettingsAction(
        settings?.id || null,
        formData
      )
      if (result?.error) {
        setError(result.error)
        return
      }
      setSuccess(true)
      setPassword("")
      setResendKey("")
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  const handleClearPassword = () => {
    if (!settings?.id) return
    if (!confirm("Clear the saved SMTP password?")) return
    startTransition(async () => {
      await clearSmtpPasswordAction(settings.id)
      router.refresh()
    })
  }

  const handleClearResendKey = () => {
    if (!settings?.id) return
    if (!confirm("Clear the saved Resend API key?")) return
    startTransition(async () => {
      await clearResendKeyAction(settings.id)
      router.refresh()
    })
  }

  const handleTest = () => {
    setTestResult(null)
    startTestTransition(async () => {
      const result = await sendTestEmailAction(testTo)
      if ("error" in result && result.error && !("status" in result)) {
        setTestResult({ kind: "err", message: result.error })
        return
      }
      if ("ok" in result && result.ok) {
        setTestResult({
          kind: "ok",
          transport: result.transport,
          id: result.id,
        })
      } else if ("status" in result && result.status === "skipped") {
        setTestResult({
          kind: "err",
          message:
            result.error ||
            "Email not configured. Save SMTP credentials or a Resend API key first.",
        })
      } else {
        setTestResult({
          kind: "err",
          message: ("error" in result && result.error) || "Email send failed",
          transport: ("transport" in result && result.transport) || undefined,
        })
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Transport
          </CardTitle>
          <CardDescription>
            How outgoing email gets delivered. Leave on <strong>Auto</strong> to
            try SMTP first and fall back to Resend if SMTP isn&apos;t set up.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={transport}
            onValueChange={(v) => setTransport(v as EmailTransport)}
          >
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (SMTP, then Resend)</SelectItem>
              <SelectItem value="smtp">SMTP only</SelectItem>
              <SelectItem value="resend">Resend only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SMTP Server Configuration</CardTitle>
          <CardDescription>
            Use any SMTP server you already have access to (GoDaddy email,
            Gmail, Zoho, etc.). Pick a preset to fill defaults.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Quick preset</Label>
            <Select onValueChange={applyPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Pick a preset to auto-fill" />
              </SelectTrigger>
              <SelectContent>
                {SMTP_PRESETS.map((p) => (
                  <SelectItem key={p.label} value={p.label}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="smtp_host">SMTP Host</Label>
              <Input
                id="smtp_host"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="smtpout.secureserver.net"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                e.g. smtpout.secureserver.net, smtp.gmail.com
              </p>
            </div>
            <div>
              <Label htmlFor="smtp_port">SMTP Port</Label>
              <Input
                id="smtp_port"
                type="number"
                min={1}
                max={65535}
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="465"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Usually 465 (SSL) or 587 (TLS)
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="smtp_username">SMTP Username</Label>
              <Input
                id="smtp_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@kennedyaustinfoundation.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Usually your full email address
              </p>
            </div>
            <div>
              <Label htmlFor="smtp_password">
                SMTP Password
                {passwordSet && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    saved
                  </Badge>
                )}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="smtp_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={passwordSet ? "•••••••• (leave blank to keep)" : "Your email password"}
                  autoComplete="new-password"
                />
                {passwordSet && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleClearPassword}
                    disabled={pending}
                    title="Clear saved password"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                For Gmail, use an App Password (Google Account → Security).
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="smtp_encryption">Encryption</Label>
            <Select
              value={encryption}
              onValueChange={(v) => setEncryption(v as SmtpEncryption)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ssl">SSL (Port 465)</SelectItem>
                <SelectItem value="tls">TLS / STARTTLS (Port 587)</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sender Information</CardTitle>
          <CardDescription>
            What recipients see in their inbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="from_email">From Email</Label>
              <Input
                id="from_email"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="admin@kennedyaustinfoundation.com"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Email address shown as sender. Usually matches the SMTP username.
              </p>
            </div>
            <div>
              <Label htmlFor="from_name">From Name</Label>
              <Input
                id="from_name"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Kennedy Austin Foundation"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Name shown as sender
              </p>
            </div>
          </div>
          <div>
            <Label htmlFor="reply_to_email">Reply-To Email</Label>
            <Input
              id="reply_to_email"
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="admin@kennedyaustinfoundation.com"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Where customer replies will go (leave blank to use From Email)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Resend (optional fallback)
          </CardTitle>
          <CardDescription>
            If you set this, the system uses it as a backup when SMTP isn&apos;t
            configured or when transport is set to &quot;Resend only&quot;. Otherwise
            falls back to <code>RESEND_API_KEY</code> in <code>.env.local</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="resend_api_key">
            Resend API key
            {resendKeySet && (
              <Badge variant="outline" className="ml-2 text-xs">
                saved
              </Badge>
            )}
          </Label>
          <div className="flex gap-2">
            <Input
              id="resend_api_key"
              type="password"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder={resendKeySet ? "•••••••• (leave blank to keep)" : "re_..."}
              autoComplete="new-password"
            />
            {resendKeySet && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleClearResendKey}
                disabled={pending}
                title="Clear Resend key"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Email settings saved.
        </div>
      )}

      <div className="sticky bottom-4 flex gap-2 justify-end">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : "Save email settings"}
        </Button>
      </div>

      {/* Test email — outside the main submit, but in the same form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send a test email</CardTitle>
          <CardDescription>
            Save your settings first, then send a test message to confirm
            everything works end-to-end.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@your-personal-email.com"
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleTest}
              disabled={testPending || !testTo}
            >
              <Send className="mr-2 h-4 w-4" />
              {testPending ? "Sending…" : "Send test"}
            </Button>
          </div>
          {testResult?.kind === "ok" && (
            <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
              Test email sent via <strong>{testResult.transport || "email"}</strong>
              {testResult.id && (
                <>
                  {" "}
                  · <code className="text-xs">{testResult.id}</code>
                </>
              )}
              . Check your inbox (and spam folder).
            </div>
          )}
          {testResult?.kind === "err" && (
            <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
              {testResult.transport && (
                <>
                  Transport <strong>{testResult.transport}</strong>:{" "}
                </>
              )}
              {testResult.message}
            </div>
          )}
        </CardContent>
      </Card>
    </form>
  )
}
