import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, LogIn, UserPlus } from 'lucide-react'
import api, { setAuthToken } from '../api/client.js'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'register') {
        const r = await api.post('/auth/register', { name, email, password })
        setAuthToken(r.data.token)
        navigate('/mon-espace')
      } else {
        const r = await api.post('/auth/login', { email, password })
        setAuthToken(r.data.token)
        if (['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'WRITER', 'MANAGER', 'AUDIO_MANAGER', 'VIDEO_MANAGER', 'MODERATOR', 'EVENT_MANAGER', 'COMM_MANAGER'].includes(r.data.user.role)) {
          navigate('/admin')
        } else {
          navigate('/mon-espace')
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-joc-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">ÉJ</div>
            <h1 className="text-2xl font-bold text-gray-900">{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h1>
            <p className="text-sm text-gray-500 mt-1">{mode === 'login' ? 'Connectez-vous à votre espace' : 'Rejoignez la communauté Écho Jociste'}</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-lg p-3 mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500"
                    placeholder="Votre nom"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-joc-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              {mode === 'login' ? <><LogIn size={18} /> Se connecter</> : <><UserPlus size={18} /> Créer mon compte</>}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            {mode === 'login' ? (
              <>Pas encore de compte ? <button onClick={() => setMode('register')} className="text-joc-600 font-medium hover:underline">S'inscrire</button></>
            ) : (
              <>Déjà inscrit ? <button onClick={() => setMode('login')} className="text-joc-600 font-medium hover:underline">Se connecter</button></>
            )}
          </div>
          <div className="text-center mt-2 text-xs text-gray-400">
            <Link to="/" className="hover:text-joc-600">← Retour à l'accueil</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
