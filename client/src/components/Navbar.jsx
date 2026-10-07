import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, X, Home, BookOpen, Users, Headphones, Video, Calendar, MoreHorizontal, User, MessageSquare, Info, Phone, Shield, FileText, LogIn, ChevronDown } from 'lucide-react'
import api from '../api/client.js'

const navLinks = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/magazine', label: 'Magazine', icon: BookOpen },
  { to: '/pourquoi-etre-jociste', label: 'JOC', icon: Users },
  { to: '/echo-audio', label: 'Audio', icon: Headphones },
  { to: '/videos', label: 'Vidéos', icon: Video },
  { to: '/evenements', label: 'Événements', icon: Calendar },
  { to: '/equipe', label: 'Équipe', icon: Users },
]

const moreLinks = [
  { to: '/forum', label: 'Forum', icon: MessageSquare },
  { to: '/famille-joc', label: 'Famille JOC', icon: Users },
  { to: '/contact', label: 'Contact', icon: Phone },
  { to: '/a-propos', label: 'À propos', icon: Info },
  { to: '/confidentialite', label: 'Confidentialité', icon: Shield },
  { to: '/mentions-legales', label: 'Mentions légales', icon: FileText },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
    setMoreOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const token = localStorage.getItem('echo_token')
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => {})
    }
  }, [location.pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/recherche?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-10 h-10 rounded-lg bg-joc-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                ÉJ
              </div>
              <div className="hidden sm:block">
                <span className="block font-bold text-gray-900 leading-tight">Écho Jociste</span>
                <span className="block text-xs text-gray-500 leading-tight">JOC Congo-Brazzaville</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'text-joc-600 bg-joc-50'
                      : 'text-gray-600 hover:text-joc-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {/* Plus dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    moreOpen ? 'text-joc-600 bg-joc-50' : 'text-gray-600 hover:text-joc-600 hover:bg-gray-50'
                  }`}
                >
                  Plus <ChevronDown size={14} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
                </button>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      {moreLinks.map((link) => {
                        const Icon = link.icon
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-joc-600"
                          >
                            <Icon size={16} /> {link.label}
                          </Link>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Recherche"
              >
                {searchOpen ? <X size={20} /> : <Search size={20} />}
              </button>
              {user ? (
                <Link to="/mon-espace" className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100">
                  <div className="w-8 h-8 rounded-full bg-joc-100 text-joc-600 flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name?.split(' ')[0]}</span>
                </Link>
              ) : (
                <Link to="/connexion" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                  <LogIn size={16} /> Connexion
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Menu"
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div className="pb-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher : Cardijn, JOC, foi, engagement..."
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
                />
                <button type="submit" className="btn-primary">Rechercher</button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="lg:hidden border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      location.pathname === link.to
                        ? 'text-joc-600 bg-joc-50'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                )
              })}
              <div className="pt-2 mt-2 border-t border-gray-100">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Plus</p>
                {moreLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Icon size={18} /> {link.label}
                    </Link>
                  )
                })}
              </div>
              {!user && (
                <Link to="/connexion" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-joc-600 hover:bg-joc-50">
                  <LogIn size={18} /> Connexion / Inscription
                </Link>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* Bottom nav for mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around py-2 px-1">
        {navLinks.slice(0, 4).map((link) => {
          const Icon = link.icon
          const active = location.pathname === link.to
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg ${
                active ? 'text-joc-600' : 'text-gray-500'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg text-gray-500"
        >
          <MoreHorizontal size={20} />
          <span className="text-[10px] font-medium">Plus</span>
        </button>
      </nav>
    </>
  )
}
