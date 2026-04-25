import { useState } from 'react'
import { Button } from '../components/shared/Button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export function ServerErrorPage() {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = () => {
    setIsRetrying(true)
    // Simulate retry
    setTimeout(() => {
      setIsRetrying(false)
      console.log('Retrying...')
      // In a real app, this would retry the failed request
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-stone-200 p-8 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />

        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Server Error
        </h1>

        <p className="text-stone-600 mb-6">
          We're experiencing technical difficulties. Please try again in a few moments.
        </p>

        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          className="w-full"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </div>
    </div>
  )
}