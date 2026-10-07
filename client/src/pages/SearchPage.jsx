import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../api/client.js'
import { Search as SearchIcon, BookOpen, Headphones, Video, Calendar, User, Activity } from 'lucide-react'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    api.get('/search', { params: { q } }).then(r => {
      setResults(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [q])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <SearchIcon size={24} /> Recherche
        </h1>
        <p className="text-gray-500">Résultats pour : <strong>« {q} »</strong></p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        </div>
      ) : !results ? (
        <p className="text-center text-gray-500 py-20">Saisissez un terme de recherche.</p>
      ) : results.total === 0 ? (
        <p className="text-center text-gray-500 py-20">Aucun résultat trouvé pour « {q} ».</p>
      ) : (
        <div className="space-y-8">
          {/* Articles */}
          {results.articles?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><BookOpen size={18} className="text-joc-600" /> Articles ({results.articles.length})</h2>
              <div className="space-y-2">
                {results.articles.map((a) => (
                  <Link key={a.id} to={`/magazine/${a.slug}`} className="card p-4 flex gap-3 hover:border-joc-200">
                    {a.coverImage && <img src={a.coverImage} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />}
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{a.title}</h3>
                      {a.excerpt && <p className="text-sm text-gray-500 line-clamp-1">{a.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Podcasts */}
          {results.podcasts?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Headphones size={18} className="text-purple-600" /> Podcasts ({results.podcasts.length})</h2>
              <div className="space-y-2">
                {results.podcasts.map((p) => (
                  <Link key={p.id} to="/echo-audio" className="card p-4">
                    <h3 className="font-semibold text-gray-900">{p.title}</h3>
                    {p.description && <p className="text-sm text-gray-500 line-clamp-1">{p.description}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Videos */}
          {results.videos?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Video size={18} className="text-red-600" /> Vidéos ({results.videos.length})</h2>
              <div className="space-y-2">
                {results.videos.map((v) => (
                  <Link key={v.id} to="/videos" className="card p-4">
                    <h3 className="font-semibold text-gray-900">{v.title}</h3>
                    {v.description && <p className="text-sm text-gray-500 line-clamp-1">{v.description}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Events */}
          {results.events?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Calendar size={18} className="text-joc-600" /> Événements ({results.events.length})</h2>
              <div className="space-y-2">
                {results.events.map((e) => (
                  <Link key={e.id} to={`/evenements/${e.slug}`} className="card p-4">
                    <h3 className="font-semibold text-gray-900">{e.title}</h3>
                    <p className="text-sm text-gray-500">{new Date(e.eventDate).toLocaleDateString('fr-FR')}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Members */}
          {results.members?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><User size={18} className="text-joc-600" /> Personnes ({results.members.length})</h2>
              <div className="space-y-2">
                {results.members.map((m) => (
                  <div key={m.id} className="card p-4">
                    <h3 className="font-semibold text-gray-900">{m.name}</h3>
                    <p className="text-sm text-gray-500">{m.role}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Activities */}
          {results.activities?.length > 0 && (
            <section>
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Activity size={18} className="text-amber-600" /> Activités ({results.activities.length})</h2>
              <div className="space-y-2">
                {results.activities.map((a) => (
                  <Link key={a.id} to="/la-vie-dans-la-joc" className="card p-4">
                    <h3 className="font-semibold text-gray-900">{a.title}</h3>
                    {a.description && <p className="text-sm text-gray-500 line-clamp-1">{a.description}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
