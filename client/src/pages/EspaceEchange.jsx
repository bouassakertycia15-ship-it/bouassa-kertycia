import { useState } from 'react'
import api from '../api/client.js'
import { MessageSquare, Lightbulb, Heart, Mic, Video, Send, FileText } from 'lucide-react'

const contributionTypes = [
  { value: 'QUESTION', label: 'Poser une question', icon: MessageSquare },
  { value: 'TOPIC', label: 'Proposer un sujet', icon: Lightbulb },
  { value: 'TESTIMONY', label: 'Envoyer un témoignage', icon: Heart },
  { value: 'EXPERIENCE', label: 'Partager une expérience', icon: FileText },
  { value: 'IDEA', label: 'Proposer une idée', icon: Lightbulb },
  { value: 'ARTICLE_PROPOSAL', label: 'Proposer un article', icon: FileText },
  { value: 'PODCAST_PROPOSAL', label: 'Proposer un podcast', icon: Mic },
  { value: 'VIDEO_PROPOSAL', label: 'Proposer une vidéo', icon: Video },
]

export default function EspaceEchange() {
  const [form, setForm] = useState({ type: 'QUESTION', title: '', content: '', authorName: '', authorEmail: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.content || !form.authorName) { setError('Titre, contenu et nom sont requis'); return }
    setError('')
    try {
      await api.post('/contributions', form)
      setSent(true)
      setForm({ type: 'QUESTION', title: '', content: '', authorName: '', authorEmail: '' })
      setTimeout(() => setSent(false), 5000)
    } catch {
      setError('Erreur lors de l\'envoi. Réessayez.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Espace d'échange</h1>
        <p className="text-gray-500">
          Partagez vos questions, idées, témoignages et propositions. Toutes les contributions sont modérées avant publication.
        </p>
      </div>

      {sent && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg text-sm">
          Contribution envoyée ! Elle sera publiée après modération par l'équipe Écho Jociste.
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-4 bg-white rounded-xl border border-gray-100 p-6">
        {/* Type selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type de contribution</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {contributionTypes.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-colors ${
                    form.type === t.value
                      ? 'border-joc-500 bg-joc-50 text-joc-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>

        <input
          type="text"
          placeholder="Titre *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
        />
        <textarea
          placeholder="Votre message *"
          rows="5"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none resize-none"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Votre nom *"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
          />
          <input
            type="email"
            placeholder="Votre email (optionnel)"
            value={form.authorEmail}
            onChange={(e) => setForm({ ...form, authorEmail: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
          />
        </div>
        <button type="submit" className="btn-primary w-full">
          <Send size={16} /> Envoyer
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-4">
        Vos contributions sont modérées avant publication pour garantir le respect et la qualité des échanges.
      </p>
    </div>
  )
}
