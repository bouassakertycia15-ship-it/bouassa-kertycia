import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Check, X, MessageSquare, Mail, FileText } from 'lucide-react'

export default function AdminModeration() {
  const [tab, setTab] = useState('contributions')
  const [contributions, setContributions] = useState([])
  const [comments, setComments] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [reply, setReply] = useState({})

  const load = () => {
    api.get('/admin/contributions').then(r => setContributions(r.data)).catch(() => {})
    api.get('/admin/comments').then(r => setComments(r.data)).catch(() => {})
    api.get('/admin/testimonials').then(r => setTestimonials(r.data)).catch(() => {})
  }
  useEffect(load, [])

  const updateContribution = async (id, status, replyText) => {
    await api.put(`/admin/contributions/${id}`, { status, adminReply: replyText })
    load()
  }

  const updateComment = async (id, status) => {
    await api.put(`/admin/comments/${id}`, { status })
    load()
  }

  const updateTestimonial = async (id, status) => {
    await api.put(`/admin/testimonials/${id}`, { status })
    load()
  }

  const statusBadge = (s) => {
    const colors = { PENDING: 'bg-amber-100 text-amber-700', APPROVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700', ARCHIVED: 'bg-gray-100 text-gray-500' }
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[s] || ''}`}>{s}</span>
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Modération</h2>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('contributions')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'contributions' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Contributions ({contributions.filter(c => c.status === 'PENDING').length})</button>
        <button onClick={() => setTab('comments')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'comments' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Commentaires ({comments.filter(c => c.status === 'PENDING').length})</button>
        <button onClick={() => setTab('testimonials')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'testimonials' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Témoignages ({testimonials.filter(c => c.status === 'PENDING').length})</button>
      </div>

      {tab === 'contributions' && (
        <div className="space-y-3">
          {contributions.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-joc-600">{c.type}</span>
                {statusBadge(c.status)}
              </div>
              <h3 className="font-semibold text-gray-900">{c.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{c.content}</p>
              <p className="text-xs text-gray-400 mt-2">Par {c.authorName} {c.authorEmail ? `(${c.authorEmail})` : ''} • {new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
              {c.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <input type="text" placeholder="Réponse (optionnel)" value={reply[c.id] || ''} onChange={e => setReply({ ...reply, [c.id]: e.target.value })} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 outline-none text-sm" />
                  <button onClick={() => updateContribution(c.id, 'APPROVED', reply[c.id])} className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Check size={16} /></button>
                  <button onClick={() => updateContribution(c.id, 'REJECTED')} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><X size={16} /></button>
                  <button onClick={() => updateContribution(c.id, 'ARCHIVED')} className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100"><FileText size={16} /></button>
                </div>
              )}
              {c.adminReply && <p className="text-sm text-green-600 mt-2">Réponse : {c.adminReply}</p>}
            </div>
          ))}
          {contributions.length === 0 && <p className="text-center text-gray-500 py-8">Aucune contribution.</p>}
        </div>
      )}

      {tab === 'comments' && (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">{c.userName}</span>
                {statusBadge(c.status)}
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
              <p className="text-xs text-gray-400 mt-1">Article : {c.article?.title} • {new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
              {c.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateComment(c.id, 'APPROVED')} className="btn-primary text-xs px-3 py-1.5"><Check size={14} /> Approuver</button>
                  <button onClick={() => updateComment(c.id, 'REJECTED')} className="btn-outline text-xs px-3 py-1.5"><X size={14} /> Rejeter</button>
                </div>
              )}
            </div>
          ))}
          {comments.length === 0 && <p className="text-center text-gray-500 py-8">Aucun commentaire.</p>}
        </div>
      )}

      {tab === 'testimonials' && (
        <div className="space-y-3">
          {testimonials.map(t => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900">{t.author}</span>
                {statusBadge(t.status)}
              </div>
              <h3 className="font-semibold text-gray-900">{t.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{t.content}</p>
              {t.status === 'PENDING' && (
                <div className="flex gap-2 mt-3">
                  <button onClick={() => updateTestimonial(t.id, 'APPROVED')} className="btn-primary text-xs px-3 py-1.5"><Check size={14} /> Approuver</button>
                  <button onClick={() => updateTestimonial(t.id, 'REJECTED')} className="btn-outline text-xs px-3 py-1.5"><X size={14} /> Rejeter</button>
                </div>
              )}
            </div>
          ))}
          {testimonials.length === 0 && <p className="text-center text-gray-500 py-8">Aucun témoignage.</p>}
        </div>
      )}
    </div>
  )
}
