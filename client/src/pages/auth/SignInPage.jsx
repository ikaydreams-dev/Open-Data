import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signInSchema } from '../../lib/validators'
import { authApi } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/shared/Input'
import { Button } from '../../components/shared/Button'
import toast from 'react-hot-toast'

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const from = location.state?.from?.pathname || '/datasets'

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await authApi.login(data)
      setAuth(res.data.user, res.data.accessToken)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      navigate(from, { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sign in failed. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Sign in</h1>
        <p className="text-sm text-stone-500 mb-6">Welcome back to OpenData Africa</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-orange-700 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" loading={isSubmitting} className="w-full">
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Don't have an account?{' '}
          <Link to="/sign-up" className="text-orange-700 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
