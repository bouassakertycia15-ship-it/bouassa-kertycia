import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { setAuthToken } from '../api/client.js'
import { Lock, ArrowLeft } from 'lucide-react'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      setAuthToken(data.token)
      navigate('/admin')
    } catch {
      setError('Identifiants incorrects')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-joc-600 mb-6">
          <ArrowLeft size={16} /> Retour au site
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-joc-600 flex items-center justify-center mx-auto mb-3">
              <Lock size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-sm text-gray-500 mt-1">Écho Jociste — Espace administrateur</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
              required
            />
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            Compte de démonstration : admin@echojociste.cg / echojociste2024
          </p>
        </div>
      </div>
    </div>
  )
}
