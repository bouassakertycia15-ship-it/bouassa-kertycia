import { useEffect, useState } from 'react'
import api from '../api/client.js'
import AudioPlayer from '../components/AudioPlayer.jsx'
import ShareButtons from '../components/ShareButtons.jsx'
import { Headphones, Calendar, User, Search } from 'lucide-react'

export default function EchoAudio() {
  const [podcasts, setPodcasts] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filter) params.category = filter
    if (search) params.search = search
    api.get('/podcasts', { params }).then(r => {
      setPodcasts(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filter, search])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
          <Headphones size={32} className="text-purple-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Écho Audio</h1>
        <p className="text-gray-500">Podcasts, conférences, témoignages, enseignements et réflexions.</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un podcast..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filter ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tous
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setFilter(c.slug)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === c.slug ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Player for selected podcast */}
      {selected && (
        <div className="mb-6 sticky top-16 z-20 bg-white/95 backdrop-blur p-4 rounded-xl shadow-md border border-gray-100">
          <p className="font-semibold text-gray-900 mb-2 truncate">{selected.title}</p>
          <AudioPlayer src={selected.audioUrl} title={selected.title} />
        </div>
      )}

      {/* Podcast list */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
      ) : podcasts.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Aucun podcast trouvé.</p>
      ) : (
        <div className="space-y-4">
          {podcasts.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex gap-4">
                {p.coverImage ? (
                  <img src={p.coverImage} alt={p.title} className="w-20 h-20 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                    <Headphones size={28} className="text-purple-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">{p.title}</h3>
                  {p.description && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{p.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-2">
                    {p.speaker && <span className="flex items-center gap-1"><User size={12} /> {p.speaker}</span>}
                    {p.duration && <span>{p.duration}</span>}
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(p.publishedAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(p)} className="btn-primary text-xs px-3 py-1.5">
                      <Headphones size={14} /> Écouter
                    </button>
                    <ShareButtons title={p.title} path={`/echo-audio`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
