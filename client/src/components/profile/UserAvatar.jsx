import { useRef } from 'react'
import { Camera } from 'lucide-react'
import { resolveAvatarSrc } from '../../lib/cloudinary'
import { cn } from '../../lib/utils'

export function UserAvatar({
  user,
  size = 40,
  editable = false,
  uploading = false,
  onUpload,
  className,
}) {
  const fileInputRef = useRef(null)

  // Resolve the best avatar URL for the requested size
  const avatarSrc = resolveAvatarSrc(user?.avatar, size * 2) // 2× for retina

  // Derive initials from name
  const initials = getInitials(user?.name)

  // Tailwind can't interpolate arbitrary values, so we set style directly
  const dimension = `${size}px`
  const fontSize   = `${Math.max(Math.round(size * 0.35), 10)}px`

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onUpload?.(file)
    // Reset so the same file can be re-selected
    e.target.value = ''
  }

  return (
    <div
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: dimension, height: dimension }}
    >
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={user?.name ?? 'User avatar'}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full rounded-full bg-orange-100 flex items-center justify-center text-orange-800 font-bold uppercase select-none"
          style={{ fontSize }}
        >
          {initials}
        </div>
      )}

      {/* Editable camera overlay */}
      {editable && (
        <>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 rounded-full flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors group"
            aria-label="Change profile photo"
          >
            {uploading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera
                size={Math.max(Math.round(size * 0.3), 12)}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0].slice(0, 2).toUpperCase()
}
