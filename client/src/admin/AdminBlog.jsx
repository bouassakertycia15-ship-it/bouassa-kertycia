import { useState } from 'react'
import api from '../api/client.js'
import { Download, RefreshCw, Link2, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminBlog() {
  const [syncing, setSyncing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const syncFeed = async () => {
    setSyncing(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.post('/admin/blog/sync')
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur de synchronisation')
    }
    setSyncing(false)
  }

  const importUrl = async (e) => {
    e.preventDefault()
    setImporting(true)
    setError('')
    setResult(null)
    try {
      const { data } = await api.post('/admin/blog/import-url', { url })
      setResult({ success: true, message: 'Article importé', article: data.article })
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur d\'importation')
    }
    setImporting(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Blog / Importation</h2>
      <p className="text-gray-500 mb-6">
        Synchroniser et importer les articles depuis le blog Écho Jociste :
        <a href="https://magazinechretienne1echojociste.blogspot.com" target="_blank" rel="noopener" className="text-joc-600 hover:underline ml-1">
          magazinechretienne1echojociste.blogspot.com
        </a>
      </p>

      {/* Sync from feed */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <RefreshCw size={18} /> Synchronisation automatique (flux RSS/Atom)
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Récupère tous les articles publiés sur le blog. Les articles déjà importés sont mis à jour si modifiés.
          Les doublons sont évités grâce à l'URL et l'identifiant Blogger.
        </p>
        <button onClick={syncFeed} disabled={syncing} className="btn-primary">
          {syncing ? 'Synchronisation...' : <><Download size={16} /> Synchroniser le blog</>}
        </button>
      </div>

      {/* Import from URL */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Link2 size={18} /> Importer un article depuis une URL
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Collez l'URL d'un article spécifique du blog pour l'importer individuellement.
        </p>
        <form onSubmit={importUrl} className="flex gap-2">
          <input
            type="url"
            placeholder="https://magazinechretienne1echojociste.blogspot.com/..."
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500"
            required
          />
          <button type="submit" disabled={importing} className="btn-primary">
            {importing ? 'Import...' : 'Importer'}
          </button>
        </form>
      </div>

      {/* Results */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" /> {error}
        </div>
      )}
      {result && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-2">
          <CheckCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            {result.imported !== undefined ? (
              <p>Synchronisation terminée : {result.imported} importé(s), {result.updated} mis à jour, {result.skipped} ignoré(s) sur {result.total} articles.</p>
            ) : (
              <p>{result.message} : <strong>{result.article?.title}</strong></p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
