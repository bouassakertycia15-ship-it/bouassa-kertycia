import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Link } from 'react-router-dom'
import { Eye, Gavel, Hand, Users, Heart, BookOpen, ArrowRight } from 'lucide-react'

export default function PourquoiEtreJociste() {
  const [page, setPage] = useState(null)

  useEffect(() => {
    api.get('/pages/pourquoi-etre-jociste').then(r => setPage(r.data)).catch(() => {})
  }, [])

  const methodSteps = [
    { icon: Eye, title: 'VOIR', desc: 'Regarder sa réalité avec attention et lucidité. Observer sa vie, son milieu, sa société.', color: 'bg-blue-600' },
    { icon: Gavel, title: 'JUGER', desc: 'Éclairer cette réalité à la lumière de l\'Évangile et de la foi chrétienne.', color: 'bg-amber-600' },
    { icon: Hand, title: 'AGIR', desc: 'Poser des actes concrets pour transformer cette réalité et bâtir un monde plus juste.', color: 'bg-joc-600' },
  ]

  const values = [
    { icon: Heart, title: 'La foi', desc: 'Jésus-Christ est la pierre angulaire de la JOC. Tout part de Lui.' },
    { icon: Users, title: 'La fraternité', desc: 'Vivre ensemble, soutenir les autres, grandir en communauté.' },
    { icon: Hand, title: 'La solidarité', desc: 'Être proche de ceux qui souffrent, agir pour les plus vulnérables.' },
    { icon: BookOpen, title: 'La responsabilité', desc: 'Chaque jeune est acteur de sa vie et de la société.' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Pourquoi être Jociste ?</h1>
        <p className="text-lg text-gray-500">Découvrir la JOC, sa mission, ses valeurs et sa méthode.</p>
      </div>

      {/* Method VJA */}
      <section className="mb-10">
        <h2 className="section-title text-center mb-6">La méthode Voir – Juger – Agir</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {methodSteps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="card p-6 text-center">
                <div className={`w-16 h-16 rounded-full ${step.color} text-white flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Values */}
      <section className="mb-10">
        <h2 className="section-title text-center mb-6">Les valeurs jocistes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {values.map((v) => {
            const Icon = v.icon
            return (
              <div key={v.title} className="flex gap-4 p-5 bg-white rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-joc-50 text-joc-600 flex items-center justify-center shrink-0">
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-600">{v.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Page content */}
      {page && (
        <section className="prose-content bg-white rounded-xl border border-gray-100 p-6 md:p-8">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </section>
      )}

      {/* Cardijn */}
      <section className="mt-10 bg-gradient-to-br from-joc-50 to-amber-50 rounded-2xl p-6 md:p-8 border border-joc-100">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Joseph Cardijn (1882–1967)</h2>
        <p className="text-gray-700 mb-4">
          Fondateur de la JOC, Joseph Cardijn a consacré sa vie à l'éducation des jeunes travailleurs.
          Prêtre puis cardinal, il a développé la méthode Voir – Juger – Agir pour permettre à chaque jeune
          de devenir acteur de sa propre vie et de la société.
        </p>
        <p className="text-gray-700 mb-4">
          Saint Joseph, patron des travailleurs, est le patron de la JOC. Il incarne le travail, la dignité et la fidélité.
        </p>
        <p className="font-bold text-joc-600 text-lg">« Jeune chrétien, sois créatif ! »</p>
      </section>

      {/* CTA */}
      <div className="mt-8 text-center">
        <Link to="/la-vie-dans-la-joc" className="btn-primary">
          Découvrir la vie dans la JOC <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
