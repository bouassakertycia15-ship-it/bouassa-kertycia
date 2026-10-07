import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, Plus, Pin, Lock, Eye, ChevronRight, Search } from 'lucide-react'
import api from '../api/client.js'

export default function Forum() {
  const [categories, setCategories] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeCat, setActiveCat] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/forum/categories'),
      api.get('/forum/discussions', { params: { category: activeCat, search } }),
    ]).then(([cats, discs]) => {
      setCategories(cats.data)
      setDiscussions(discs.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [activeCat, search])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-joc-600" /> Forum Écho Jociste
          </h1>
          <p className="text-sm text-gray-500 mt-1">Échangez autour de la foi, de la JOC et de l'engagement</p>
        </div>
        <button onClick={() => navigate('/forum/nouvelle-discussion')} className="btn-primary shrink-0">
          <Plus size={18} /> <span className="hidden sm:inline">Nouvelle discussion</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher dans le forum..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        <button
          onClick={() => setActiveCat('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
            !activeCat ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${
              activeCat === cat.slug ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Discussions */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        </div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">Aucune discussion pour le moment</p>
          <button onClick={() => navigate('/forum/nouvelle-discussion')} className="btn-primary">
            <Plus size={18} /> Démarrer une discussion
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {discussions.map((d) => (
            <Link
              key={d.id}
              to={`/forum/${d.slug}`}
              className="card p-4 flex items-start gap-3 hover:border-joc-200"
            >
              {d.pinned && <Pin size={16} className="text-joc-600 mt-1 shrink-0" />}
              {d.locked && <Lock size={16} className="text-gray-400 mt-1 shrink-0" />}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{d.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{d.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{d.forumCategory?.name}</span>
                  <span>par {d.authorName}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {d._count?.posts || 0}</span>
                  <span className="flex items-center gap-1"><Eye size={12} /> {d.views}</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-300 shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
