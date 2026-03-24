import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { signUpSchema } from '../../lib/validators'
import { authApi } from '../../api/auth.api'
import { Input } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Button } from '../../components/shared/Button'
import toast from 'react-hot-toast'

const roleOptions = [
  { value: 'researcher', label: 'Researcher / Data Scientist' },
  { value: 'contributor', label: 'Contributor / Journalist' },
  { value: 'institution', label: 'Institution / Organization' },
]

export default function SignUpPage() {
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: { role: 'researcher' },
  })

  const onSubmit = async (data) => {
    try {
      await authApi.register(data)
      toast.success('Account created! Please check your email to verify.')
      navigate('/sign-in')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Create account</h1>
        <p className="text-sm text-stone-500 mb-6">Join Africa's open data community</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full name"
            placeholder="Ada Okafor"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Select
            label="I am a…"
            options={roleOptions}
            error={errors.role?.message}
            {...register('role')}
          />
          <Input
            label="Password"
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
          <Button type="submit" loading={isSubmitting} className="w-full mt-2">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/sign-in" className="text-orange-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
