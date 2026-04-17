// src/components/shared/Drawer.jsx
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const sizes = {
  sm: 'max-w-xs',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
}

const slideFrom = {
  right: {
    panel: 'inset-y-0 right-0',
    enter: 'translate-x-full',
    entered: 'translate-x-0',
  },
  left: {
    panel: 'inset-y-0 left-0',
    enter: '-translate-x-full',
    entered: 'translate-x-0',
  },
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  size = 'md',
  className,
}) {
  const position = slideFrom[side]

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/30 backdrop-blur-sm',
          'transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className={cn('fixed', position.panel)}>
        <DialogPanel
          className={cn(
            'flex flex-col h-full w-screen bg-white shadow-xl',
            'transform transition-transform duration-300 ease-in-out',
            open ? position.entered : position.enter,
            sizes[size],
            className,
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 shrink-0">
            {title && (
              <DialogTitle className="text-lg font-semibold text-stone-900">
                {title}
              </DialogTitle>
            )}
            <button
              onClick={onClose}
              className="ml-auto p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {children}
          </div>

          {/* Optional footer */}
          {footer && (
            <div className="shrink-0 border-t border-stone-200 px-6 py-4">
              {footer}
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
