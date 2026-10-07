import { useState } from 'react'
import api from '../api/client.js'
import { Mail, Send, MessageSquare, Lightbulb, Heart, Mic, Video } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.message) { setError('Nom et message sont requis'); return }
    setError('')
    try {
      await api.post('/contact', form)
      setSent(true)
      setForm({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSent(false), 5000)
    } catch {
      setError('Erreur lors de l\'envoi. Réessayez.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-joc-100 flex items-center justify-center mx-auto mb-3">
          <Mail size={32} className="text-joc-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact</h1>
        <p className="text-gray-500">Envoyez un message, posez une question, proposez un témoignage ou une collaboration.</p>
      </div>

      {sent && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg text-sm">
          Message envoyé avec succès ! Nous vous répondrons dès que possible.
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      <form onSubmit={submit} className="space-y-4 bg-white rounded-xl border border-gray-100 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Votre nom *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
          />
          <input
            type="email"
            placeholder="Votre email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
          />
        </div>
        <input
          type="text"
          placeholder="Sujet"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none"
        />
        <textarea
          placeholder="Votre message *"
          rows="5"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-joc-500 focus:border-transparent outline-none resize-none"
        />
        <button type="submit" className="btn-primary w-full">
          <Send size={16} /> Envoyer le message
        </button>
      </form>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <a href="/espace-echange" className="card p-4 flex items-center gap-3 hover:border-joc-200">
          <MessageSquare size={20} className="text-joc-600" />
          <span className="text-sm font-medium text-gray-700">Espace d'échange</span>
        </a>
        <a href="/famille-joc" className="card p-4 flex items-center gap-3 hover:border-joc-200">
          <Heart size={20} className="text-joc-600" />
          <span className="text-sm font-medium text-gray-700">Découvrir la JOC</span>
        </a>
      </div>
    </div>
  )
}
