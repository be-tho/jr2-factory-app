import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  IconBellRinging,
  IconClockHour3,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconSparkles,
  IconVolume,
} from '@tabler/icons-react'
import { ic } from '../../../lib/tabler'

const DEFAULT_PRESETS = [10, 15, 30, 45, 60]

function formatTime(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function playCompletionAlert(repetitions = 2) {
  const AudioCtor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

  if (!AudioCtor) {
    return
  }

  const scheduleBeep = (index: number) => {
    const context = new AudioCtor()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(880 + index * 40, context.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.45)

    gain.gain.setValueAtTime(0.0001, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.16, context.currentTime + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.9)

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + 1)

    window.setTimeout(() => {
      void context.close()
    }, 1100)
  }

  for (let i = 0; i < repetitions; i += 1) {
    window.setTimeout(() => scheduleBeep(i), i * 550)
  }
}

function announceBreakFinished(repetitions = 2) {
  if (!('speechSynthesis' in window)) {
    return
  }

  window.speechSynthesis.cancel()

  for (let i = 0; i < repetitions; i += 1) {
    const utterance = new SpeechSynthesisUtterance('Descanso terminado. ¡Hora de trabajar!')
    utterance.lang = 'es-AR'
    utterance.rate = 1
    utterance.pitch = 1.2
    window.setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, i * 700)
  }
}

export function DescansoPage() {
  const [selectedMinutes, setSelectedMinutes] = useState(15)
  const [customMinutes, setCustomMinutes] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(15 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const totalDurationSeconds = useMemo(() => Math.max(1, selectedMinutes * 60), [selectedMinutes])
  const progress = useMemo(
    () => Math.min(100, Math.max(0, ((totalDurationSeconds - secondsLeft) / totalDurationSeconds) * 100)),
    [secondsLeft, totalDurationSeconds],
  )

  useEffect(() => {
    if (!isRunning) {
      return undefined
    }

    const timerId = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timerId)
          setIsRunning(false)
          setIsCompleted(true)
          playCompletionAlert(2)
          announceBreakFinished(2)
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isRunning])

  const applyMinutes = (minutes: number) => {
    setSelectedMinutes(minutes)
    setSecondsLeft(minutes * 60)
    setIsRunning(false)
    setIsCompleted(false)
  }

  const handleCustomMinutes = () => {
    const parsed = Number(customMinutes)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return
    }

    const normalized = Math.min(Math.max(Math.round(parsed), 1), 180)
    const nextMinutes = normalized
    setSelectedMinutes(nextMinutes)
    setCustomMinutes(String(nextMinutes))
    setSecondsLeft(nextMinutes * 60)
    setIsRunning(false)
    setIsCompleted(false)
  }

  const handleStart = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(selectedMinutes * 60)
    }
    setIsCompleted(false)
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleReset = () => {
    setIsRunning(false)
    setIsCompleted(false)
    setSecondsLeft(selectedMinutes * 60)
  }

  const ringStyle = {
    background: `conic-gradient(#eb3d63 ${progress}%, rgba(235, 61, 99, 0.12) ${progress}% 100%)`,
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl rounded-[32px] border border-brand-border bg-white/85 p-5 shadow-[0_20px_60px_rgba(44,40,41,0.08)] backdrop-blur-sm sm:p-8"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary-subtle text-brand-primary">
              <IconClockHour3 {...ic.headerSm} aria-hidden />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink-faint">
                Zona de pausa
              </p>
              <h1 className="text-2xl font-black text-brand-ink sm:text-3xl">Descanso</h1>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-primary-ghost px-3 py-2 text-sm font-medium text-brand-primary">
            <IconSparkles size={16} aria-hidden />
            {isCompleted ? '¡Listo!' : 'Pausa activa'}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="flex flex-col items-center justify-center">
            <div
              className="flex h-64 w-64 items-center justify-center rounded-full p-4 shadow-inner shadow-brand-primary/10 sm:h-80 sm:w-80"
              style={ringStyle}
            >
              <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center ring-1 ring-brand-border">
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-brand-ink-faint">
                  {isCompleted ? 'Tiempo terminado' : 'Resting'}
                </span>
                <time
                  aria-live="polite"
                  className="mt-3 text-5xl font-black tabular-nums tracking-[-0.08em] text-brand-ink sm:text-7xl"
                  dateTime={`PT${Math.floor(secondsLeft / 60)}M${secondsLeft % 60}S`}
                >
                  {formatTime(secondsLeft)}
                </time>
                <span className="mt-2 text-sm text-brand-ink-muted">
                  {selectedMinutes} minuto{selectedMinutes === 1 ? '' : 's'} programados
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-brand-ink">Tiempo de descanso</label>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_PRESETS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => applyMinutes(minutes)}
                    className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                      selectedMinutes === minutes && !isRunning
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-brand-primary-ghost text-brand-ink hover:bg-brand-primary-subtle'
                    }`}
                    aria-pressed={selectedMinutes === minutes && !isRunning}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-brand-border bg-brand-primary-ghost p-3">
              <label htmlFor="custom-break-minutes" className="mb-2 block text-sm font-semibold text-brand-ink">
                Personalizar minutos
              </label>
              <div className="flex gap-2">
                <input
                  id="custom-break-minutes"
                  type="number"
                  min={1}
                  max={180}
                  inputMode="numeric"
                  value={customMinutes}
                  onChange={(event) => setCustomMinutes(event.target.value)}
                  placeholder="15"
                  className="w-full rounded-xl border border-brand-border bg-white px-3 py-2.5 text-base font-medium text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                <button
                  type="button"
                  onClick={handleCustomMinutes}
                  className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-hover"
                >
                  Aplicar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStart}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-primary px-4 py-3 text-base font-bold text-white transition hover:bg-brand-primary-hover"
                >
                  <IconPlayerPlay size={18} aria-hidden />
                  Iniciar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-brand-ink px-4 py-3 text-base font-bold text-white transition hover:opacity-95"
                >
                  <IconPlayerPause size={18} aria-hidden />
                  Pausar
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-2xl border border-brand-border bg-white px-4 py-3 text-base font-bold text-brand-ink transition hover:bg-brand-primary-ghost"
                aria-label="Reiniciar descanso"
              >
                <IconRefresh size={18} aria-hidden />
                Reset
              </button>
            </div>

            <div className="rounded-2xl border border-brand-border bg-[#fffafc] p-4 text-sm text-brand-ink-muted">
              <div className="mb-2 flex items-center gap-2 font-semibold text-brand-ink">
                <IconBellRinging size={18} aria-hidden className="text-brand-primary" />
                Al terminar
              </div>
              <p className="leading-relaxed">
                El timer avisará con dos timbres y dos voces que dicen: “Descanso terminado. ¡Hora de trabajar!”
              </p>
              <div className="mt-3 flex items-center gap-2 text-brand-primary">
                <IconVolume size={16} aria-hidden />
                <span className="font-medium">Sonido + voz activados</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
