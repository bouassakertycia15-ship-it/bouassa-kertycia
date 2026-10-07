import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'

export default function AdminArticles() {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [authors, setAuthors] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ title: '', excerpt: '', content: '', coverImage: '', categoryId: '', tags: '', status: 'DRAFT', featured: false })

  const load = () => {
    api.get('/articles', { params: { limit: 100 } }).then(r => setArticles(r.data.data))
    api.get('/categories').then(r => setCategories(r.data))
    api.get('/authors').catch(() => {}) // may not exist yet
  }
  useEffect(load, [])

  const save = async (e) => {
    e.preventDefault()
    const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    const data = { ...form, tags, featured: form.featured }
    if (editing) {
      await api.put(`/admin/articles/${editing.id}`, data)
    } else {
      await api.post('/admin/articles', data)
    }
    setShowForm(false)
    setEditing(null)
    setForm({ title: '', excerpt: '', content: '', coverImage: '', categoryId: '', tags: '', status: 'DRAFT', featured: false })
    load()
  }

  const edit = (a) => {
    setEditing(a)
    setForm({ title: a.title, excerpt: a.excerpt || '', content: a.content, coverImage: a.coverImage || '', categoryId: a.categoryId || '', tags: a.tags?.map(t => t.name).join(', ') || '', status: a.status, featured: a.featured })
    setShowForm(true)
  }

  const del = async (id) => {
    if (!confirm('Supprimer cet article ?')) return
    await api.delete(`/admin/articles/${id}`)
    load()
  }

  const toggleFeatured = async (a) => {
    await api.put(`/admin/articles/${a.id}`, { ...a, featured: !a.featured })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Articles</h2>
        <button onClick={() => { setEditing(null); setForm({ title: '', excerpt: '', content: '', coverImage: '', categoryId: '', tags: '', status: 'DRAFT', featured: false }); setShowForm(true) }} className="btn-primary">
          <Plus size={16} /> Nouvel article
        </button>
      </div>

      {showForm && (
        <form onSubmit={save} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-900">{editing ? 'Modifier' : 'Nouvel article'}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={20} /></button>
          </div>
          <input type="text" placeholder="Titre" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" required />
          <input type="text" placeholder="Résumé" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" />
          <input type="text" placeholder="URL image de couverture" value={form.coverImage} onChange={e => setForm({ ...form, coverImage: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" />
          <textarea placeholder="Contenu (HTML accepté)" rows="8" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-y font-mono text-sm" required />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="">Catégorie</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input type="text" placeholder="Tags (séparés par virgules)" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none" />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="px-4 py-2.5 rounded-lg border border-gray-300 outline-none">
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
              <option value="ARCHIVED">Archivé</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="accent-joc-600" />
            Article à la une
          </label>
          <button type="submit" className="btn-primary">{editing ? 'Mettre à jour' : 'Publier'}</button>
        </form>
      )}

      <div className="space-y-2">
        {articles.map(a => (
          <div key={a.id} className="bg-white rounded-lg border border-gray-100 p-4 flex items-center gap-3">
            {a.coverImage && <img src={a.coverImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{a.title}</h3>
                {a.featured && <Star size={14} className="text-amber-500 fill-amber-500" />}
                {a.source === 'BLOG' && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Blog</span>}
              </div>
              <p className="text-xs text-gray-400">{a.category?.name} • {new Date(a.publishedAt).toLocaleDateString('fr-FR')} • {a.status}</p>
            </div>
            <button onClick={() => toggleFeatured(a)} className="p-2 rounded-lg hover:bg-gray-100" title="À la une">
              <Star size={16} className={a.featured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
            </button>
            <button onClick={() => edit(a)} className="p-2 rounded-lg hover:bg-gray-100"><Pencil size={16} className="text-gray-500" /></button>
            <button onClick={() => del(a.id)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 size={16} className="text-red-500" /></button>
          </div>
        ))}
      </div>
    </div>
  )
}
