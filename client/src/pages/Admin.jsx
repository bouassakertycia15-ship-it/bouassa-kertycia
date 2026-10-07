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
import AdminForum from '../admin/AdminForum.jsx'
import AdminAuditLog from '../admin/AdminAuditLog.jsx'
import AdminTasks from '../admin/AdminTasks.jsx'
import AdminStats from '../admin/AdminStats.jsx'
import AdminMedia from '../admin/AdminMedia.jsx'
import AdminUsers from '../admin/AdminUsers.jsx'
import { LayoutDashboard, BookOpen, Headphones, Video, Calendar, Users, Shield, Download, Settings, LogOut, Menu, X, MessageSquare, ScrollText, CheckSquare, BarChart3, Image, UserCog } from 'lucide-react'

const tabs = [
  { path: '', label: 'Tableau de bord', icon: LayoutDashboard },
  { path: 'articles', label: 'Magazine', icon: BookOpen },
  { path: 'blog', label: 'Blog / Import', icon: Download },
  { path: 'podcasts', label: 'Podcasts', icon: Headphones },
  { path: 'videos', label: 'Vidéos', icon: Video },
  { path: 'forum', label: 'Forum', icon: MessageSquare },
  { path: 'evenements', label: 'Événements', icon: Calendar },
  { path: 'activites', label: 'Activités JOC', icon: Calendar },
  { path: 'membres', label: 'Équipe', icon: Users },
  { path: 'moderation', label: 'Modération', icon: Shield },
  { path: 'taches', label: 'Tâches', icon: CheckSquare },
  { path: 'utilisateurs', label: 'Utilisateurs', icon: UserCog },
  { path: 'medias', label: 'Médias', icon: Image },
  { path: 'statistiques', label: 'Statistiques', icon: BarChart3 },
  { path: 'historique', label: 'Traçabilité', icon: ScrollText },
  { path: 'parametres', label: 'Paramètres', icon: Settings },
]

export default function Admin() {
  const [user, setUser] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState(null)
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
      api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
    }
  }, [authed])

  const logout = () => {
    setAuthToken(null)
    navigate('/admin/login')
  }

  if (!authed) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div></div>

  const Dashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Bonjour, {user?.name}</h2>
      <p className="text-sm text-gray-500 mb-6">Voici ce qui nécessite votre attention :</p>

      {/* À traiter */}
      {stats && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">À traiter</h3>
          <div className="space-y-2">
            {stats.counts.draftArticles > 0 && <Link to="/admin/articles" className="flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2">
              <span className="text-gray-700">📝 {stats.counts.draftArticles} article(s) en brouillon</span>
              <span className="text-gray-400">→</span>
            </Link>}
            {stats.counts.reviewArticles > 0 && <Link to="/admin/articles" className="flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2">
              <span className="text-gray-700">📋 {stats.counts.reviewArticles} article(s) en révision</span>
              <span className="text-gray-400">→</span>
            </Link>}
            {stats.counts.pendingTestimonials > 0 && <Link to="/admin/moderation" className="flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2">
              <span className="text-gray-700">✍️ {stats.counts.pendingTestimonials} témoignage(s) à valider</span>
              <span className="text-gray-400">→</span>
            </Link>}
            {stats.counts.pendingComments > 0 && <Link to="/admin/moderation" className="flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2">
              <span className="text-gray-700">💬 {stats.counts.pendingComments} commentaire(s) à modérer</span>
              <span className="text-gray-400">→</span>
            </Link>}
            {stats.counts.pendingContributions > 0 && <Link to="/admin/moderation" className="flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2">
              <span className="text-gray-700">✉️ {stats.counts.pendingContributions} contribution(s) en attente</span>
              <span className="text-gray-400">→</span>
            </Link>}
            {stats.counts.reportedContent > 0 && <Link to="/admin/forum" className="flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2">
              <span className="text-red-600">🚩 {stats.counts.reportedContent} contenu(s) signalé(s)</span>
              <span className="text-gray-400">→</span>
            </Link>}
            {stats.counts.pendingTasks > 0 && <Link to="/admin/taches" className="flex items-center justify-between text-sm hover:bg-gray-50 rounded-lg p-2 -mx-2">
              <span className="text-gray-700">✅ {stats.counts.pendingTasks} tâche(s) en cours</span>
              <span className="text-gray-400">→</span>
            </Link>}
            {stats.counts.draftArticles === 0 && stats.counts.pendingTestimonials === 0 && stats.counts.pendingComments === 0 && stats.counts.pendingContributions === 0 && stats.counts.reportedContent === 0 && stats.counts.pendingTasks === 0 && (
              <p className="text-sm text-green-600">✅ Tout est à jour !</p>
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Articles', value: stats.counts.articles, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
            { label: 'Podcasts', value: stats.counts.podcasts, icon: Headphones, color: 'bg-purple-50 text-purple-600' },
            { label: 'Vidéos', value: stats.counts.videos, icon: Video, color: 'bg-red-50 text-red-600' },
            { label: 'Événements', value: stats.counts.events, icon: Calendar, color: 'bg-green-50 text-green-600' },
            { label: 'Membres', value: stats.counts.members, icon: Users, color: 'bg-joc-50 text-joc-600' },
            { label: 'Utilisateurs', value: stats.counts.users, icon: UserCog, color: 'bg-indigo-50 text-indigo-600' },
            { label: 'Discussions', value: stats.counts.forumDiscussions, icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
            { label: 'Tâches', value: stats.counts.tasks, icon: CheckSquare, color: 'bg-orange-50 text-orange-600' },
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
      )}

      {/* Recent activity */}
      {stats?.recentActivity?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Activité récente</h3>
          <div className="space-y-2">
            {stats.recentActivity.slice(0, 5).map((log) => (
              <div key={log.id} className="text-sm text-gray-600 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-joc-500"></div>
                <span>{log.userName} · {log.action.replace(/_/g, ' ').toLowerCase()}</span>
                {log.entityTitle && <span className="text-gray-400">« {log.entityTitle} »</span>}
                <span className="text-gray-400 ml-auto text-xs">{new Date(log.createdAt).toLocaleDateString('fr-FR')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
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
        <nav className="p-3 space-y-0.5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Link
                key={tab.path}
                to={`/admin${tab.path ? '/' + tab.path : ''}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors"
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
            <Route path="/forum" element={<AdminForum />} />
            <Route path="/evenements" element={<AdminEvents />} />
            <Route path="/activites" element={<AdminActivities />} />
            <Route path="/membres" element={<AdminMembers />} />
            <Route path="/moderation" element={<AdminModeration />} />
            <Route path="/taches" element={<AdminTasks />} />
            <Route path="/utilisateurs" element={<AdminUsers />} />
            <Route path="/medias" element={<AdminMedia />} />
            <Route path="/statistiques" element={<AdminStats />} />
            <Route path="/historique" element={<AdminAuditLog />} />
            <Route path="/parametres" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
