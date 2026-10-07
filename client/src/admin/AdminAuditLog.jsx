import { useState, useEffect } from 'react'
import { ScrollText, Filter } from 'lucide-react'
import api from '../api/client.js'

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    api.get('/admin/audit-logs', { params: { limit: 100, entity: filter || undefined } }).then(r => {
      setLogs(r.data.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [filter])

  const actionLabels = {
    CREATE_ARTICLE: 'Création d\'article',
    UPDATE_ARTICLE: 'Modification d\'article',
    DELETE_ARTICLE: 'Suppression d\'article',
    PUBLISH_ARTICLE: 'Publication',
    RESTORE_VERSION: 'Restauration de version',
    CREATE_PODCAST: 'Création de podcast',
    CREATE_VIDEO: 'Création de vidéo',
    CREATE_EVENT: 'Création d\'événement',
    BLOG_SYNC: 'Synchronisation du blog',
    IMPORT_BLOG_ARTICLE: 'Import d\'article',
    MODERATE_TESTIMONIAL: 'Modération témoignage',
    MODERATE_COMMENT: 'Modération commentaire',
    MODERATE_DISCUSSION: 'Modération discussion',
    UPDATE_USER: 'Modification utilisateur',
    DELETE_USER: 'Suppression utilisateur',
    CREATE_TASK: 'Création de tâche',
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <ScrollText className="text-gray-500" /> Journal d'activité
      </h2>
      <p className="text-sm text-gray-500 mb-4">Traçabilité de toutes les actions importantes</p>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button onClick={() => setFilter('')} className={`px-3 py-1 rounded-full text-xs ${!filter ? 'bg-joc-600 text-white' : 'bg-gray-100'}`}>Tout</button>
        <button onClick={() => setFilter('Article')} className={`px-3 py-1 rounded-full text-xs ${filter === 'Article' ? 'bg-joc-600 text-white' : 'bg-gray-100'}`}>Articles</button>
        <button onClick={() => setFilter('User')} className={`px-3 py-1 rounded-full text-xs ${filter === 'User' ? 'bg-joc-600 text-white' : 'bg-gray-100'}`}>Utilisateurs</button>
        <button onClick={() => setFilter('BlogSource')} className={`px-3 py-1 rounded-full text-xs ${filter === 'BlogSource' ? 'bg-joc-600 text-white' : 'bg-gray-100'}`}>Blog</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div></div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-start gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-joc-500 mt-2 shrink-0"></div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{log.userName}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-gray-500 text-xs">{log.userRole}</span>
                  <span className="text-gray-400">·</span>
                  <span className="text-joc-600 font-medium">{actionLabels[log.action] || log.action}</span>
                </div>
                {log.entityTitle && <p className="text-gray-600 mt-0.5">« {log.entityTitle} »</p>}
                {log.details && <p className="text-gray-400 text-xs mt-0.5">{log.details}</p>}
                {log.statusBefore && log.statusAfter && (
                  <p className="text-xs text-gray-400 mt-0.5">{log.statusBefore} → {log.statusAfter}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} · {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {logs.length === 0 && <p className="text-center text-gray-400 py-8">Aucune action enregistrée</p>}
        </div>
      )}
    </div>
  )
}
