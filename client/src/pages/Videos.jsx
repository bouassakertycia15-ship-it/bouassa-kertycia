import { useEffect, useState } from 'react'
import api from '../api/client.js'
import ShareButtons from '../components/ShareButtons.jsx'
import { Video, Play, Calendar, User, Search } from 'lucide-react'

export default function Videos() {
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [filter, setFilter] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [playing, setPlaying] = useState(null)

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filter) params.category = filter
    if (search) params.search = search
    api.get('/videos', { params }).then(r => {
      setVideos(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filter, search])

  const getYouTubeEmbed = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?]+)/)
    return match ? match[1] : null
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-3">
          <Video size={32} className="text-red-600" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Vidéos</h1>
        <p className="text-gray-500">Activités JOC, conférences, camps, témoignages, reportages et formations.</p>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une vidéo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filter ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Toutes</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => setFilter(c.slug)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === c.slug ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c.name}</button>
        ))}
      </div>

      {playing && (
        <div className="mb-6">
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            {getYouTubeEmbed(playing.videoUrl) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeEmbed(playing.videoUrl)}`}
                title={playing.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={playing.videoUrl} controls className="w-full h-full" />
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      ) : videos.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Aucune vidéo trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {videos.map((v) => (
            <div key={v.id} className="card group">
              <button onClick={() => setPlaying(v)} className="relative w-full aspect-video bg-gray-100 overflow-hidden block">
                {v.thumbnail && <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={24} className="text-red-600 ml-1" fill="currentColor" />
                  </div>
                </div>
              </button>
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{v.title}</h3>
                {v.description && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{v.description}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-2">
                  {v.speaker && <span className="flex items-center gap-1"><User size={12} /> {v.speaker}</span>}
                  <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(v.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPlaying(v)} className="btn-primary text-xs px-3 py-1.5">
                    <Play size={14} /> Regarder
                  </button>
                  <ShareButtons title={v.title} path="/videos" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
