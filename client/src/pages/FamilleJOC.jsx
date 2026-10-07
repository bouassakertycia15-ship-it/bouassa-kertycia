import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { User, Heart, Target, Eye } from 'lucide-react'

export default function FamilleJOC() {
  const [family, setFamily] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/joc-family').then(r => {
      setFamily(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">La famille JOC</h1>
        <p className="text-gray-500">La JOC Congo-Brazzaville : présentation, mission, valeurs et responsables.</p>
      </div>

      {/* Presentation */}
      <div className="bg-gradient-to-br from-joc-50 to-amber-50 rounded-2xl p-6 md:p-8 mb-8 border border-joc-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Présentation</h2>
        <p className="text-gray-700 mb-4">
          La JOC (Jeunesse Ouvrière Chrétienne) Congo-Brazzaville est un mouvement d'éducation et d'action
          qui accompagne les jeunes dans leur cheminement de foi et d'engagement. Inspirée par Joseph Cardijn,
          elle forme des jeunes responsables, créatifs et engagés dans leur milieu de vie.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-xl p-4 text-center">
            <Target size={28} className="text-joc-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm">Mission</h3>
            <p className="text-xs text-gray-500 mt-1">Éduquer les jeunes à la foi et à la responsabilité</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <Eye size={28} className="text-joc-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm">Vision</h3>
            <p className="text-xs text-gray-500 mt-1">Un monde où chaque jeune est acteur de sa vie</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <Heart size={28} className="text-joc-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 text-sm">Valeurs</h3>
            <p className="text-xs text-gray-500 mt-1">Foi, fraternité, solidarité, responsabilité</p>
          </div>
        </div>
      </div>

      {/* Responsables */}
      <h2 className="section-title mb-4">Responsables et membres importants</h2>
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        </div>
      ) : family.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Aucun membre pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {family.map((m) => (
            <div key={m.id} className="card p-5 flex gap-4">
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-joc-100 flex items-center justify-center shrink-0">
                  <User size={32} className="text-joc-500" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-gray-900">{m.name}</h3>
                <p className="text-sm text-joc-600 font-medium mb-1">{m.role}</p>
                {m.team && <p className="text-xs text-gray-400 mb-1">{m.team}</p>}
                {m.bio && <p className="text-sm text-gray-600 line-clamp-2">{m.bio}</p>}
                {m.parcours && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{m.parcours}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
