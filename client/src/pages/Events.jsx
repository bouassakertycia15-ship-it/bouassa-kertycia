import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import { Calendar, MapPin, Clock, User, Phone } from 'lucide-react'

export default function Events() {
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (filter) params.status = filter
    api.get('/events', { params }).then(r => {
      setEvents(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filter])

  const statusLabels = { UPCOMING: 'À venir', ONGOING: 'En cours', COMPLETED: 'Terminé' }
  const statusColors = { UPCOMING: 'bg-green-100 text-green-700', ONGOING: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-gray-100 text-gray-500' }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Événements</h1>
        <p className="text-gray-500">Conférences, camps, marches, rencontres, formations et retraites de la JOC.</p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {[{ k: '', l: 'Tous' }, { k: 'UPCOMING', l: 'À venir' }, { k: 'ONGOING', l: 'En cours' }, { k: 'COMPLETED', l: 'Terminés' }].map((s) => (
          <button
            key={s.k}
            onClick={() => setFilter(s.k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === s.k ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        </div>
      ) : events.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Aucun événement trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.map((evt) => (
            <Link key={evt.id} to={`/evenements/${evt.slug}`} className="card group block">
              {evt.poster && (
                <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                  <img src={evt.poster} alt={evt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[evt.status]}`}>
                    {statusLabels[evt.status]}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {new Date(evt.eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-joc-600 transition-colors">{evt.title}</h3>
                {evt.description && <p className="text-sm text-gray-600 line-clamp-2 mb-2">{evt.description}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                  {evt.location && <span className="flex items-center gap-1"><MapPin size={12} /> {evt.location}</span>}
                  {evt.eventTime && <span className="flex items-center gap-1"><Clock size={12} /> {evt.eventTime}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
