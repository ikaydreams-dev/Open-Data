import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { forgotPasswordSchema } from '../../lib/validators'
import { authApi } from '../../api/auth.api'
import { Input } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data) => {
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Check your email</h2>
          <p className="text-sm text-stone-500 mb-6">We've sent a password reset link to your email address.</p>
          <Link to="/sign-in" className="text-sm text-orange-700 font-medium hover:underline">
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Forgot password</h1>
        <p className="text-sm text-stone-500 mb-6">Enter your email and we'll send a reset link.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Send reset link
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          <Link to="/sign-in" className="text-orange-700 font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
