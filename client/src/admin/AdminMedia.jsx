import { useState, useEffect } from 'react'
import { Trash2, Image, Headphones, Video, FileText, AlertTriangle } from 'lucide-react'
import api from '../api/client.js'

const typeIcons = { IMAGE: Image, AUDIO: Headphones, VIDEO: Video, DOCUMENT: FileText, OTHER: FileText }
const typeColors = { IMAGE: 'bg-blue-50 text-blue-600', AUDIO: 'bg-purple-50 text-purple-600', VIDEO: 'bg-red-50 text-red-600', DOCUMENT: 'bg-amber-50 text-amber-600', OTHER: 'bg-gray-50 text-gray-600' }

export default function AdminMedia() {
  const [media, setMedia] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'IMAGE', url: '' })

  useEffect(() => { loadMedia() }, [])

  const loadMedia = async () => {
    const r = await api.get('/admin/media')
    setMedia(r.data)
  }

  const createMedia = async (e) => {
    e.preventDefault()
    await api.post('/admin/media', form)
    setForm({ name: '', type: 'IMAGE', url: '' })
    setShowForm(false)
    loadMedia()
  }

  const deleteMedia = async (id, name) => {
    if (!confirm(`Supprimer « ${name} » ? Vérifiez qu'il n'est plus utilisé.`)) return
    await api.delete(`/admin/media/${id}`)
    loadMedia()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Médiathèque</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Ajouter un média</button>
      </div>

      {showForm && (
        <form onSubmit={createMedia} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
          <input type="text" placeholder="Nom du média" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300">
            <option value="IMAGE">Image</option><option value="AUDIO">Audio</option><option value="VIDEO">Vidéo</option><option value="DOCUMENT">Document</option><option value="OTHER">Autre</option>
          </select>
          <input type="url" placeholder="URL du média" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" />
          <button type="submit" className="btn-primary">Enregistrer</button>
        </form>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {media.map((m) => {
          const Icon = typeIcons[m.type] || FileText
          return (
            <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-3">
              <div className={`w-full aspect-video rounded-lg ${typeColors[m.type]} flex items-center justify-center mb-2`}>
                {m.type === 'IMAGE' ? <img src={m.url} alt={m.name} className="w-full h-full object-cover rounded-lg" /> : <Icon size={32} />}
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-gray-400">{m.type} · {new Date(m.createdAt).toLocaleDateString('fr-FR')}</span>
                <button onClick={() => deleteMedia(m.id, m.name)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
        {media.length === 0 && <p className="col-span-full text-center text-gray-400 py-8">Aucun média</p>}
      </div>
    </div>
  )
}
