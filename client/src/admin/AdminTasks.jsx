import { useState, useEffect } from 'react'
import { Plus, Trash2, Flag, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import api from '../api/client.js'

const statusLabels = { TODO: 'À faire', IN_PROGRESS: 'En cours', IN_REVIEW: 'En révision', DONE: 'Terminé' }
const priorityLabels = { LOW: 'Basse', MEDIUM: 'Moyenne', HIGH: 'Haute', URGENT: 'Urgente' }
const priorityColors = { LOW: 'bg-gray-100 text-gray-600', MEDIUM: 'bg-blue-100 text-blue-600', HIGH: 'bg-orange-100 text-orange-600', URGENT: 'bg-red-100 text-red-600' }

export default function AdminTasks() {
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', type: 'Article', priority: 'MEDIUM', dueDate: '', internalComment: '' })

  useEffect(() => { loadTasks() }, [])

  const loadTasks = async () => {
    const r = await api.get('/admin/tasks')
    setTasks(r.data)
  }

  const createTask = async (e) => {
    e.preventDefault()
    await api.post('/admin/tasks', form)
    setForm({ title: '', description: '', type: 'Article', priority: 'MEDIUM', dueDate: '', internalComment: '' })
    setShowForm(false)
    loadTasks()
  }

  const updateStatus = async (id, status) => {
    await api.put(`/admin/tasks/${id}`, { status })
    loadTasks()
  }

  const deleteTask = async (id) => {
    await api.delete(`/admin/tasks/${id}`)
    loadTasks()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Centre de tâches</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary"><Plus size={18} /> Nouvelle tâche</button>
      </div>

      {showForm && (
        <form onSubmit={createTask} className="bg-white rounded-xl border border-gray-100 p-4 mb-4 space-y-3">
          <input type="text" placeholder="Titre de la tâche" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
              <option>Article</option><option>Podcast</option><option>Vidéo</option><option>Événement</option><option>Témoignage</option><option>Modération</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 text-sm">
              <option value="LOW">Basse</option><option value="MEDIUM">Moyenne</option><option value="HIGH">Haute</option><option value="URGENT">Urgente</option>
            </select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-300 text-sm" />
            <button type="submit" className="btn-primary text-sm">Créer</button>
          </div>
          <input type="text" placeholder="Commentaire interne (privé)" value={form.internalComment} onChange={(e) => setForm({ ...form, internalComment: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        </form>
      )}

      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{t.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[t.priority]}`}>{priorityLabels[t.priority]}</span>
                  {t.article && <span className="text-xs text-gray-400">· {t.article.title}</span>}
                </div>
                {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
                {t.internalComment && <p className="text-xs text-gray-400 mt-1 bg-gray-50 rounded p-2">💬 {t.internalComment}</p>}
                <div className="flex items-center gap-2 mt-2">
                  {t.dueDate && <span className="text-xs text-gray-400">📅 {new Date(t.dueDate).toLocaleDateString('fr-FR')}</span>}
                  {t.assignee && <span className="text-xs text-gray-400">👤 {t.assignee.name}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <select value={t.status} onChange={(e) => updateStatus(t.id, e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs">
                  <option value="TODO">À faire</option><option value="IN_PROGRESS">En cours</option><option value="IN_REVIEW">En révision</option><option value="DONE">Terminé</option>
                </select>
                <button onClick={() => deleteTask(t.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-center text-gray-400 py-8">Aucune tâche</p>}
      </div>
    </div>
  )
}
