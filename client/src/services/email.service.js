/**
 * server/src/services/email.service.js
 *
 * Nodemailer email delivery service.
 *
 * Implements every "// TODO: Send … email" left in auth.controller.js:
 *   - Email verification
 *   - Password reset
 *   - Welcome email (after verification)
 *
 * Transport is configured from .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).
 * In development with no SMTP config, falls back to Ethereal (auto-captured
 * test account) so the server starts without crashing and preview URLs are
 * logged to the console.
 */

import nodemailer from 'nodemailer'

// ─── Transport ────────────────────────────────────────────────────────────────

let _transporter = null

/**
 * Lazily build and cache the Nodemailer transport.
 * Uses real SMTP config when present; falls back to Ethereal for dev.
 */
async function getTransporter() {
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (host && user && pass) {
    _transporter = nodemailer.createTransport({
      host,
      port:   parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth:   { user, pass },
    })
  } else {
    // Dev fallback — Ethereal captures emails so nothing reaches real inboxes
    const testAccount = await nodemailer.createTestAccount()
    _transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('📧 Email: using Ethereal test account —', testAccount.user)
  }

  return _transporter
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const FROM       = process.env.EMAIL_FROM    ?? 'OpenData Africa <noreply@opendata.africa>'
const CLIENT_URL = process.env.CLIENT_URL    ?? 'http://localhost:5173'
const APP_NAME   = 'OpenData Africa'

/**
 * Send an email. Internal utility used by all public functions below.
 *
 * @param {{ to, subject, html, text? }} options
 * @returns {Promise<void>}
 */
async function send({ to, subject, html, text }) {
  try {
    const transporter = await getTransporter()
    const info = await transporter.sendMail({
      from: FROM,
      to,
      subject,
      text:  text ?? stripHtml(html),
      html,
    })

    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log(`📧 Email preview: ${previewUrl}`)
      }
    }
  } catch (err) {
    // Log but don't throw — a failed email must never crash a request
    console.error('Email delivery error:', err.message)
  }
}

/** Strip HTML tags for the plaintext fallback */
function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

// ─── Shared template wrapper ──────────────────────────────────────────────────

