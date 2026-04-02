import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { Camera, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../api/users.api'
import { useAuthStore } from '../../store/authStore'
import { Input } from '../../components/shared/Input'
import { Select } from '../../components/shared/Select'
import { Textarea } from '../../components/shared/Textarea'
import { Button } from '../../components/shared/Button'
import { AFRICAN_COUNTRIES } from '../../lib/constants'

const countryOptions = AFRICAN_COUNTRIES.map((c) => ({ value: c, label: c }))

function Initials({ name }) {
  const parts = (name ?? '').trim().split(' ')
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : (parts[0]?.[0] ?? '?')
  return (
    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-orange-800 text-2xl font-bold uppercase">
      {letters}
    </div>
  )
}

export default function EditProfilePage() {
  const { user, updateUser } = useAuthStore()
  const avatarInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar ?? null)
  const [passwordOpen, setPasswordOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name ?? '',
      username: user?.username ?? '',
      bio: user?.bio ?? '',
      website: user?.website ?? '',
      location: user?.location ?? '',
    },
  })

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm()

  // Update profile
  const profileMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data)
      toast.success('Profile updated')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  // Upload avatar
  const avatarMutation = useMutation({
    mutationFn: (formData) => usersApi.uploadAvatar(formData),
    onSuccess: (res) => {
      const newAvatar = res.data?.avatar
      setAvatarPreview(newAvatar)
      updateUser({ avatar: newAvatar })
      toast.success('Photo updated')
    },
    onError: () => toast.error('Failed to upload photo'),
  })

  // Change password
  const passwordMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Password changed')
      resetPw()
      setPasswordOpen(false)
    },
    onError: () => toast.error('Failed to change password'),
  })

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    const formData = new FormData()
    formData.append('avatar', file)
    avatarMutation.mutate(formData)
  }

  function onProfileSubmit(data) {
    profileMutation.mutate(data)
  }

  function onPasswordSubmit(data) {
    passwordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-8">Edit Profile</h1>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          {avatarPreview
            ? <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
            : <Initials name={user?.name} />
          }
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-stone-300 rounded-full flex items-center justify-center shadow-sm hover:bg-stone-50 transition-colors"
          >
            {avatarMutation.isPending
              ? <span className="w-3 h-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              : <Camera size={13} className="text-stone-600" />
            }
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div>
          <p className="text-sm font-medium text-stone-800">{user?.name}</p>
          <p className="text-xs text-stone-500">@{user?.username}</p>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="text-xs text-orange-700 hover:underline mt-1"
          >
            Change photo
          </button>
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4 mb-8">
        <Input
          label="Full Name"
          required
          error={errors.name?.message}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
        />
        <Input
          label="Username"
          required
          error={errors.username?.message}
          {...register('username', {
            required: 'Username is required',
            pattern: { value: /^[a-z0-9_-]+$/, message: 'Only lowercase letters, numbers, hyphens, underscores' },
          })}
        />
        <Textarea
          label="Bio"
          placeholder="Tell people a little about yourself…"
          rows={3}
          {...register('bio')}
        />
        <Input
          label="Website"
          type="url"
          placeholder="https://yourwebsite.com"
          error={errors.website?.message}
          {...register('website', {
            pattern: { value: /^https?:\/\/.+/, message: 'Must be a valid URL starting with http(s)://' },
          })}
        />
        <Select
          label="Location"
          placeholder="Select a country"
          options={countryOptions}
          {...register('location')}
        />

        <div className="pt-2">
          <Button type="submit" loading={profileMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Password section */}
      <div className="border border-stone-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setPasswordOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          Change Password
          {passwordOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {passwordOpen && (
          <form
            onSubmit={handleSubmitPw(onPasswordSubmit)}
            className="border-t border-stone-200 px-4 py-4 space-y-4 bg-stone-50"
          >
            <Input
              label="Current Password"
              type="password"
              required
              error={pwErrors.currentPassword?.message}
              {...registerPw('currentPassword', { required: 'Required' })}
            />
            <Input
              label="New Password"
              type="password"
              required
              error={pwErrors.newPassword?.message}
              {...registerPw('newPassword', {
                required: 'Required',
                minLength: { value: 8, message: 'At least 8 characters' },
                pattern: { value: /(?=.*[A-Z])(?=.*\d)/, message: 'Must include an uppercase letter and a number' },
              })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              error={pwErrors.confirmPassword?.message}
              {...registerPw('confirmPassword', {
                required: 'Required',
                validate: (val) => val === watchPw('newPassword') || 'Passwords do not match',
              })}
            />
            <Button type="submit" size="sm" loading={passwordMutation.isPending}>
              Update Password
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
