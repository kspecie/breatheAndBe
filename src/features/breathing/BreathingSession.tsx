import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, X } from 'lucide-react'
import { getPatternById } from '../../data/breathingPatterns'
import { useBreathingTimer } from '../../hooks/useBreathingTimer'
import { BreathingShape } from './BreathingShape'
import { ProgressBar } from '../../components/ProgressBar'
import { Button } from '../../components/Button'

export function BreathingSession() {
  const { patternId } = useParams<{ patternId: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const pattern = getPatternById(patternId ?? '')
  const durationMinutes = Number(searchParams.get('duration')) || 5

  if (!pattern) {
    return (
      <div className="min-h-screen bg-[#3D2B1F] flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-[#E8A87C] text-lg mb-4">Pattern not found.</p>
          <Button onClick={() => navigate('/breathe')} variant="ghost">
            Go back
          </Button>
        </div>
      </div>
    )
  }

  return <SessionView pattern={pattern} durationMinutes={durationMinutes} />
}

// Separated so the hook only mounts when pattern is valid
function SessionView({
  pattern,
  durationMinutes,
}: {
  pattern: NonNullable<ReturnType<typeof getPatternById>>
  durationMinutes: number
}) {
  const navigate = useNavigate()
  const timer = useBreathingTimer(pattern, durationMinutes)

  function handleEnd() {
    navigate('/breathe')
  }

  function handleGoAgain() {
    // Reload the page to reset state cleanly
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#2A1F17] flex flex-col select-none">
      {/* Top: progress bar + cycle count */}
      <div className="pt-safe px-6 pt-10 pb-4">
        <ProgressBar
          value={timer.sessionProgress}
          aria-label="Session progress"
          className="mb-2"
        />
        <p className="text-center text-xs text-[#8C6E5B]">
          {timer.isFinished
            ? 'Complete'
            : `Cycle ${timer.cyclesCompleted + 1} of ${timer.totalCycles}`}
        </p>
      </div>

      {/* Centre: animated shape + phase info */}
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
              <h2 className="text-3xl font-bold text-[#E8A87C] mb-2">
                Well done
              </h2>
              <p className="text-[#8C6E5B] mb-10">
                {durationMinutes} minute session complete
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="ghost" onClick={handleGoAgain}>
                  Go again
                </Button>
                <Button onClick={handleEnd}>Done</Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="session"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-8"
            >
              <BreathingShape
                phase={timer.phase}
                phaseDuration={timer.phaseDuration}
              />

              <div className="text-center">
                <p className="text-2xl font-bold text-[#E8A87C] mb-2">
                  {timer.phaseLabel}
                </p>
                <p className="text-6xl font-bold text-[#C47B3A] tabular-nums">
                  {timer.phaseSecondsLeft}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      {!timer.isFinished && (
        <div className="px-6 pb-12 flex items-center justify-center gap-6">
          <button
            onClick={timer.isRunning ? timer.pause : timer.resume}
            className="w-14 h-14 rounded-full bg-[#E8A87C]/20 flex items-center justify-center text-[#E8A87C] hover:bg-[#E8A87C]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A87C]"
            aria-label={timer.isRunning ? 'Pause session' : 'Resume session'}
          >
            {timer.isRunning ? (
              <Pause size={22} strokeWidth={1.8} />
            ) : (
              <Play size={22} strokeWidth={1.8} />
            )}
          </button>

          <button
            onClick={timer.end}
            className="w-14 h-14 rounded-full bg-[#8C6E5B]/20 flex items-center justify-center text-[#8C6E5B] hover:bg-[#8C6E5B]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C6E5B]"
            aria-label="End session"
          >
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Pattern name footer */}
      {!timer.isFinished && (
        <p className="text-center text-xs text-[#8C6E5B]/50 pb-6">
          {pattern.name} · {durationMinutes} min
        </p>
      )}
    </div>
  )
}
