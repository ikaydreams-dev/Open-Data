import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Modal({ open, onClose, title, children, size = 'md' }) {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className={cn(
            'w-full bg-white rounded-xl shadow-xl p-6',
            sizes[size],
          )}
        >
          <div className="flex items-center justify-between mb-4">
            {title && (
              <DialogTitle className="text-lg font-semibold text-stone-900">
                {title}
              </DialogTitle>
            )}
            <button
              onClick={onClose}
              className="ml-auto p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100"
            >
              <X size={18} />
            </button>
          </div>
          {children}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
