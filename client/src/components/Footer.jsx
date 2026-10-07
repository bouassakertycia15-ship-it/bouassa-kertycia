import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { Heart, Mail } from 'lucide-react'

export default function Footer() {
  const [socials, setSocials] = useState([])

  useEffect(() => {
    api.get('/social-links').then(r => setSocials(r.data)).catch(() => {})
  }, [])

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 pb-20 lg:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-lg bg-joc-600 flex items-center justify-center text-white font-bold">ÉJ</div>
              <div>
                <span className="block font-bold text-white">Écho Jociste</span>
                <span className="block text-xs text-gray-400">JOC Congo-Brazzaville</span>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md">
              Le média et canal de communication de la JOC Congo-Brazzaville.
              Valoriser la jeunesse chrétienne à travers la foi, l'engagement et l'action sociale.
            </p>
            <p className="mt-3 text-sm font-semibold text-joc-400">
              « Jeune chrétien, sois créatif ! »
            </p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs text-gray-500">#soisjociste</span>
              <span className="text-xs text-gray-500">#soisresponsable</span>
              <span className="text-xs text-gray-500">#échojociste</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/magazine" className="hover:text-joc-400">Magazine</Link></li>
              <li><Link to="/pourquoi-etre-jociste" className="hover:text-joc-400">Pourquoi être Jociste ?</Link></li>
              <li><Link to="/la-vie-dans-la-joc" className="hover:text-joc-400">La vie dans la JOC</Link></li>
              <li><Link to="/echo-audio" className="hover:text-joc-400">Écho Audio</Link></li>
              <li><Link to="/evenements" className="hover:text-joc-400">Événements</Link></li>
              <li><Link to="/espace-echange" className="hover:text-joc-400">Espace d'échange</Link></li>
            </ul>
          </div>

          {/* Social + Contact */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm">Suivez-nous</h3>
            <ul className="space-y-2 text-sm">
              {socials.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-joc-400 capitalize">
                    {s.platform}
                  </a>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="inline-flex items-center gap-1 mt-4 text-sm hover:text-joc-400">
              <Mail size={16} /> Nous contacter
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Écho Jociste — JOC Congo-Brazzaville. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Fait avec <Heart size={12} className="text-joc-500" /> pour la jeunesse chrétienne
          </p>
          <Link to="/admin/login" className="text-xs text-gray-600 hover:text-gray-400">Administration</Link>
        </div>
      </div>
    </footer>
  )
}
