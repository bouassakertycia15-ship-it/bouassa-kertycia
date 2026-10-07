import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import ArticleCard from '../components/ArticleCard.jsx'
import { ArrowRight, Calendar, Headphones, Video, Users, BookOpen, Heart, Quote, Bell, MessageSquare } from 'lucide-react'

export default function Home() {
  const [data, setData] = useState({
    featured: null,
    articles: [],
    events: [],
    podcasts: [],
    videos: [],
    testimonials: [],
    notifications: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/articles', { params: { featured: true, limit: 1 } }),
      api.get('/articles', { params: { limit: 6 } }),
      api.get('/events', { params: { status: 'UPCOMING' } }),
      api.get('/podcasts'),
      api.get('/videos'),
      api.get('/testimonials'),
      api.get('/notifications'),
    ]).then(([feat, arts, evts, pods, vids, temo, notifs]) => {
      setData({
        featured: feat.data.data[0] || arts.data.data[0] || null,
        articles: arts.data.data,
        events: evts.data.slice(0, 3),
        podcasts: pods.data.slice(0, 3),
        videos: vids.data.slice(0, 2),
        testimonials: temo.data.slice(0, 2),
        notifications: notifs.data.slice(0, 3),
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Chargement...</p>
      </div>
    )
  }

  const quickLinks = [
    { to: '/pourquoi-etre-jociste', label: 'Pourquoi être Jociste ?', icon: Users, color: 'bg-joc-50 text-joc-600' },
    { to: '/magazine/joseph-cardijn-methode-voir-juger-agir', label: 'Voir – Juger – Agir', icon: Heart, color: 'bg-amber-50 text-amber-600' },
    { to: '/forum', label: 'Forum', icon: MessageSquare, color: 'bg-teal-50 text-teal-600' },
    { to: '/echo-audio', label: 'Écho Audio', icon: Headphones, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      {/* Hero */}
      {data.featured && (
        <section className="relative bg-gradient-to-br from-joc-700 via-joc-600 to-joc-800 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${data.featured.coverImage || ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-20">
            <div className="max-w-2xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
                À la une
              </span>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
                {data.featured.title}
              </h1>
              {data.featured.excerpt && (
                <p className="text-lg text-white/90 mb-6 line-clamp-3">{data.featured.excerpt}</p>
              )}
              <Link
                to={`/magazine/${data.featured.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-joc-700 font-semibold hover:bg-joc-50 transition-colors"
              >
                Lire l'article <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Slogan banner */}
      <div className="bg-gray-900 text-white text-center py-4">
        <p className="text-sm md:text-base font-semibold">
          « Jeune chrétien, sois créatif ! » — <span className="text-joc-400">#soisjociste</span> <span className="text-amber-400">#soisresponsable</span> <span className="text-joc-400">#échojociste</span>
        </p>
      </div>

      {/* Quick access */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickLinks.map((ql) => {
            const Icon = ql.icon
            return (
              <Link
                key={ql.to}
                to={ql.to}
                className="card flex flex-col items-center justify-center p-5 text-center group hover:border-joc-200"
              >
                <div className={`w-12 h-12 rounded-xl ${ql.color} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} />
                </div>
                <span className="text-sm font-semibold text-gray-800">{ql.label}</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Notifications */}
      {data.notifications.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Bell size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                {data.notifications.map((n, i) => (
                  <Link key={i} to={n.link || '#'} className="block text-sm text-gray-700 hover:text-joc-600">
                    <strong>{n.title} :</strong> {n.message}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest articles */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Dernières publications</h2>
          <Link to="/magazine" className="text-sm font-medium text-joc-600 hover:text-joc-700 flex items-center gap-1">
            Tout voir <ArrowRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* Events */}
      {data.events.length > 0 && (
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Événements à venir</h2>
              <Link to="/evenements" className="text-sm font-medium text-joc-600 hover:text-joc-700 flex items-center gap-1">
                Tout voir <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {data.events.map((evt) => (
                <Link key={evt.id} to={`/evenements/${evt.slug}`} className="card flex gap-4 p-4">
                  <div className="w-16 h-16 rounded-lg bg-joc-50 flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-joc-600">{new Date(evt.eventDate).getDate()}</span>
                    <span className="text-xs text-joc-500">{new Date(evt.eventDate).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{evt.title}</h3>
                    {evt.location && <p className="text-sm text-gray-500 flex items-center gap-1"><Calendar size={12} /> {evt.location}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Podcasts & Videos */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Podcasts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2"><Headphones size={24} className="text-purple-600" /> Derniers podcasts</h2>
              <Link to="/echo-audio" className="text-sm font-medium text-joc-600 hover:text-joc-700 flex items-center gap-1">
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {data.podcasts.map((p) => (
                <Link key={p.id} to="/echo-audio" className="card flex gap-3 p-3 items-center">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                      <Headphones size={24} className="text-purple-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{p.title}</h3>
                    {p.speaker && <p className="text-sm text-gray-500">{p.speaker}</p>}
                    {p.duration && <p className="text-xs text-gray-400">{p.duration}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title flex items-center gap-2"><Video size={24} className="text-red-600" /> Dernières vidéos</h2>
              <Link to="/videos" className="text-sm font-medium text-joc-600 hover:text-joc-700 flex items-center gap-1">
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="space-y-3">
              {data.videos.map((v) => (
                <Link key={v.id} to="/videos" className="card flex gap-3 p-3 items-center">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt={v.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                      <Video size={24} className="text-red-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{v.title}</h3>
                    {v.speaker && <p className="text-sm text-gray-500">{v.speaker}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {data.testimonials.length > 0 && (
        <section className="bg-joc-50 border-y border-joc-100">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="section-title mb-6 flex items-center gap-2"><Quote size={24} className="text-joc-600" /> Témoignages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {data.testimonials.map((t) => (
                <div key={t.id} className="bg-white rounded-xl p-5 shadow-sm border border-joc-100">
                  <p className="text-gray-700 italic mb-3">« {t.content} »</p>
                  <p className="text-sm font-semibold text-joc-600">— {t.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="bg-gradient-to-r from-joc-600 to-joc-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Découvrez la JOC Congo-Brazzaville</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            La JOC est un espace où les jeunes apprennent à regarder leur réalité, à la comprendre à la lumière de l'Évangile et à agir concrètement.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/pourquoi-etre-jociste" className="px-6 py-3 rounded-lg bg-white text-joc-700 font-semibold hover:bg-joc-50">
              Pourquoi être Jociste ?
            </Link>
            <Link to="/famille-joc" className="px-6 py-3 rounded-lg bg-white/20 text-white font-semibold hover:bg-white/30">
              La famille JOC
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
