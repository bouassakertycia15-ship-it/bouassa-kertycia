import { useEffect, useState } from 'react'

export default function Splash({ onDone }) {
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setFade(true), 1800)
    const t2 = setTimeout(() => onDone(), 2400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-joc-600 via-joc-700 to-joc-900 transition-opacity duration-600 ${fade ? 'opacity-0' : 'opacity-100'}`}>
      <div className="animate-[pulse_2s_ease-in-out] flex flex-col items-center">
        <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-white font-bold text-4xl shadow-2xl mb-6 border border-white/20">
          ÉJ
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Écho Jociste</h1>
        <p className="mt-2 text-white/80 text-sm italic">« Jeune chrétien, sois créatif ! »</p>
      </div>
      <div className="absolute bottom-12 flex gap-1.5">
        <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  )
}
