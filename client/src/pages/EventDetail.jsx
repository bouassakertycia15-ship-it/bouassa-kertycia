import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client.js'
import ShareButtons from '../components/ShareButtons.jsx'
import { Calendar, MapPin, Clock, User, Phone, ArrowLeft, Image as ImageIcon } from 'lucide-react'

export default function EventDetail() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/events/${slug}`).then(r => {
      setEvent(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center">
    <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
  </div>

  if (!event) return <div className="max-w-3xl mx-auto px-4 py-20 text-center">
    <p className="text-gray-500">Événement non trouvé.</p>
    <Link to="/evenements" className="btn-primary mt-4">Retour aux événements</Link>
  </div>

  const statusLabels = { UPCOMING: 'À venir', ONGOING: 'En cours', COMPLETED: 'Terminé' }
  const statusColors = { UPCOMING: 'bg-green-100 text-green-700', ONGOING: 'bg-blue-100 text-blue-700', COMPLETED: 'bg-gray-100 text-gray-500' }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/evenements" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-joc-600 mb-4">
        <ArrowLeft size={16} /> Retour aux événements
      </Link>

      {event.poster && <img src={event.poster} alt={event.title} className="w-full rounded-xl mb-6 max-h-80 object-cover" />}

      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-3 ${statusColors[event.status]}`}>
        {statusLabels[event.status]}
      </span>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
        <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(event.eventDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        {event.eventTime && <span className="flex items-center gap-1"><Clock size={16} /> {event.eventTime}</span>}
        {event.location && <span className="flex items-center gap-1"><MapPin size={16} /> {event.location}</span>}
        {event.organizer && <span className="flex items-center gap-1"><User size={16} /> {event.organizer}</span>}
        {event.contact && <span className="flex items-center gap-1"><Phone size={16} /> {event.contact}</span>}
      </div>

      {event.description && (
        <div className="prose-content text-gray-800 mb-6">
          <p>{event.description}</p>
        </div>
      )}

      {event.report && (
        <div className="bg-gray-50 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-gray-900 mb-2">Compte rendu</h2>
          <p className="text-gray-700">{event.report}</p>
        </div>
      )}

      {event.gallery?.length > 0 && (
        <div className="mb-6">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><ImageIcon size={18} /> Galerie</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {event.gallery.map((img, i) => (
              <img key={i} src={img} alt="" className="rounded-lg w-full h-32 object-cover" />
            ))}
          </div>
        </div>
      )}

      <ShareButtons title={event.title} path={`/evenements/${event.slug}`} />
    </div>
  )
}
