import { useEffect, useState } from 'react'
import api from '../api/client.js'
import { User, Mail, Briefcase, ExternalLink } from 'lucide-react'

export default function Equipe() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/members').then(r => {
      setMembers(r.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Notre équipe</h1>
        <p className="text-gray-500">Les personnes qui font vivre Écho Jociste au quotidien.</p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-joc-200 border-t-joc-600 rounded-full animate-spin"></div>
        </div>
      ) : members.length === 0 ? (
        <p className="text-center text-gray-500 py-20">Aucun membre pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((m) => (
            <div key={m.id} className="card p-5 text-center">
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-joc-100 flex items-center justify-center mx-auto mb-3">
                  <User size={40} className="text-joc-500" />
                </div>
              )}
              <h3 className="font-bold text-gray-900">{m.name}</h3>
              <p className="text-sm text-joc-600 font-medium mb-2">{m.role}</p>
              {m.domain && <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-1"><Briefcase size={12} /> {m.domain}</p>}
              {m.team && <p className="text-xs text-gray-400">{m.team}</p>}
              {m.bio && <p className="text-sm text-gray-600 mt-2 line-clamp-3">{m.bio}</p>}
              <div className="flex justify-center gap-3 mt-3">
                {m.socialLink && (
                  <a href={m.socialLink} target="_blank" rel="noopener" className="text-gray-400 hover:text-joc-600">
                    <ExternalLink size={16} />
                  </a>
                )}
                {m.contact && (
                  <a href={`mailto:${m.contact}`} className="text-gray-400 hover:text-joc-600">
                    <Mail size={16} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
