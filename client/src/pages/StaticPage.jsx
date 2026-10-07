import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client.js'

export default function StaticPage({ slug, title }) {
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/pages/${slug}`).then(r => setPage(r.data)).catch(() => setPage(null)).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div></div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24 lg:pb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      {page ? (
        <div className="prose-content" dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : (
        <div className="prose-content">
          <p>Cette page sera bientôt disponible. Pour toute question, contactez-nous à <a href="mailto:contact@echojociste.cg">contact@echojociste.cg</a>.</p>
          <h2>Écho Jociste</h2>
          <p>Le média et canal de communication de la JOC Congo-Brazzaville. Foi, engagement, jeunesse chrétienne.</p>
          <p>« Jeune chrétien, sois créatif ! »</p>
          <h2>Propriété intellectuelle</h2>
          <p>© Écho Jociste — JOC Congo-Brazzaville. Tous droits réservés.</p>
          <p>Fondatrice : Bouassa Bouetsia Kertycia Grace, née le 9 février 1997, de nationalité congolaise.</p>
        </div>
      )}
    </div>
  )
}
