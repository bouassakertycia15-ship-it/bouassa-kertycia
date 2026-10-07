import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import api from '../api/client.js'

export default function NewDiscussion() {
  const [categories, setCategories] = useState([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => navigate('/connexion'))
    api.get('/forum/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !categoryId) {
      setError('Tous les champs sont requis')
      return
    }
    try {
      const r = await api.post('/forum/discussions', { title, content, forumCategoryId: categoryId })
      navigate(`/forum/${r.data.slug}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    }
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      <button onClick={() => navigate('/forum')} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-joc-600 mb-4">
        <ArrowLeft size={16} /> Retour au forum
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle discussion</h1>

      {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500"
          >
            <option value="">Choisir une catégorie...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500"
            placeholder="Ex: Comment vivre la méthode Voir-Juger-Agir au quotidien ?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none"
            placeholder="Décrivez votre question ou votre réflexion..."
          />
        </div>
        <button type="submit" className="btn-primary">
          <Send size={16} /> Publier la discussion
        </button>
      </form>
    </div>
  )
}
