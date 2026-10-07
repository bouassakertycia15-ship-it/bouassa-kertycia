import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

export default function AudioPlayer({ src, title }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [current, setCurrent] = useState(0)
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => {
      setCurrent(audio.currentTime)
      setProgress((audio.currentTime / (audio.duration || 1)) * 100)
    }
    const onMeta = () => setDuration(audio.duration)
    const onEnd = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause() } else { audio.play() }
    setPlaying(!playing)
  }

  const seek = (e) => {
    const audio = audioRef.current
    if (!audio) return
    const pct = e.target.value
    audio.currentTime = (pct / 100) * (audio.duration || 0)
    setProgress(pct)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !muted
    setMuted(!muted)
  }

  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="w-12 h-12 rounded-full bg-joc-600 text-white flex items-center justify-center shrink-0 hover:bg-joc-700 transition-colors"
        >
          {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate mb-1">{title}</p>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={seek}
            className="w-full h-1.5 rounded-full appearance-none bg-gray-200 cursor-pointer accent-joc-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{fmt(current)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
        <button onClick={toggleMute} className="p-2 text-gray-500 hover:text-gray-700 shrink-0">
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  )
}
