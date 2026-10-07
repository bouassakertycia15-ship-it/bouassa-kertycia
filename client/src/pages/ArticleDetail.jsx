import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client.js'
import ArticleCard from '../components/ArticleCard.jsx'
import ShareButtons from '../components/ShareButtons.jsx'
import { Calendar, User, Tag, ArrowLeft, ExternalLink, BookOpen, MessageSquare, Send } from 'lucide-react'

export default function ArticleDetail() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState({ userName: '', content: '' })
  const [commentSent, setCommentSent] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/articles/${slug}`).then(r => {
      setArticle(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [slug])

  const submitComment = async (e) => {
    e.preventDefault()
    if (!comment.userName || !comment.content) return
    try {
      await api.post(`/articles/${slug}/comments`, comment)
      setCommentSent(true)
      setComment({ userName: '', content: '' })
      setTimeout(() => setCommentSent(false), 5000)
    } catch {}
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
    </div>
  }

  if (!article) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center">
      <p className="text-gray-500">Article non trouvé.</p>
      <Link to="/magazine" className="btn-primary mt-4">Retour au magazine</Link>
    </div>
  }

  const dateStr = new Date(article.publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div>
      <article className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/magazine" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-joc-600 mb-4">
          <ArrowLeft size={16} /> Retour au magazine
        </Link>

        {article.category && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-joc-600 mb-2">
            {article.category.name}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">{article.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          {article.author && <span className="flex items-center gap-1"><User size={14} /> {article.author.name}</span>}
          <span className="flex items-center gap-1"><Calendar size={14} /> {dateStr}</span>
          {article.source === 'BLOG' && (
            <span className="flex items-center gap-1 text-blue-500"><BookOpen size={14} /> Importé du blog</span>
          )}
        </div>

        {article.coverImage && (
          <img src={article.coverImage} alt={article.title} className="w-full rounded-xl mb-6 max-h-96 object-cover" />
        )}

        {article.excerpt && (
          <p className="text-lg text-gray-600 font-medium mb-6 leading-relaxed">{article.excerpt}</p>
        )}

        <div
          className="prose-content text-gray-800"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Tags */}
        {article.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {article.tags.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-600">
                <Tag size={12} /> {t.name}
              </span>
            ))}
          </div>
        )}

        {/* Source + original link */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-sm text-gray-500 mb-2">
            <strong>Source :</strong> {article.source === 'BLOG' ? 'Écho Jociste – Magazine (Blog)' : 'Écho Jociste – Application'}
          </p>
          {article.originalUrl && (
            <a
              href={article.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-joc-600 hover:text-joc-700"
            >
              <ExternalLink size={14} /> Voir l'article original
            </a>
          )}
        </div>

        {/* Share */}
        <div className="mt-6 flex items-center gap-3">
          <ShareButtons title={article.title} path={`/magazine/${article.slug}`} />
        </div>

        {/* Comments */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare size={20} /> Commentaires ({article.comments?.length || 0})
          </h2>

          {commentSent && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
              Commentaire envoyé ! Il sera visible après modération.
            </div>
          )}

          <form onSubmit={submitComment} className="mb-6 space-y-3">
            <input
              type="text"
              placeholder="Votre nom"
              value={comment.userName}
              onChange={(e) => setComment({ ...comment, userName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
            />
            <textarea
              placeholder="Votre commentaire..."
              rows="3"
              value={comment.content}
              onChange={(e) => setComment({ ...comment, content: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none resize-none"
            />
            <button type="submit" className="btn-primary">
              <Send size={16} /> Envoyer
            </button>
          </form>

          {article.comments?.map((c) => (
            <div key={c.id} className="bg-white rounded-lg border border-gray-100 p-4 mb-3">
              <p className="text-sm font-semibold text-gray-900">{c.userName}</p>
              <p className="text-sm text-gray-600 mt-1">{c.content}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </section>

        {/* Similar articles */}
        {article.similar?.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Articles similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {article.similar.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
