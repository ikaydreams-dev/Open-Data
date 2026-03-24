import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-stone-900 text-stone-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <span className="text-white font-bold text-lg">OpenData Africa</span>
          <p className="text-sm mt-2 leading-relaxed">
            The largest structured data ecosystem for Africa.
          </p>
        </div>
        <div>
          <h4 className="text-stone-200 font-medium mb-3 text-sm">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/datasets" className="hover:text-white transition-colors">Datasets</Link></li>
            <li><Link to="/search" className="hover:text-white transition-colors">Search</Link></li>
            <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-stone-200 font-medium mb-3 text-sm">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sign-up" className="hover:text-white transition-colors">Sign up</Link></li>
            <li><Link to="/sign-in" className="hover:text-white transition-colors">Sign in</Link></li>
            <li><Link to="/account/api-keys" className="hover:text-white transition-colors">API Keys</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-stone-200 font-medium mb-3 text-sm">About</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-stone-500">Africa Data Hub</span></li>
            <li><span className="text-stone-500">openAFRICA</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-800 px-4 py-4 text-center text-xs text-stone-600">
        © {new Date().getFullYear()} OpenData Africa. All rights reserved.
      </div>
    </footer>
  )
}
