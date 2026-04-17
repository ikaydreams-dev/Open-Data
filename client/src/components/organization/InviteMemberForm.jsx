import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, UserPlus } from 'lucide-react'
import { Input } from '../shared/Input'
import { Button } from '../shared/Button'
import { cn } from '../../lib/utils'

/**
 * InviteMemberForm — email-based invite form for an organisation.
 *
 * Currently the API accepts an email address and the server sends an invitation.
 * The form is intentionally simple to match the existing inviteMember endpoint.
 *
 * Props:
 *   onInvite    {function(email): Promise}  Called with the email when the form is submitted
 *   isLoading   {boolean}                   Show a loading state on the submit button
 *   className   {string}
 *   inline      {boolean}  Render as a compact single-row form (default: false — stacked)
 */
export function InviteMemberForm({ onInvite, isLoading, className, inline = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { email: '' } })

  async function onSubmit({ email }) {
    await onInvite?.(email.trim().toLowerCase())
    reset()
  }

  if (inline) {
    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={cn('flex items-start gap-2', className)}
      >
        <div className="flex-1">
          <Input
            placeholder="colleague@example.com"
            type="email"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
        </div>
        <Button type="submit" size="sm" loading={isLoading} className="shrink-0 mt-0.5">
          <UserPlus size={14} />
          Invite
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
          <Mail size={15} className="text-orange-600" />
        </div>
        <p className="text-sm text-stone-600">
          Enter the email address of the person you want to invite.
        </p>
      </div>

      <Input
        label="Email address"
        type="email"
        placeholder="colleague@example.com"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Enter a valid email address',
          },
        })}
      />

      <p className="text-xs text-stone-400">
        They will receive an email with instructions to join the organization.
      </p>

      <div className="flex justify-end gap-2">
        <Button type="submit" loading={isLoading}>
          <UserPlus size={14} />
          Send Invitation
        </Button>
      </div>
    </form>
  )
}
