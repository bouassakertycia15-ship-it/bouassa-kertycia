import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', poster: '', eventDate: '', eventTime: '', location: '', organizer: '', contact: '', status: 'UPCOMING' })

  const load = () => api.get('/events').then(r => setEvents(r.data))
  useEffect(load, [])

  const save = async (e) => {
    e.preventDefault()
    if (editing) { await api.put(`/admin/events/${editing.id}`, form) }
    else { await api.post('/admin/events', form) }
    setShowForm(false); setEditing(null)
    setForm({ title: '', description: '', poster: '', eventDate: '', eventTime: '', location: '', organizer: '', contact: '', status: 'UPCOMING' })
    load()
  }

  const del = async (id) => { if (confirm('Supprimer ?')) { await api.delete(`/admin/events/${id}`); load() } }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Événements</h2>
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', poster: '', eventDate: '', eventTime: '', location: '', organizer: '', contact: '', status: 'UPCOMING' }); setShowForm(true) }} className="btn-primary"><Plus size={16} /> Nouvel événement</button>
      </div>
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-bold">{editing ? 'Modifier' : 'Nouvel événement'}</h3><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div>
          <input type="text" placeholder="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
          <textarea placeholder="Description" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" />
          <input type="text" placeholder="URL affiche" value={form.poster} onChange={e => setForm({ ...form, poster: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" required />
            <input type="time" value={form.eventTime} onChange={e => setForm({ ...form, eventTime: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Lieu" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Organisateur" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="UPCOMING">À venir</option>
              <option value="ONGOING">En cours</option>
              <option value="COMPLETED">Terminé</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">{editing ? 'Mettre à jour' : 'Créer'}</button>
        </form>
      )}
      <div className="space-y-2">
        {events.map(e => (
          <div key={e.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{e.title}</h3>
              <p className="text-xs text-gray-400">{new Date(e.eventDate).toLocaleDateString('fr-FR')} • {e.location} • {e.status}</p>
            </div>
            <button onClick={() => { setEditing(e); setForm({ title: e.title, description: e.description || '', poster: e.poster || '', eventDate: e.eventDate.slice(0, 10), eventTime: e.eventTime || '', location: e.location || '', organizer: e.organizer || '', contact: e.contact || '', status: e.status }); setShowForm(true) }} className="p-2 rounded-lg hover:bg-gray-100"><Pencil size={16} className="text-gray-500" /></button>
            <button onClick={() => del(e.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
