import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client.js'
import { Calendar, MapPin, User, ArrowRight } from 'lucide-react'

const activityTypes = ['Rencontres', 'Réunions', 'Camps', 'Marches', 'Conférences', 'Formations', 'Activités sociales', 'Actions communautaires', 'Vie des équipes', 'Témoignages', 'Moments de fraternité', 'Initiatives des jeunes']

export default function VieDansLaJOC() {
  const [activities, setActivities] = useState([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = {}
    if (filter) params.type = filter
    api.get('/activities', { params }).then(r => {
      setActivities(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filter])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">La vie dans la JOC</h1>
        <p className="text-lg text-gray-500">Ce que vivent concrètement les jeunes Jocistes au quotidien.</p>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setFilter('')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!filter ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Toutes
        </button>
        {activityTypes.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${filter === t ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        </div>
      ) : activities.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Aucune activité pour le moment.</p>
      ) : (
        <div className="space-y-4">
          {activities.map((a) => (
            <div key={a.id} className="card p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:w-32 shrink-0">
                  <div className="bg-joc-50 rounded-lg p-3 text-center">
                    <span className="block text-2xl font-bold text-joc-600">{new Date(a.activityDate).getDate()}</span>
                    <span className="text-sm text-joc-500">{new Date(a.activityDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex-1">
                  {a.type && <span className="inline-block text-xs font-semibold uppercase text-joc-600 mb-1">{a.type}</span>}
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{a.title}</h3>
                  {a.description && <p className="text-sm text-gray-600 mb-2 line-clamp-3">{a.description}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {a.location && <span className="flex items-center gap-1"><MapPin size={12} /> {a.location}</span>}
                    {a.responsible && <span className="flex items-center gap-1"><User size={12} /> {a.responsible}</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link to="/evenements" className="btn-outline">
          Voir les événements <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
