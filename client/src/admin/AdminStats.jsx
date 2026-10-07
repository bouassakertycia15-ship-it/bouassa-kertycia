import { useState, useEffect } from 'react'
import { TrendingUp, Eye, Users, MessageSquare, FileText, Headphones, Video, Calendar } from 'lucide-react'
import api from '../api/client.js'

export default function AdminStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
  }, [])

  if (!stats) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div></div>

  const { counts, topContent, recentActivity, recentDiscussions } = stats

  const statCards = [
    { label: 'Articles publiés', value: counts.publishedArticles, icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { label: 'Brouillons', value: counts.draftArticles, icon: FileText, color: 'bg-gray-50 text-gray-600' },
    { label: 'En révision', value: counts.reviewArticles, icon: FileText, color: 'bg-amber-50 text-amber-600' },
    { label: 'Podcasts', value: counts.podcasts, icon: Headphones, color: 'bg-purple-50 text-purple-600' },
    { label: 'Vidéos', value: counts.videos, icon: Video, color: 'bg-red-50 text-red-600' },
    { label: 'Événements', value: counts.events, icon: Calendar, color: 'bg-green-50 text-green-600' },
    { label: 'Membres', value: counts.members, icon: Users, color: 'bg-joc-50 text-joc-600' },
    { label: 'Utilisateurs', value: counts.users, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Discussions forum', value: counts.forumDiscussions, icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
    { label: 'Tâches en attente', value: counts.pendingTasks, icon: FileText, color: 'bg-orange-50 text-orange-600' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2"><TrendingUp className="text-gray-500" /> Statistiques</h2>
      <p className="text-sm text-gray-500 mb-6">Vue d'ensemble de la plateforme</p>

      {/* Counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-lg ${s.color} flex items-center justify-center mb-2`}>
                <Icon size={16} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Pending items */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">À traiter</h3>
        <div className="space-y-2">
          {counts.pendingTestimonials > 0 && <p className="text-sm text-orange-600">📋 {counts.pendingTestimonials} témoignage(s) à valider</p>}
          {counts.pendingComments > 0 && <p className="text-sm text-orange-600">💬 {counts.pendingComments} commentaire(s) à modérer</p>}
          {counts.pendingContributions > 0 && <p className="text-sm text-orange-600">✉️ {counts.pendingContributions} contribution(s) en attente</p>}
          {counts.reportedContent > 0 && <p className="text-sm text-red-600">🚩 {counts.reportedContent} contenu(s) signalé(s)</p>}
          {counts.pendingTestimonials === 0 && counts.pendingComments === 0 && counts.pendingContributions === 0 && counts.reportedContent === 0 && <p className="text-sm text-green-600">✅ Tout est à jour !</p>}
        </div>
      </div>

      {/* Top content */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Eye size={16} className="text-gray-400" /> Articles les plus consultés</h3>
          <div className="space-y-2">
            {topContent.articles.map((a, i) => (
              <div key={a.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{i + 1}. {a.title}</span>
                <span className="text-gray-400 ml-2">{a.viewCount} vues</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Headphones size={16} className="text-gray-400" /> Podcasts les plus écoutés</h3>
          <div className="space-y-2">
            {topContent.podcasts.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{i + 1}. {p.title}</span>
                <span className="text-gray-400 ml-2">{p.viewCount} écoutes</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Video size={16} className="text-gray-400" /> Vidéos les plus regardées</h3>
          <div className="space-y-2">
            {topContent.videos.map((v, i) => (
              <div key={v.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{i + 1}. {v.title}</span>
                <span className="text-gray-400 ml-2">{v.viewCount} vues</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Calendar size={16} className="text-gray-400" /> Événements les plus consultés</h3>
          <div className="space-y-2">
            {topContent.events.map((e, i) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{i + 1}. {e.title}</span>
                <span className="text-gray-400 ml-2">{e.viewCount} vues</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent discussions */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Discussions récentes du forum</h3>
        <div className="space-y-2">
          {recentDiscussions.map((d) => (
            <div key={d.id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700 truncate flex-1">{d.title}</span>
              <span className="text-gray-400 ml-2">{d._count?.posts || 0} messages</span>
            </div>
          ))}
          {recentDiscussions.length === 0 && <p className="text-gray-400 text-sm">Aucune discussion</p>}
        </div>
      </div>
    </div>
  )
}
