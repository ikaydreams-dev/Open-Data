import { useEffect, useRef, useCallback } from 'react'

/**
 * Hook for detecting when user scrolls near the bottom of the page
 * Calls a callback function when the scroll threshold is reached
 * Properly cleans up event listeners on unmount
 *
 * @param {Function} callback - Function to call when near bottom
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Distance from bottom in pixels (default: 200)
 * @param {boolean} options.enabled - Whether to enable the scroll detection (default: true)
 * @param {HTMLElement} options.element - Element to observe (default: window)
 * @returns {void}
 *
 * @example
 * useInfiniteScroll(() => loadMoreItems(), { threshold: 300 })
 */
export function useInfiniteScroll(callback, options = {}) {
  const {
    threshold = 200,
    enabled = true,
    element = null,
  } = options

  // Store callback in ref to avoid adding/removing listeners unnecessarily
  const callbackRef = useRef(callback)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    // Skip if disabled
    if (!enabled) return

    // Determine scroll target (window or specific element)
    const scrollTarget = element || window

    // Handle scroll events
    const handleScroll = () => {
      let scrollTop, windowHeight, docHeight

      if (element) {
        // For specific element
        scrollTop = element.scrollTop
        windowHeight = element.clientHeight
        docHeight = element.scrollHeight
      } else {
        // For window
        scrollTop = window.scrollY || document.documentElement.scrollTop
        windowHeight = window.innerHeight
        docHeight = document.documentElement.scrollHeight
      }

      // Check if user scrolled to within threshold of bottom
      const distanceToBottom = docHeight - (scrollTop + windowHeight)

      if (distanceToBottom < threshold) {
        callbackRef.current()
      }
    }

    // Add scroll event listener with passive flag for better performance
    // passive: true tells browser this listener won't call preventDefault()
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup: remove event listener when component unmounts or dependency changes
    return () => {
      scrollTarget.removeEventListener('scroll', handleScroll)
    }
  }, [enabled, threshold, element])
}
