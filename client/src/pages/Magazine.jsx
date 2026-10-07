import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../api/client.js'
import ArticleCard from '../components/ArticleCard.jsx'
import { Filter, Archive } from 'lucide-react'

export default function Magazine() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showArchives, setShowArchives] = useState(false)
  const [years, setYears] = useState([])

  const category = searchParams.get('category') || ''
  const source = searchParams.get('source') || ''
  const year = searchParams.get('year') || ''
  const month = searchParams.get('month') || ''

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
    // Generate year list
    const currentYear = new Date().getFullYear()
    setYears(Array.from({ length: currentYear - 2018 }, (_, i) => currentYear - i))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit: 9 }
    if (category) params.category = category
    if (source) params.source = source
    if (year) { params.year = year; if (month) params.month = month }
    api.get('/articles', { params }).then(r => {
      setArticles(r.data.data)
      setTotalPages(r.data.totalPages)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [page, category, source, year, month])

  const setFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) newParams.set(key, value)
    else newParams.delete(key)
    setSearchParams(newParams)
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Magazine</h1>
        <p className="text-gray-500">
          Les publications d'Écho Jociste — articles, réflexions, témoignages et actualités de la JOC Congo-Brazzaville.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Source éditoriale historique :{' '}
          <a href="https://magazinechretienne1echojociste.blogspot.com" target="_blank" rel="noopener" className="text-joc-600 hover:underline">
            magazinechretienne1echojociste.blogspot.com
          </a>
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Filter size={16} className="text-gray-400" />
        <button
          onClick={() => setFilter('category', '')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${!category ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter('category', cat.slug)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${category === cat.slug ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Source filter */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setFilter('source', '')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!source ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Toutes sources
        </button>
        <button
          onClick={() => setFilter('source', 'BLOG')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${source === 'BLOG' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Importés du blog
        </button>
        <button
          onClick={() => setFilter('source', 'APPLICATION')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${source === 'APPLICATION' ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Créés dans l'app
        </button>
      </div>

      {/* Archives */}
      <div className="mb-6">
        <button
          onClick={() => setShowArchives(!showArchives)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-joc-600"
        >
          <Archive size={16} /> Archives {showArchives ? '▲' : '▼'}
        </button>
        {showArchives && (
          <div className="mt-3 flex flex-wrap gap-2">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setFilter('year', year === String(y) ? '' : String(y))}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${year === String(y) ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Articles grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        </div>
      ) : articles.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Aucun article trouvé.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm ${page === i + 1 ? 'bg-joc-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
