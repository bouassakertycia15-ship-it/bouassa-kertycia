import { useState, useEffect } from 'react'
import { Trash2, Shield, UserCog } from 'lucide-react'
import api from '../api/client.js'

const roles = [
  { value: 'SUPER_ADMIN', label: 'Super Administrateur' },
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'EDITOR', label: 'Responsable éditorial' },
  { value: 'WRITER', label: 'Rédacteur' },
  { value: 'AUDIO_MANAGER', label: 'Responsable audio' },
  { value: 'VIDEO_MANAGER', label: 'Responsable vidéo' },
  { value: 'MODERATOR', label: 'Modérateur' },
  { value: 'EVENT_MANAGER', label: 'Responsable événements' },
  { value: 'COMM_MANAGER', label: 'Responsable communication' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'READER', label: 'Lecteur' },
]

const statusLabels = { ACTIVE: 'Actif', SUSPENDED: 'Suspendu', BLOCKED: 'Bloqué' }
const statusColors = { ACTIVE: 'bg-green-100 text-green-700', SUSPENDED: 'bg-amber-100 text-amber-700', BLOCKED: 'bg-red-100 text-red-700' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).catch(() => {})
  }, [])

  const updateUser = async (id, field, value) => {
    try {
      await api.put(`/admin/users/${id}`, { [field]: value })
      setUsers(users.map(u => u.id === id ? { ...u, [field]: value } : u))
    } catch (err) { console.error(err) }
  }

  const deleteUser = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return
    await api.delete(`/admin/users/${id}`)
    setUsers(users.filter(u => u.id !== id))
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <UserCog className="text-gray-500" /> Gestion des utilisateurs
      </h2>
      <p className="text-sm text-gray-500 mb-6">Gérez les comptes, rôles et permissions</p>

      {/* Roles legend */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1"><Shield size={14} /> Rôles & permissions</h3>
        <div className="flex flex-wrap gap-2">
          {roles.map(r => (
            <span key={r.value} className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600">{r.label}</span>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-joc-100 text-joc-600 flex items-center justify-center font-bold">
                  {u.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email} · Inscrit le {new Date(u.createdAt).toLocaleDateString('fr-FR')}</p>
                  {u.lastActivity && <p className="text-xs text-gray-400">Dernière activité: {new Date(u.lastActivity).toLocaleDateString('fr-FR')}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[u.status]}`}>{statusLabels[u.status]}</span>
                <select value={u.role} onChange={(e) => updateUser(u.id, 'role', e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs">
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <select value={u.status} onChange={(e) => updateUser(u.id, 'status', e.target.value)} className="px-2 py-1 rounded-lg border border-gray-200 text-xs">
                  <option value="ACTIVE">Actif</option><option value="SUSPENDED">Suspendu</option><option value="BLOCKED">Bloqué</option>
                </select>
                <button onClick={() => deleteUser(u.id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && <p className="text-center text-gray-400 py-8">Aucun utilisateur</p>}
      </div>
    </div>
  )
}
