import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Plus, Trash2, Bell, Send } from 'lucide-react'

export default function AdminSettings() {
  const [tab, setTab] = useState('categories')
  const [categories, setCategories] = useState([])
  const [socials, setSocials] = useState([])
  const [newCat, setNewCat] = useState({ name: '', color: '#dc2626' })
  const [newSocial, setNewSocial] = useState({ platform: '', url: '', icon: '' })
  const [notif, setNotif] = useState({ title: '', message: '', type: 'article', link: '' })

  const load = () => {
    api.get('/categories').then(r => setCategories(r.data))
    api.get('/social-links').then(r => setSocials(r.data))
  }
  useEffect(load, [])

  const addCategory = async (e) => {
    e.preventDefault()
    await api.post('/admin/categories', newCat)
    setNewCat({ name: '', color: '#dc2626' })
    load()
  }

  const delCategory = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    await api.delete(`/admin/categories/${id}`); load()
  }

  const addSocial = async (e) => {
    e.preventDefault()
    await api.post('/admin/social-links', newSocial)
    setNewSocial({ platform: '', url: '', icon: '' })
    load()
  }

  const delSocial = async (id) => {
    await api.delete(`/admin/social-links/${id}`); load()
  }

  const sendNotif = async (e) => {
    e.preventDefault()
    await api.post('/admin/notifications', notif)
    setNotif({ title: '', message: '', type: 'article', link: '' })
    alert('Notification envoyée !')
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Paramètres</h2>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('categories')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'categories' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Catégories</button>
        <button onClick={() => setTab('socials')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'socials' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Réseaux sociaux</button>
        <button onClick={() => setTab('notifications')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tab === 'notifications' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Notifications</button>
      </div>

      {tab === 'categories' && (
        <div>
          <form onSubmit={addCategory} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex gap-2 items-end">
            <div className="flex-1"><input type="text" placeholder="Nom de la catégorie" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none" required /></div>
            <input type="color" value={newCat.color} onChange={e => setNewCat({ ...newCat, color: e.target.value })} className="w-12 h-10 rounded-lg border border-gray-300" />
            <button type="submit" className="btn-primary"><Plus size={16} /> Ajouter</button>
          </form>
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center gap-3">
                <div className="w-6 h-6 rounded-full" style={{ background: c.color || '#ccc' }}></div>
                <span className="flex-1 font-medium text-gray-900">{c.name}</span>
                <button onClick={() => delCategory(c.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'socials' && (
        <div>
          <form onSubmit={addSocial} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 flex gap-2">
            <input type="text" placeholder="Plateforme (ex: WhatsApp)" value={newSocial.platform} onChange={e => setNewSocial({ ...newSocial, platform: e.target.value })} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 outline-none" required />
            <input type="text" placeholder="URL" value={newSocial.url} onChange={e => setNewSocial({ ...newSocial, url: e.target.value })} className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 outline-none" required />
            <button type="submit" className="btn-primary"><Plus size={16} /> Ajouter</button>
          </form>
          <div className="space-y-2">
            {socials.map(s => (
              <div key={s.id} className="bg-white rounded-lg border border-gray-100 p-3 flex items-center gap-3">
                <span className="flex-1 font-medium text-gray-900 capitalize">{s.platform}</span>
                <a href={s.url} target="_blank" rel="noopener" className="text-sm text-joc-600 hover:underline line-clamp-1 max-w-xs">{s.url}</a>
                <button onClick={() => delSocial(s.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <form onSubmit={sendNotif} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4 max-w-lg">
          <h3 className="font-bold text-gray-900 flex items-center gap-2"><Bell size={18} /> Envoyer une notification</h3>
          <input type="text" placeholder="Titre" value={notif.title} onChange={e => setNotif({ ...notif, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
          <textarea placeholder="Message" rows="3" value={notif.message} onChange={e => setNotif({ ...notif, message: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" required />
          <div className="grid grid-cols-2 gap-4">
            <select value={notif.type} onChange={e => setNotif({ ...notif, type: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="article">Article</option>
              <option value="podcast">Podcast</option>
              <option value="video">Vidéo</option>
              <option value="event">Événement</option>
              <option value="activity">Activité</option>
              <option value="announcement">Annonce</option>
            </select>
            <input type="text" placeholder="Lien (optionnel)" value={notif.link} onChange={e => setNotif({ ...notif, link: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
          </div>
          <button type="submit" className="btn-primary"><Send size={16} /> Envoyer</button>
        </form>
      )}
    </div>
  )
}
