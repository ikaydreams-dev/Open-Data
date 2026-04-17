// src/components/shared/ErrorBoundary.jsx
import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

// React Error Boundaries must be class components — hooks cannot catch render errors.
// Wrap any subtree that might throw during render (e.g. data-heavy pages, charts).
//
// Usage:
//   <ErrorBoundary>
//     <SomeComponent />
//   </ErrorBoundary>
//
//   <ErrorBoundary fallback={<p>Something went wrong.</p>}>
//     <SomeComponent />
//   </ErrorBoundary>

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
    this.reset = this.reset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Surface errors in development so they're easy to spot
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, info.componentStack)
    }
  }

  reset() {
    this.setState({ hasError: false, error: null })
  }

  render() {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (!hasError) return children

    // Custom fallback takes priority
    if (fallback) return fallback

    // Default fallback UI — matches the platform's stone/orange palette
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50">
          <AlertTriangle className="text-red-500" size={28} />
        </div>

        <div className="flex flex-col gap-1 max-w-sm">
          <h3 className="text-base font-semibold text-stone-900">
            Something went wrong
          </h3>
          <p className="text-sm text-stone-500">
            An unexpected error occurred while rendering this section.
          </p>
          {import.meta.env.DEV && error?.message && (
            <pre className="mt-2 text-left text-xs text-red-600 bg-red-50 rounded-md p-3 overflow-x-auto">
              {error.message}
            </pre>
          )}
        </div>

        <button
          onClick={this.reset}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                     bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    )
  }
}
