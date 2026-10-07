import { useEffect, useState } from 'react'
import { Link, useNavigate, Routes, Route } from 'react-router-dom'
import api, { setAuthToken } from '../api/client.js'
import AdminArticles from '../admin/AdminArticles.jsx'
import AdminPodcasts from '../admin/AdminPodcasts.jsx'
import AdminVideos from '../admin/AdminVideos.jsx'
import AdminEvents from '../admin/AdminEvents.jsx'
import AdminActivities from '../admin/AdminActivities.jsx'
import AdminMembers from '../admin/AdminMembers.jsx'
import AdminModeration from '../admin/AdminModeration.jsx'
import AdminBlog from '../admin/AdminBlog.jsx'
import AdminSettings from '../admin/AdminSettings.jsx'
import { LayoutDashboard, BookOpen, Headphones, Video, Calendar, Users, Shield, Download, Settings, LogOut, Menu, X } from 'lucide-react'

const tabs = [
  { path: '', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: 'articles', label: 'Articles', icon: BookOpen },
  { path: 'blog', label: 'Blog / Import', icon: Download },
  { path: 'podcasts', label: 'Podcasts', icon: Headphones },
  { path: 'videos', label: 'Vidéos', icon: Video },
  { path: 'evenements', label: 'Événements', icon: Calendar },
  { path: 'activites', label: 'Activités', icon: Calendar },
  { path: 'membres', label: 'Membres', icon: Users },
  { path: 'moderation', label: 'Modération', icon: Shield },
  { path: 'parametres', label: 'Paramètres', icon: Settings },
]

export default function Admin() {
  const [user, setUser] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/me').then(r => {
      setUser(r.data)
      setAuthed(true)
    }).catch(() => {
      navigate('/admin/login')
    })
  }, [])

  useEffect(() => {
    if (authed) {
      Promise.all([
        api.get('/articles', { params: { limit: 1 } }),
        api.get('/podcasts'),
        api.get('/videos'),
        api.get('/events'),
        api.get('/activities'),
        api.get('/members'),
        api.get('/admin/contributions'),
        api.get('/admin/comments'),
      ]).then(([arts, pods, vids, evts, acts, mems, contribs, comments]) => {
        setStats({
          articles: arts.data.total,
          podcasts: pods.data.length,
          videos: vids.data.length,
          events: evts.data.length,
          activities: acts.data.length,
          members: mems.data.length,
          pendingContributions: contribs.data.filter(c => c.status === 'PENDING').length,
          pendingComments: comments.data.filter(c => c.status === 'PENDING').length,
        })
      }).catch(() => {})
    }
  }, [authed])

  const logout = () => {
    setAuthToken(null)
    navigate('/admin/login')
  }

  if (!authed) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div></div>

  const Dashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Articles', value: stats.articles || 0, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
          { label: 'Podcasts', value: stats.podcasts || 0, icon: Headphones, color: 'bg-purple-50 text-purple-600' },
          { label: 'Vidéos', value: stats.videos || 0, icon: Video, color: 'bg-red-50 text-red-600' },
          { label: 'Événements', value: stats.events || 0, icon: Calendar, color: 'bg-green-50 text-green-600' },
          { label: 'Activités', value: stats.activities || 0, icon: Calendar, color: 'bg-amber-50 text-amber-600' },
          { label: 'Membres', value: stats.members || 0, icon: Users, color: 'bg-joc-50 text-joc-600' },
          { label: 'Contributions en attente', value: stats.pendingContributions || 0, icon: Shield, color: 'bg-orange-50 text-orange-600' },
          { label: 'Commentaires en attente', value: stats.pendingComments || 0, icon: Shield, color: 'bg-orange-50 text-orange-600' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-5">
              <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-gray-900 text-gray-300 z-50 transition-transform ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-joc-600 flex items-center justify-center text-white font-bold text-sm">ÉJ</div>
            <div>
              <p className="font-bold text-white text-sm">Écho Jociste</p>
              <p className="text-xs text-gray-500">Administration</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.path}
                to={`/admin${tab.path ? '/' + tab.path : ''}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors"
              >
                <Icon size={18} /> {tab.label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{user?.name}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white" title="Déconnexion">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {menuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-bold text-gray-900">Admin</span>
          <Link to="/" className="text-sm text-joc-600">Voir le site</Link>
        </header>

        <header className="hidden lg:flex bg-white border-b border-gray-200 px-6 py-3 items-center justify-between">
          <span className="text-sm text-gray-500">Connecté en tant que <strong className="text-gray-900">{user?.name}</strong> ({user?.role})</span>
          <Link to="/" className="text-sm text-joc-600 hover:underline">Voir le site →</Link>
        </header>

        <main className="p-4 md:p-6 max-w-6xl mx-auto pb-20 lg:pb-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/articles" element={<AdminArticles />} />
            <Route path="/blog" element={<AdminBlog />} />
            <Route path="/podcasts" element={<AdminPodcasts />} />
            <Route path="/videos" element={<AdminVideos />} />
            <Route path="/evenements" element={<AdminEvents />} />
            <Route path="/activites" element={<AdminActivities />} />
            <Route path="/membres" element={<AdminMembers />} />
            <Route path="/moderation" element={<AdminModeration />} />
            <Route path="/parametres" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
