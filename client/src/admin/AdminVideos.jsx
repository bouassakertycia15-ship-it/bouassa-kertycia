import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

export default function AdminVideos() {
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', thumbnail: '', videoUrl: '', speaker: '', categoryId: '' })

  const load = () => {
    api.get('/videos').then(r => setVideos(r.data))
    api.get('/categories').then(r => setCategories(r.data))
  }
  useEffect(load, [])

  const save = async (e) => {
    e.preventDefault()
    if (editing) { await api.put(`/admin/videos/${editing.id}`, form) }
    else { await api.post('/admin/videos', form) }
    setShowForm(false); setEditing(null)
    setForm({ title: '', description: '', thumbnail: '', videoUrl: '', speaker: '', categoryId: '' })
    load()
  }

  const del = async (id) => { if (confirm('Supprimer ?')) { await api.delete(`/admin/videos/${id}`); load() } }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Vidéos</h2>
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', thumbnail: '', videoUrl: '', speaker: '', categoryId: '' }); setShowForm(true) }} className="btn-primary"><Plus size={16} /> Nouvelle vidéo</button>
      </div>
      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
          <div className="flex justify-between"><h3 className="font-bold">{editing ? 'Modifier' : 'Nouvelle vidéo'}</h3><button type="button" onClick={() => setShowForm(false)}><X size={20} /></button></div>
          <input type="text" placeholder="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
          <textarea placeholder="Description" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" />
          <input type="text" placeholder="URL miniature" value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
          <input type="text" placeholder="URL vidéo (YouTube ou hébergée)" value={form.videoUrl} onChange={e => setForm({ ...form, videoUrl: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Intervenant" value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="">Catégorie</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">{editing ? 'Mettre à jour' : 'Publier'}</button>
        </form>
      )}
      <div className="space-y-2">
        {videos.map(v => (
          <div key={v.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
            {v.thumbnail && <img src={v.thumbnail} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900 line-clamp-1">{v.title}</h3><p className="text-xs text-gray-400">{v.speaker}</p></div>
            <button onClick={() => { setEditing(v); setForm({ title: v.title, description: v.description || '', thumbnail: v.thumbnail || '', videoUrl: v.videoUrl, speaker: v.speaker || '', categoryId: v.categoryId || '' }); setShowForm(true) }} className="p-2 rounded-lg hover:bg-gray-100"><Pencil size={16} className="text-gray-500" /></button>
            <button onClick={() => del(v.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
