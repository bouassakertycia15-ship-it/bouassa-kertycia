import { useState } from 'react'
import { Share2, Facebook, MessageCircle, Send, Link2, Check } from 'lucide-react'

export default function ShareButtons({ title, path }) {
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path

  const share = (platform) => {
    const text = encodeURIComponent(title || 'Écho Jociste')
    const encodedUrl = encodeURIComponent(url)
    const links = {
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
    }
    window.open(links[platform], '_blank', 'noopener,noreferrer')
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="btn-outline"
      >
        <Share2 size={16} /> Partager
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 z-30">
          <button onClick={() => share('whatsapp')} className="p-2.5 rounded-lg hover:bg-green-50 text-green-600" title="WhatsApp">
            <MessageCircle size={18} />
          </button>
          <button onClick={() => share('facebook')} className="p-2.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Facebook">
            <Facebook size={18} />
          </button>
          <button onClick={() => share('telegram')} className="p-2.5 rounded-lg hover:bg-sky-50 text-sky-600" title="Telegram">
            <Send size={18} />
          </button>
          <button onClick={copyLink} className="p-2.5 rounded-lg hover:bg-gray-100 text-gray-600" title="Copier le lien">
            {copied ? <Check size={18} className="text-green-600" /> : <Link2 size={18} />}
          </button>
        </div>
      )}
    </div>
  )
}
