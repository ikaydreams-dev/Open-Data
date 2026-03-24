import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, Menu, X, Database, User, LogOut, Settings, Key } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { authApi } from '../../api/auth.api'
import { useDebounce } from '../../hooks/useDebounce'
import { searchApi } from '../../api/search.api'
import toast from 'react-hot-toast'

export function Navbar() {
  const { user, isAuthenticated, clearAuth } = useAuthStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (debouncedQuery.length < 2) { setSuggestions([]); return }
    searchApi.autocomplete(debouncedQuery)
      .then((res) => setSuggestions(res.data?.results || []))
      .catch(() => setSuggestions([]))
  }, [debouncedQuery])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      setSuggestions([])
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {}
    clearAuth()
    navigate('/')
    toast.success('Signed out.')
  }

  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 font-bold text-orange-700 text-lg">
          <Database size={22} />
          <span className="hidden sm:block">OpenData Africa</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 relative max-w-xl">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search datasets…"
            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-full border border-stone-200 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
          />
          {suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => { navigate(`/search?q=${encodeURIComponent(s)}`); setSuggestions([]) }}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          <NavLink to="/datasets" className={({ isActive }) => `px-3 py-1.5 rounded-md transition-colors ${isActive ? 'text-orange-700 bg-orange-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}>
            Datasets
          </NavLink>
          <NavLink to="/community" className={({ isActive }) => `px-3 py-1.5 rounded-md transition-colors ${isActive ? 'text-orange-700 bg-orange-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'}`}>
            Community
          </NavLink>
        </nav>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-stone-100"
              >
                <div className="w-7 h-7 rounded-full bg-orange-700 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-stone-700 max-w-24 truncate">{user?.name}</span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-50">
                  <Link to={`/users/${user?.username}`} className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setDropdownOpen(false)}>
                    <User size={15} /> Profile
                  </Link>
                  <Link to="/account/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setDropdownOpen(false)}>
                    <Settings size={15} /> Settings
                  </Link>
                  <Link to="/account/api-keys" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50" onClick={() => setDropdownOpen(false)}>
                    <Key size={15} /> API Keys
                  </Link>
                  <hr className="my-1 border-stone-100" />
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                    <LogOut size={15} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/sign-in" className="px-3 py-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-100">
                Sign in
              </Link>
              <Link to="/sign-up" className="px-3 py-1.5 text-sm font-medium bg-orange-700 text-white rounded-md hover:bg-orange-800">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMobileOpen((o) => !o)} className="md:hidden p-1.5 rounded-md text-stone-600 hover:bg-stone-100">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white px-4 pb-4 space-y-1">
          <NavLink to="/datasets" className="block px-3 py-2 text-sm rounded-md text-stone-700 hover:bg-stone-50" onClick={() => setMobileOpen(false)}>Datasets</NavLink>
          <NavLink to="/community" className="block px-3 py-2 text-sm rounded-md text-stone-700 hover:bg-stone-50" onClick={() => setMobileOpen(false)}>Community</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to={`/users/${user?.username}`} className="block px-3 py-2 text-sm rounded-md text-stone-700 hover:bg-stone-50" onClick={() => setMobileOpen(false)}>Profile</NavLink>
              <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="block w-full text-left px-3 py-2 text-sm rounded-md text-red-600 hover:bg-red-50">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/sign-in" className="block px-3 py-2 text-sm rounded-md text-stone-700 hover:bg-stone-50" onClick={() => setMobileOpen(false)}>Sign in</Link>
              <Link to="/sign-up" className="block px-3 py-2 text-sm rounded-md text-orange-700 font-medium hover:bg-orange-50" onClick={() => setMobileOpen(false)}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
