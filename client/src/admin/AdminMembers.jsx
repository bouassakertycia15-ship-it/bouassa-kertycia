import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [jocFamily, setJocFamily] = useState([])
  const [tab, setTab] = useState('members')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', role: '', bio: '', photo: '', domain: '', socialLink: '', contact: '', team: '', parcours: '' })

  const load = () => {
    api.get('/members').then(r => setMembers(r.data))
    api.get('/joc-family').then(r => setJocFamily(r.data))
  }
  useEffect(load, [])

  const save = async (e) => {
    e.preventDefault()
    const endpoint = tab === 'members' ? 'members' : 'joc-family'
    if (editing) { await api.put(`/admin/${endpoint}/${editing.id}`, form) }
    else { await api.post(`/admin/${endpoint}`, form) }
    setShowForm(false); setEditing(null)
    setForm({ name: '', role: '', bio: '', photo: '', domain: '', socialLink: '', contact: '', team: '', parcours: '' })
    load()
  }

  const del = async (id) => {
    if (!confirm('Supprimer ?')) return
    const endpoint = tab === 'members' ? 'members' : 'joc-family'
    await api.delete(`/admin/${endpoint}/${id}`); load()
  }

  const list = tab === 'members' ? members : jocFamily

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Membres</h2>
        <button onClick={() => { setEditing(null); setForm({ name: '', role: '', bio: '', photo: '', domain: '', socialLink: '', contact: '', team: '', parcours: '' }); setShowForm(true) }} className="btn-primary"><Plus size={16} /> Ajouter</button>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('members')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'members' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Équipe Écho Jociste</button>
        <button onClick={() => setTab('family')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'family' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Famille JOC</button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-bold">{editing ? 'Modifier' : 'Ajouter'}</h3><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
            <input type="text" placeholder="Fonction / Rôle" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
            <input type="text" placeholder="URL photo" value={form.photo} onChange={e => setForm({ ...form, photo: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Domaine" value={form.domain} onChange={e => setForm({ ...form, domain: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Équipe" value={form.team} onChange={e => setForm({ ...form, team: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Lien réseau social" value={form.socialLink} onChange={e => setForm({ ...form, socialLink: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <input type="text" placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
          </div>
          <textarea placeholder="Mini-biographie" rows="3" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" />
          {tab === 'family' && <textarea placeholder="Parcours" rows="2" value={form.parcours} onChange={e => setForm({ ...form, parcours: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" />}
          <button type="submit" className="btn-primary">{editing ? 'Mettre à jour' : 'Ajouter'}</button>
        </form>
      )}

      <div className="space-y-2">
        {list.map(m => (
          <div key={m.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
            {m.photo && <img src={m.photo} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 line-clamp-1">{m.name}</h3>
              <p className="text-xs text-gray-400">{m.role} • {m.team}</p>
            </div>
            <button onClick={() => { setEditing(m); setForm({ name: m.name, role: m.role, bio: m.bio || '', photo: m.photo || '', domain: m.domain || '', socialLink: m.socialLink || '', contact: m.contact || '', team: m.team || '', parcours: m.parcours || '' }); setShowForm(true) }} className="p-2 rounded-lg hover:bg-gray-100"><Pencil size={16} className="text-gray-500" /></button>
            <button onClick={() => del(m.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
