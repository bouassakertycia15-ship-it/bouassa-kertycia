import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

const types = ['Rencontres', 'Réunions', 'Camps', 'Marches', 'Conférences', 'Formations', 'Activités sociales', 'Actions communautaires', 'Vie des équipes', 'Témoignages', 'Moments de fraternité', 'Initiatives des jeunes']

export default function AdminActivities() {
  const [activities, setActivities] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', activityDate: '', location: '', responsible: '', type: '', participants: '', report: '' })

  const load = () => api.get('/activities').then(r => setActivities(r.data))
  useEffect(load, [])

  const save = async (e) => {
    e.preventDefault()
    if (editing) { await api.put(`/admin/activities/${editing.id}`, form) }
    else { await api.post('/admin/activities', form) }
    setShowForm(false); setEditing(null)
    setForm({ title: '', description: '', activityDate: '', location: '', responsible: '', type: '', participants: '', report: '' })
    load()
  }

  const del = async (id) => { if (confirm('Supprimer ?')) { await api.delete(`/admin/activities/${id}`); load() } }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Activités</h2>
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', activityDate: '', location: '', responsible: '', type: '', participants: '', report: '' }); setShowForm(true) }} className="btn-primary"><Plus size={16} /> Nouvelle activité</button>
      </div>
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-bold">{editing ? 'Modifier' : 'Nouvelle activité'}</h3><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div>
          <input type="text" placeholder="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
          <textarea placeholder="Description" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" />
          <div className="grid grid-cols-2 gap-4">
            <input type="date" value={form.activityDate} onChange={e => setForm({ ...form, activityDate: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" required />
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="">Type</option>
              {types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="text" placeholder="Lieu" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Responsable" value={form.responsible} onChange={e => setForm({ ...form, responsible: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Participants" value={form.participants} onChange={e => setForm({ ...form, participants: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
          </div>
          <textarea placeholder="Compte rendu" rows="3" value={form.report} onChange={e => setForm({ ...form, report: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" />
          <button type="submit" className="btn-primary">{editing ? 'Mettre à jour' : 'Créer'}</button>
        </form>
      )}
      <div className="space-y-2">
        {activities.map(a => (
          <div key={a.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{a.title}</h3>
              <p className="text-xs text-gray-400">{a.type} • {new Date(a.activityDate).toLocaleDateString('fr-FR')} • {a.location}</p>
            </div>
            <button onClick={() => { setEditing(a); setForm({ title: a.title, description: a.description || '', activityDate: a.activityDate.slice(0, 10), location: a.location || '', responsible: a.responsible || '', type: a.type || '', participants: a.participants || '', report: a.report || '' }); setShowForm(true) }} className="p-2 rounded-lg hover:bg-gray-100"><Pencil size={16} className="text-gray-500" /></button>
            <button onClick={() => del(a.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
