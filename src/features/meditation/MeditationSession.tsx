import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Eye, EyeOff, Pause, Play, X } from 'lucide-react'
import { getMeditationById } from '../../data/meditations'
import { useMeditationTimer } from '../../hooks/useMeditationTimer'
import { useAudioStore } from '../../store/audioStore'
import { ProgressBar } from '../../components/ProgressBar'
import { Button } from '../../components/Button'
import { AmbientSoundPicker } from '../../components/AmbientSoundPicker'

// Format seconds as M:SS
function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export function MeditationSession() {
  const { meditationId } = useParams<{ meditationId: string }>()
  const navigate = useNavigate()
  const meditation = getMeditationById(meditationId ?? '')

  if (!meditation) {
    return (
      <div className="min-h-screen bg-[#2A1F17] flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-[#E8A87C] text-lg mb-4">Meditation not found.</p>
          <Button onClick={() => navigate('/meditate')} variant="ghost">
            Go back
          </Button>
        </div>
      </div>
    )
  }

  return <SessionView meditationId={meditation.id} />
}

function SessionView({ meditationId }: { meditationId: string }) {
  const navigate = useNavigate()
  const meditation = getMeditationById(meditationId)!
  const timer = useMeditationTimer(meditation)
  const audio = useAudioStore()
  const prefersReducedMotion = useReducedMotion()

  const [showText, setShowText] = useState(false)

  // Start ambient audio on mount; stop on unmount
  useEffect(() => {
    audio.play()
    return () => {
      audio.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const currentParagraph = meditation.paragraphs[timer.currentParagraphIndex]

  // Determine the section label for the current paragraph (if any)
  const currentLabel = currentParagraph?.label

  // Detect if the label changed from the previous paragraph
  const prevParagraph = timer.currentParagraphIndex > 0
    ? meditation.paragraphs[timer.currentParagraphIndex - 1]
    : null
  const isNewSection = currentLabel && currentLabel !== prevParagraph?.label

  function handleEnd() {
    navigate('/meditate')
  }

  function handleGoAgain() {
    window.location.reload()
  }

  return (
    <div className="min-h-dvh bg-[#2A1F17] select-none">
      <div className="flex flex-col min-h-dvh max-w-[480px] mx-auto">
      {/* Top: progress bar */}
      <div className="pt-safe px-6 pt-10 pb-4">
        <ProgressBar
          value={timer.sessionProgress}
          aria-label="Session progress"
          className="mb-2"
        />
        <p className="text-center text-xs text-[#8C6E5B]">
          {timer.isFinished ? 'Complete' : formatTime(timer.totalSecondsLeft) + ' remaining'}
        </p>
      </div>

      {/* Centre */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
        <AnimatePresence mode="wait">
          {timer.isFinished ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <p className="text-5xl mb-4">✦</p>
              <h2 className="text-3xl font-bold text-[#E8A87C] mb-2">Well done</h2>
              <p className="text-[#8C6E5B] mb-10">
                {meditation.durationMinutes} minute meditation complete
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="ghost" onClick={handleGoAgain}>
                  Begin again
                </Button>
                <Button onClick={handleEnd}>Done</Button>
              </div>
            </motion.div>
          ) : showText ? (
            // ── Text view ─────────────────────────────────────────────────
            <motion.div
              key="text-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-6 w-full max-w-sm"
            >
              {/* Section label — shown when a new section starts */}
              <AnimatePresence>
                {isNewSection && (
                  <motion.p
                    key={currentLabel}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-[#E8A87C]/60 uppercase tracking-[0.15em]"
                  >
                    {currentLabel}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Current section label (persistent while in section) */}
              {currentLabel && !isNewSection && (
                <p className="text-xs font-semibold text-[#E8A87C]/40 uppercase tracking-[0.15em]">
                  {currentLabel}
                </p>
              )}

              {/* Paragraph text */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={timer.currentParagraphIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.8 } }}
                  exit={{ opacity: 0, transition: { duration: 0.4 } }}
                  className="text-center text-lg text-[#E8A87C]/90 leading-relaxed"
                >
                  {currentParagraph?.text}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : (
            // ── Timer view (default) ───────────────────────────────────────
            <motion.div
              key="timer-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Soft pulsing orb */}
              <motion.div
                animate={
                  prefersReducedMotion
                    ? { opacity: [0.4, 0.7, 0.4] }
                    : { opacity: [0.3, 0.6, 0.3], scale: [1, 1.06, 1] }
                }
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: 160,
                  height: 160,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 40% 35%, #F5C49A 0%, #E8A87C 45%, #C47B3A 100%)',
                  filter: 'blur(2px)',
                }}
              />

              {/* Total time remaining */}
              <p className="text-5xl font-bold text-[#C47B3A] tabular-nums tracking-tight">
                {formatTime(timer.totalSecondsLeft)}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sound picker */}
      {!timer.isFinished && (
        <div className="px-6 pb-4">
          <AmbientSoundPicker />
        </div>
      )}

      {/* Controls: pause / end / text toggle */}
      {!timer.isFinished && (
        <div className="px-6 pb-10 flex items-center justify-center gap-6">
          {/* Pause / Resume */}
          <button
            onClick={
              timer.isRunning
                ? () => { timer.pause(); audio.stop() }
                : () => { timer.resume(); audio.play() }
            }
            className="w-14 h-14 rounded-full bg-[#E8A87C]/20 flex items-center justify-center text-[#E8A87C] hover:bg-[#E8A87C]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A87C]"
            aria-label={timer.isRunning ? 'Pause session' : 'Resume session'}
          >
            {timer.isRunning ? (
              <Pause size={22} strokeWidth={1.8} />
            ) : (
              <Play size={22} strokeWidth={1.8} />
            )}
          </button>

          {/* End */}
          <button
            onClick={() => { timer.end(); audio.stop() }}
            className="w-14 h-14 rounded-full bg-[#8C6E5B]/20 flex items-center justify-center text-[#8C6E5B] hover:bg-[#8C6E5B]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6E5B]"
            aria-label="End session"
          >
            <X size={22} strokeWidth={1.8} />
          </button>

          {/* Text toggle */}
          <button
            onClick={() => setShowText((prev) => !prev)}
            className="w-14 h-14 rounded-full bg-[#8C6E5B]/20 flex items-center justify-center text-[#8C6E5B] hover:bg-[#8C6E5B]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6E5B]"
            aria-label={showText ? 'Hide text' : 'Show text'}
            aria-pressed={showText}
          >
            {showText ? (
              <EyeOff size={22} strokeWidth={1.8} />
            ) : (
              <Eye size={22} strokeWidth={1.8} />
            )}
          </button>

        </div>
      )}

      {/* Footer */}
      {!timer.isFinished && (
        <p className="text-center text-xs text-[#8C6E5B]/50 pb-6">
          {meditation.title} · {meditation.durationMinutes} min
        </p>
      )}
      </div>
    </div>
  )
}
