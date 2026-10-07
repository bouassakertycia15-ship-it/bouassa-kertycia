import { Link } from 'react-router-dom'
import { Calendar, User, BookOpen } from 'lucide-react'

export default function ArticleCard({ article }) {
  const dateStr = new Date(article.publishedAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Link to={`/magazine/${article.slug}`} className="card group block">
      {article.coverImage && (
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={article.coverImage}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        {article.category && (
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-joc-600 mb-2">
            {article.category.name}
          </span>
        )}
        <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-joc-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={12} /> {dateStr}
          </span>
          {article.author && (
            <span className="flex items-center gap-1">
              <User size={12} /> {article.author.name}
            </span>
          )}
          {article.source === 'BLOG' && (
            <span className="flex items-center gap-1 text-blue-500">
              <BookOpen size={12} /> Blog
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