function emailWrapper(title, bodyHtml) {
  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#fafaf9; font-family:system-ui,-apple-system,sans-serif; color:#1c1917; }
    .wrap { max-width:560px; margin:40px auto; background:#fff; border:1px solid #e7e5e4; border-radius:12px; overflow:hidden; }
    .header { background:#c2410c; padding:24px 32px; }
    .header h1 { margin:0; color:#fff; font-size:18px; font-weight:700; letter-spacing:-0.02em; }
    .body { padding:32px; }
    .body p { margin:0 0 16px; font-size:15px; line-height:1.6; color:#44403c; }
    .btn { display:inline-block; margin:8px 0 24px; padding:12px 28px; background:#c2410c; color:#fff !important;
           text-decoration:none; border-radius:8px; font-weight:600; font-size:14px; }
    .btn:hover { background:#9a3412; }
    .meta { font-size:13px; color:#78716c; }
    .footer { border-top:1px solid #f5f5f4; padding:20px 32px; font-size:12px; color:#a8a29e; }
    .footer a { color:#a8a29e; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header"><h1>${APP_NAME}</h1></div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${APP_NAME} · All rights reserved</p>
      <p>If you did not request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>`
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send an email verification link.
 * Called in auth.controller.js signUp() and resendVerification().
 *
 * @param {{ name: string, email: string, token: string }} param0
 */
export async function sendVerificationEmail({ name, email, token }) {
  const url = `${CLIENT_URL}/verify-email/${token}`

  const html = emailWrapper(
    'Verify your email address',
    /* html */ `
    <p>Hi ${name},</p>
    <p>Welcome to ${APP_NAME}! Please verify your email address to activate your account and start publishing and accessing African datasets.</p>
    <a href="${url}" class="btn">Verify Email Address</a>
    <p class="meta">This link expires in <strong>24 hours</strong>.</p>
    <p class="meta">Or copy this URL into your browser:<br/><a href="${url}">${url}</a></p>
    `,
  )

  await send({
    to:      email,
    subject: `Verify your ${APP_NAME} account`,
    html,
  })
}

/**
 * Send a password reset link.
 * Called in auth.controller.js forgotPassword().
 *
 * @param {{ name: string, email: string, token: string }} param0
 */
export async function sendPasswordResetEmail({ name, email, token }) {
  const url = `${CLIENT_URL}/reset-password/${token}`

  const html = emailWrapper(
    'Reset your password',
    /* html */ `
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your ${APP_NAME} account.</p>
    <a href="${url}" class="btn">Reset Password</a>
    <p class="meta">This link expires in <strong>1 hour</strong>.</p>
    <p class="meta">If you didn't request a password reset, you can safely ignore this email — your password won't change.</p>
    <p class="meta">Or copy this URL into your browser:<br/><a href="${url}">${url}</a></p>
    `,
  )

  await send({
    to:      email,
    subject: `Reset your ${APP_NAME} password`,
    html,
  })
}

/**
 * Send a welcome email after a user's email is successfully verified.
 *
 * @param {{ name: string, email: string }} param0
 */
export async function sendWelcomeEmail({ name, email }) {
  const html = emailWrapper(
    `Welcome to ${APP_NAME}`,
    /* html */ `
    <p>Hi ${name},</p>
    <p>Your email is verified and your ${APP_NAME} account is ready. You can now:</p>
    <ul style="font-size:15px;line-height:1.8;color:#44403c;padding-left:20px;">
      <li>Browse and download datasets from across Africa</li>
      <li>Upload and publish your own datasets</li>
      <li>Collaborate with researchers, NGOs, and governments</li>
      <li>Join community discussions on datasets</li>
    </ul>
    <a href="${CLIENT_URL}/datasets" class="btn">Explore Datasets</a>
    `,
  )

  await send({
    to:      email,
    subject: `Welcome to ${APP_NAME} 🌍`,
    html,
  })
}

/**
 * Notify an org member that they've been invited to join an organization.
 *
 * @param {{ email: string, orgName: string, orgSlug: string, inviterName: string }} param0
 */
export async function sendOrgInviteEmail({ email, orgName, orgSlug, inviterName }) {
  const url = `${CLIENT_URL}/organizations/${orgSlug}`

  const html = emailWrapper(
    `You've been invited to join ${orgName}`,
    /* html */ `
    <p>Hi there,</p>
    <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on ${APP_NAME}.</p>
    <a href="${url}" class="btn">View Organization</a>
    <p class="meta">You'll need an ${APP_NAME} account to accept this invitation. <a href="${CLIENT_URL}/sign-up">Sign up here</a> if you don't have one yet.</p>
    `,
  )

  await send({
    to:      email,
    subject: `${inviterName} invited you to join ${orgName} on ${APP_NAME}`,
    html,
  })
}

/**
 * Notify a dataset uploader that their dataset has been approved.
 *
 * @param {{ name: string, email: string, datasetTitle: string, datasetSlug: string }} param0
 */
export async function sendDatasetApprovedEmail({ name, email, datasetTitle, datasetSlug }) {
  const url = `${CLIENT_URL}/datasets/${datasetSlug}`

  const html = emailWrapper(
    'Your dataset has been approved',
    /* html */ `
    <p>Hi ${name},</p>
    <p>Great news! Your dataset <strong>${datasetTitle}</strong> has been reviewed and approved. It's now publicly visible on ${APP_NAME}.</p>
    <a href="${url}" class="btn">View Your Dataset</a>
    `,
  )

  await send({
    to:      email,
    subject: `Your dataset "${datasetTitle}" is now live on ${APP_NAME}`,
    html,
  })
}

/**
 * Notify a dataset uploader that their dataset has been rejected.
 *
 * @param {{ name: string, email: string, datasetTitle: string, datasetSlug: string, reason?: string }} param0
 */
export async function sendDatasetRejectedEmail({ name, email, datasetTitle, datasetSlug, reason }) {
  const url = `${CLIENT_URL}/datasets/${datasetSlug}`

  const html = emailWrapper(
    'Your dataset needs attention',
    /* html */ `
    <p>Hi ${name},</p>
    <p>Your dataset <strong>${datasetTitle}</strong> was reviewed and could not be approved at this time.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>Please review the feedback, make the necessary changes, and resubmit.</p>
    <a href="${url}" class="btn">View Dataset</a>
    `,
  )

  await send({
    to:      email,
    subject: `Action required: "${datasetTitle}" on ${APP_NAME}`,
    html,
  })
}
