import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { resetPasswordSchema } from '../../lib/validators'
import { authApi } from '../../api/auth.api'
import { Input } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data) => {
    try {
      await authApi.resetPassword(token, data.password)
      toast.success('Password reset! Please sign in.')
      navigate('/sign-in')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Reset password</h1>
        <p className="text-sm text-stone-500 mb-6">Enter your new password below.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="New password"
            type="password"
            placeholder="••••••••"
            hint="Min 8 chars, one uppercase, one number"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" loading={isSubmitting} className="w-full">
            Reset password
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
