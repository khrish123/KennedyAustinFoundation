// Backwards-compat shim: the email helper is now src/lib/email.ts and supports
// SMTP (preferred) with Resend as fallback. Existing callers can keep importing
// from this path until they migrate.
export { sendTransactionalEmail, sendTestEmail } from "./email"
export type { SendEmailParams, SendEmailResult } from "./email"
