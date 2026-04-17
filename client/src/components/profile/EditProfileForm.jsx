import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import { ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../api/users.api'
import { useAuthStore } from '../../store/authStore'
import { UserAvatar } from './UserAvatar'
import { Input } from '../shared/Input'
import { Textarea } from '../shared/Textarea'
import { Select } from '../shared/Select'
import { Button } from '../shared/Button'
import { AFRICAN_COUNTRIES } from '../../lib/constants'

const countryOptions = AFRICAN_COUNTRIES.map((c) => ({ value: c, label: c }))

/**
 * EditProfileForm — profile editing form with avatar upload and password change.
 *
 * Extracted from EditProfilePage so it can be embedded in profile tabs or
 * modal drawers without duplicating logic.
 *
 * Props:
 *   onSuccess   {function}  Called after a successful profile save
 *   compact     {boolean}   Hide section headings for embedded usage (default: false)
 */
export function EditProfileForm({ onSuccess, compact = false }) {
  const { user, updateUser } = useAuthStore()
  const [passwordOpen, setPasswordOpen] = useState(false)

  // ── Profile form ─────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name:     user?.name     ?? '',
      username: user?.username ?? '',
      bio:      user?.bio      ?? '',
      website:  user?.website  ?? '',
      location: user?.location ?? '',
    },
  })

  const profileMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data)
      toast.success('Profile updated')
      onSuccess?.()
    },
    onError: () => toast.error('Failed to update profile'),
  })

  // ── Avatar upload ─────────────────────────────────────────────────────────────
  const avatarMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return usersApi.uploadAvatar(formData)
    },
    onSuccess: (res) => {
      updateUser({ avatar: res.data?.avatar })
      toast.success('Photo updated')
    },
    onError: () => toast.error('Failed to upload photo'),
  })

  // ── Password change ───────────────────────────────────────────────────────────
  const {
    register:    registerPw,
    handleSubmit: handleSubmitPw,
    watch:       watchPw,
    reset:       resetPw,
    formState:   { errors: pwErrors },
  } = useForm()

  const passwordMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: () => {
      toast.success('Password changed')
      resetPw()
      setPasswordOpen(false)
    },
    onError: () => toast.error('Failed to change password'),
  })

  return (
    <div className="space-y-8">

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <UserAvatar
          user={user}
          size={72}
          editable
          uploading={avatarMutation.isPending}
          onUpload={(file) => avatarMutation.mutate(file)}
        />
        <div>
          <p className="text-sm font-medium text-stone-800">{user?.name}</p>
          <p className="text-xs text-stone-400">@{user?.username}</p>
        </div>
      </div>

      {/* Profile fields */}
      {!compact && (
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Basic Info
        </p>
      )}

      <form onSubmit={handleSubmit((d) => profileMutation.mutate(d))} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            required
            error={errors.name?.message}
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
          />
          <Input
            label="Username"
            required
            error={errors.username?.message}
            {...register('username', {
              required: 'Username is required',
              pattern: {
                value: /^[a-z0-9_-]+$/,
                message: 'Lowercase letters, numbers, hyphens, underscores only',
              },
            })}
          />
        </div>

        <Textarea
          label="Bio"
          placeholder="Tell people a little about yourself…"
          rows={3}
          hint="Max 500 characters."
          {...register('bio', { maxLength: { value: 500, message: 'Max 500 characters' } })}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Website"
            type="url"
            placeholder="https://yourwebsite.com"
            error={errors.website?.message}
            {...register('website', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Must start with http(s)://',
              },
            })}
          />
          <Select
            label="Location"
            placeholder="Select a country"
            options={countryOptions}
            {...register('location')}
          />
        </div>

        <div className="pt-1">
          <Button type="submit" loading={profileMutation.isPending}>
            Save Changes
          </Button>
        </div>
      </form>

      {/* Password change — collapsible */}
      <div className="border border-stone-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setPasswordOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
        >
          Change Password
          {passwordOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {passwordOpen && (
          <form
            onSubmit={handleSubmitPw((d) => passwordMutation.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword }))}
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
                pattern: {
                  value: /(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must include an uppercase letter and a number',
                },
              })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              error={pwErrors.confirmPassword?.message}
              {...registerPw('confirmPassword', {
                required: 'Required',
                validate: (val) =>
                  val === watchPw('newPassword') || 'Passwords do not match',
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
