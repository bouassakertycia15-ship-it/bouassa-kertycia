import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send, Flag, Pin, Lock, Eye, MessageSquare } from 'lucide-react'
import api, { setAuthToken } from '../api/client.js'

export default function ForumDiscussion() {
  const { slug } = useParams()
  const [discussion, setDiscussion] = useState(null)
  const [reply, setReply] = useState('')
  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/forum/discussions/${slug}`).then(r => setDiscussion(r.data)).catch(() => {})
    const token = localStorage.getItem('echo_token')
    if (token) {
      api.get('/auth/me').then(r => setUser(r.data)).catch(() => {})
    }
  }, [slug])

  const handleReply = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/connexion'); return }
    if (!reply.trim()) return
    try {
      await api.post(`/forum/discussions/${slug}/posts`, { content: reply })
      setReply('')
      const r = await api.get(`/forum/discussions/${slug}`)
      setDiscussion(r.data)
    } catch (err) {
      if (err.response?.status === 401) navigate('/connexion')
    }
  }

  const handleReport = async (e) => {
    e.preventDefault()
    if (!reportReason.trim()) return
    try {
      await api.post('/forum/report', {
        reason: reportReason,
        reporterName: user?.name || 'Anonyme',
        discussionId: discussion.id,
      })
      setReportOpen(false)
      setReportReason('')
      alert('Signalement envoyé. Merci.')
    } catch (err) { console.error(err) }
  }

  if (!discussion) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div></div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <Link to="/forum" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-joc-600 mb-4">
        <ArrowLeft size={16} /> Retour au forum
      </Link>

      {/* Discussion header */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          {discussion.pinned && <Pin size={16} className="text-joc-600" />}
          {discussion.locked && <Lock size={16} className="text-gray-400" />}
          <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{discussion.forumCategory?.name}</span>
          <span className="flex items-center gap-1 text-xs text-gray-400"><Eye size={12} /> {discussion.views} vues</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900">{discussion.title}</h1>
        <p className="text-gray-600 mt-2 prose-content">{discussion.content}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <span className="text-sm text-gray-500">par <strong>{discussion.authorName}</strong> · {new Date(discussion.createdAt).toLocaleDateString('fr-FR')}</span>
          <button onClick={() => setReportOpen(!reportOpen)} className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1">
            <Flag size={14} /> Signaler
          </button>
        </div>
      </div>

      {/* Report form */}
      {reportOpen && (
        <form onSubmit={handleReport} className="bg-red-50 rounded-xl border border-red-100 p-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Raison du signalement</label>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            rows={2}
            className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-red-400"
            placeholder="Expliquez pourquoi vous signalez cette discussion..."
          />
          <button type="submit" className="btn bg-red-500 text-white hover:bg-red-600 mt-2 text-sm">Envoyer le signalement</button>
        </form>
      )}

      {/* Posts */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-500 flex items-center gap-1">
          <MessageSquare size={16} /> {discussion.posts?.length || 0} réponse(s)
        </h2>
        {discussion.posts?.map((post) => (
          <div key={post.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-joc-100 text-joc-600 flex items-center justify-center text-sm font-bold">
                {post.authorName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{post.authorName}</p>
                <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>
          </div>
        ))}
      </div>

      {/* Reply form */}
      {!discussion.locked ? (
        <form onSubmit={handleReply} className="mt-6 bg-white rounded-xl border border-gray-100 p-4">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-joc-500 resize-none"
            placeholder={user ? "Écrivez votre réponse..." : "Connectez-vous pour répondre"}
            disabled={!user}
          />
          <button type="submit" disabled={!reply.trim()} className="btn-primary mt-2 disabled:opacity-50">
            <Send size={16} /> Répondre
          </button>
          {!user && <p className="text-xs text-gray-400 mt-2"><Link to="/connexion" className="text-joc-600">Connectez-vous</Link> pour participer à la discussion.</p>}
        </form>
      ) : (
        <div className="mt-6 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
          <Lock size={16} /> Cette discussion est fermée.
        </div>
      )}
    </div>
  )
}
