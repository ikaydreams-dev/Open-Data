import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreVertical, Pencil, Trash2, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { ConfirmDialog } from '../shared/ConfirmDialog'

export function DatasetActionsMenu({ slug, onDelete }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleCopyLink() {
    const url = `${window.location.origin}/datasets/${slug}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied'),
      () => toast.error('Failed to copy link'),
    )
    setOpen(false)
  }

  function handleEdit() {
    navigate(`/datasets/${slug}/edit`)
    setOpen(false)
  }

  function handleDeleteClick() {
    setOpen(false)
    setShowConfirm(true)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
        title="More actions"
      >
        <MoreVertical size={16} />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-44 bg-white border border-stone-200 rounded-lg shadow-md z-20 py-1 text-sm">
            <button
              onClick={handleEdit}
              className="flex w-full items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Pencil size={14} /> Edit
            </button>
            <button
              onClick={handleCopyLink}
              className="flex w-full items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <LinkIcon size={14} /> Copy link
            </button>
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>
        </>
      )}

      {onDelete && (
        <ConfirmDialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => { onDelete(); setShowConfirm(false) }}
          title="Delete Dataset"
          message="This will permanently delete the dataset and all its files. This action cannot be undone."
          confirmLabel="Delete"
          danger
        />
      )}
    </div>
  )
}
