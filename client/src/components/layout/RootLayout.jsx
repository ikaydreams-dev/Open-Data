import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { EmailVerificationBanner } from '../auth/EmailVerificationBanner'

export function RootLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <EmailVerificationBanner />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
