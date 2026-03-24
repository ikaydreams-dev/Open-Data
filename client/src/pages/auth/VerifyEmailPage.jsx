import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/shared/Spinner'
import { CheckCircle, XCircle } from 'lucide-react'

export default function VerifyEmailPage() {
  const { token } = useParams()
  const updateUser = useAuthStore((s) => s.updateUser)
  const [status, setStatus] = useState('loading') // loading | success | error

  useEffect(() => {
    authApi.verifyEmail(token)
      .then(() => {
        updateUser({ verified: true })
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="w-full max-w-sm text-center">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        {status === 'loading' && (
          <>
            <Spinner size="lg" className="mx-auto mb-4" />
            <p className="text-stone-600">Verifying your email…</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Email verified!</h2>
            <p className="text-sm text-stone-500 mb-6">Your account is now fully active.</p>
            <Link to="/datasets" className="text-sm font-medium text-orange-700 hover:underline">
              Browse datasets →
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-stone-900 mb-2">Verification failed</h2>
            <p className="text-sm text-stone-500 mb-6">The link may be expired or invalid.</p>
            <Link to="/sign-in" className="text-sm font-medium text-orange-700 hover:underline">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
