import { useState } from 'react'
import { MailWarning, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import toast from 'react-hot-toast'

export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user)
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  if (!user || user.verified || dismissed) return null

  const resend = async () => {
    setSending(true)
    try {
      await authApi.resendVerification()
      toast.success('Verification email sent!')
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <MailWarning size={16} className="text-amber-600 shrink-0" />
        <p className="text-sm text-amber-800 flex-1">
          Please verify your email address.{' '}
          <button
            onClick={resend}
            disabled={sending}
            className="font-medium underline hover:no-underline disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Resend email'}
          </button>
        </p>
        <button onClick={() => setDismissed(true)} className="text-amber-600 hover:text-amber-800">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
