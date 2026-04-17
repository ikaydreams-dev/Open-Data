// src/components/shared/Tooltip.jsx
import { useState, useRef, useCallback } from 'react'
import { cn } from '../../lib/utils'

const placements = {
  top: {
    tooltip: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow: 'top-full left-1/2 -translate-x-1/2 border-t-stone-800 border-x-transparent border-b-transparent',
  },
  bottom: {
    tooltip: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'bottom-full left-1/2 -translate-x-1/2 border-b-stone-800 border-x-transparent border-t-transparent',
  },
  left: {
    tooltip: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'left-full top-1/2 -translate-y-1/2 border-l-stone-800 border-y-transparent border-r-transparent',
  },
  right: {
    tooltip: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'right-full top-1/2 -translate-y-1/2 border-r-stone-800 border-y-transparent border-l-transparent',
  },
}

export function Tooltip({
  children,
  content,
  placement = 'top',
  disabled = false,
  className,
}) {
  const [visible, setVisible] = useState(false)
  const timeoutRef = useRef(null)

  const show = useCallback(() => {
    if (disabled || !content) return
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setVisible(true), 120)
  }, [disabled, content])

  const hide = useCallback(() => {
    clearTimeout(timeoutRef.current)
    setVisible(false)
  }, [])

  const pos = placements[placement]

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}

      {visible && content && (
        <span
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none',
            'px-2.5 py-1.5 rounded-md',
            'bg-stone-800 text-white text-xs font-medium whitespace-nowrap',
            'shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-100',
            pos.tooltip,
            className,
          )}
        >
          {content}
          {/* Arrow */}
          <span
            className={cn(
              'absolute w-0 h-0 border-4',
              pos.arrow,
            )}
          />
        </span>
      )}
    </span>
  )
}
