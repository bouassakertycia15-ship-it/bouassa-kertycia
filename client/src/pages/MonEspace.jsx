import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, MessageSquare, FileText, Heart, Bell, Settings, LogOut, Mail, Edit3 } from 'lucide-react'
import api, { setAuthToken } from '../api/client.js'

export default function MonEspace() {
  const [user, setUser] = useState(null)
  const [space, setSpace] = useState(null)
  const [tab, setTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/auth/me').then(r => {
      setUser(r.data)
      setEditName(r.data.name)
      setEditBio(r.data.bio || '')
    }).catch(() => navigate('/connexion'))
    api.get('/auth/my-space').then(r => setSpace(r.data)).catch(() => {})
  }, [navigate])

  const logout = () => {
    setAuthToken(null)
    navigate('/')
  }

  const saveProfile = async () => {
    try {
      await api.put('/auth/me', { name: editName, bio: editBio })
      setUser({ ...user, name: editName, bio: editBio })
      setEditing(false)
    } catch (err) { console.error(err) }
  }

  if (!user) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div></div>

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'discussions', label: 'Discussions', icon: MessageSquare },
    { id: 'comments', label: 'Commentaires', icon: FileText },
    { id: 'testimonials', label: 'Témoignages', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-joc-600 to-joc-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{user.name}</h1>
            <p className="text-white/70 text-sm">{user.email}</p>
          </div>
          <button onClick={logout} className="p-2 rounded-lg bg-white/10 hover:bg-white/20" title="Déconnexion">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {tabs.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                tab === t.id ? 'bg-joc-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} /> {t.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {tab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500 resize-none" placeholder="Parlez de vous..." />
              </div>
              <div className="flex gap-2">
                <button onClick={saveProfile} className="btn-primary">Enregistrer</button>
                <button onClick={() => setEditing(false)} className="btn-outline">Annuler</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">Informations personnelles</h2>
                <button onClick={() => setEditing(true)} className="text-sm text-joc-600 flex items-center gap-1"><Edit3 size={14} /> Modifier</button>
              </div>
              <dl className="space-y-3">
                <div className="flex justify-between"><dt className="text-gray-500">Nom</dt><dd className="font-medium">{user.name}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium">{user.email}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Rôle</dt><dd className="font-medium">{user.role}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Membre depuis</dt><dd className="font-medium">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</dd></div>
                {user.bio && <div><dt className="text-gray-500 mb-1">Bio</dt><dd className="text-gray-700">{user.bio}</dd></div>}
              </dl>
            </div>
          )}
        </div>
      )}

      {tab === 'discussions' && (
        <div className="space-y-2">
          {space?.discussions?.length ? space.discussions.map((d) => (
            <Link key={d.id} to={`/forum/${d.slug}`} className="card p-4 block">
              <h3 className="font-semibold text-gray-900">{d.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{d.forumCategory?.name} · {new Date(d.createdAt).toLocaleDateString('fr-FR')}</p>
            </Link>
          )) : <p className="text-center text-gray-400 py-8">Aucune discussion pour le moment</p>}
        </div>
      )}

      {tab === 'comments' && (
        <div className="space-y-2">
          {space?.comments?.length ? space.comments.map((c) => (
            <div key={c.id} className="card p-4">
              <p className="text-sm text-gray-700">{c.content}</p>
              <p className="text-xs text-gray-400 mt-1">Sur « {c.article?.title} » · {new Date(c.createdAt).toLocaleDateString('fr-FR')} · <span className={c.status === 'PENDING' ? 'text-amber-500' : 'text-green-500'}>{c.status === 'PENDING' ? 'En attente' : 'Approuvé'}</span></p>
            </div>
          )) : <p className="text-center text-gray-400 py-8">Aucun commentaire pour le moment</p>}
        </div>
      )}

      {tab === 'testimonials' && (
        <div className="space-y-2">
          {space?.testimonials?.length ? space.testimonials.map((t) => (
            <div key={t.id} className="card p-4">
              <h3 className="font-semibold text-gray-900 text-sm">{t.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{t.content}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleDateString('fr-FR')} · <span className={t.status === 'PENDING' ? 'text-amber-500' : 'text-green-500'}>{t.status === 'PENDING' ? 'En attente' : 'Publié'}</span></p>
            </div>
          )) : <p className="text-center text-gray-400 py-8">Aucun témoignage pour le moment</p>}
        </div>
      )}

      {tab === 'notifications' && (
        <div className="space-y-2">
          {space?.notifications?.length ? space.notifications.map((n) => (
            <div key={n.id} className="card p-4 flex items-start gap-3">
              <Bell size={16} className="text-joc-600 mt-1" />
              <div>
                <p className="font-medium text-sm text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          )) : <p className="text-center text-gray-400 py-8">Aucune notification</p>}
        </div>
      )}
    </div>
  )
}
