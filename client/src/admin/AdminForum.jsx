import { useState, useEffect } from 'react'
import { Pin, Lock, Eye, Trash2, Flag, MessageSquare, X } from 'lucide-react'
import api from '../api/client.js'

export default function AdminForum() {
  const [discussions, setDiscussions] = useState([])
  const [reports, setReports] = useState([])
  const [tab, setTab] = useState('discussions')

  useEffect(() => {
    api.get('/admin/forum/discussions').then(r => setDiscussions(r.data)).catch(() => {})
    api.get('/admin/forum/reports').then(r => setReports(r.data)).catch(() => {})
  }, [])

  const toggleField = async (id, field, value) => {
    try {
      await api.put(`/admin/forum/discussions/${id}`, { [field]: value })
      setDiscussions(discussions.map(d => d.id === id ? { ...d, [field]: value } : d))
    } catch (err) { console.error(err) }
  }

  const deleteDiscussion = async (id) => {
    if (!confirm('Supprimer cette discussion ?')) return
    await api.delete(`/admin/forum/discussions/${id}`)
    setDiscussions(discussions.filter(d => d.id !== id))
  }

  const resolveReport = async (id, status) => {
    await api.put(`/admin/forum/reports/${id}`, { status })
    setReports(reports.map(r => r.id === id ? { ...r, status } : r))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion du Forum</h2>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('discussions')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'discussions' ? 'bg-joc-600 text-white' : 'bg-gray-100'}`}>Discussions</button>
        <button onClick={() => setTab('reports')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'reports' ? 'bg-joc-600 text-white' : 'bg-gray-100'}`}>
          Signalements {reports.filter(r => r.status === 'PENDING').length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs">{reports.filter(r => r.status === 'PENDING').length}</span>}
        </button>
      </div>

      {tab === 'discussions' && (
        <div className="space-y-2">
          {discussions.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {d.pinned && <Pin size={14} className="text-joc-600" />}
                    {d.locked && <Lock size={14} className="text-gray-400" />}
                    <h3 className="font-semibold text-gray-900 truncate">{d.title}</h3>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    par {d.authorName} · {d.forumCategory?.name} · {d._count?.posts || 0} messages
                    {d._count?.reports > 0 && <span className="text-red-500 ml-2">· {d._count.reports} signalement(s)</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleField(d.id, 'pinned', !d.pinned)} title="Épingler" className={`p-1.5 rounded-lg ${d.pinned ? 'text-joc-600 bg-joc-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    <Pin size={16} />
                  </button>
                  <button onClick={() => toggleField(d.id, 'locked', !d.locked)} title="Fermer" className={`p-1.5 rounded-lg ${d.locked ? 'text-gray-600 bg-gray-100' : 'text-gray-400 hover:bg-gray-100'}`}>
                    <Lock size={16} />
                  </button>
                  <button onClick={() => toggleField(d.id, 'hidden', !d.hidden)} title="Masquer" className={`p-1.5 rounded-lg ${d.hidden ? 'text-amber-600 bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}>
                    <Eye size={16} />
                  </button>
                  <button onClick={() => deleteDiscussion(d.id)} title="Supprimer" className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {discussions.length === 0 && <p className="text-center text-gray-400 py-8">Aucune discussion</p>}
        </div>
      )}

      {tab === 'reports' && (
        <div className="space-y-2">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-start gap-3">
                <Flag size={16} className="text-red-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{r.reason}</p>
                  <p className="text-xs text-gray-400">par {r.reporterName} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
                  {r.discussion && <p className="text-sm text-gray-600 mt-1">Discussion: « {r.discussion.title} »</p>}
                  {r.post && <p className="text-sm text-gray-600 mt-1">Message: « {r.post.content?.slice(0, 80)}... »</p>}
                </div>
                <div className="flex gap-1">
                  {r.status === 'PENDING' && (
                    <>
                      <button onClick={() => resolveReport(r.id, 'APPROVED')} className="px-2 py-1 rounded-lg bg-green-50 text-green-600 text-xs hover:bg-green-100">Traiter</button>
                      <button onClick={() => resolveReport(r.id, 'REJECTED')} className="px-2 py-1 rounded-lg bg-gray-50 text-gray-500 text-xs hover:bg-gray-100">Ignorer</button>
                    </>
                  )}
                  {r.status !== 'PENDING' && <span className="text-xs text-gray-400">{r.status}</span>}
                </div>
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-center text-gray-400 py-8">Aucun signalement</p>}
        </div>
      )}
    </div>
  )
}
