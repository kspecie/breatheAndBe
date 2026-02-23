import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Pause, Play, X } from 'lucide-react'
import { getPatternById } from '../../data/breathingPatterns'
import { useBreathingTimer } from '../../hooks/useBreathingTimer'
import { useBreathingGuide } from '../../hooks/useBreathingGuide'
import { useAudioStore } from '../../store/audioStore'
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

// Separated so hooks only mount when pattern is valid
function SessionView({
  pattern,
  durationMinutes,
}: {
  pattern: NonNullable<ReturnType<typeof getPatternById>>
  durationMinutes: number
}) {
  const navigate = useNavigate()
  const timer = useBreathingTimer(pattern, durationMinutes)
  const audio = useAudioStore()

  useBreathingGuide({
    phase: timer.phase,
    phaseDuration: timer.phaseDuration,
    phaseSecondsLeft: timer.phaseSecondsLeft,
    isRunning: timer.isRunning,
    isActive: audio.soundId === 'guided' && audio.isPlaying,
    volume: audio.volume,
    holdInDuration: pattern.phases.holdIn,
    holdOutDuration: pattern.phases.holdOut,
  })

  // Start ambient audio when session mounts; stop on unmount
  useEffect(() => {
    audio.play()
    return () => {
      audio.stop()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function handleEnd() {
    navigate('/breathe')
  }

  function handleGoAgain() {
    window.location.reload()
  }

  return (
    <div className="min-h-dvh bg-[#2A1F17] select-none">
      <div className="flex flex-col min-h-dvh max-w-[480px] mx-auto">
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
              className="flex flex-col items-center gap-20"
            >
              <BreathingShape
                phase={timer.phase}
                phaseDuration={timer.phaseDuration}
                phaseSecondsLeft={timer.phaseSecondsLeft}
                isRunning={timer.isRunning}
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

      {/* Volume slider — shown when white noise or guided tones is active */}
      {!timer.isFinished && audio.soundId !== 'silence' && (
        <div className="px-6 pb-4 flex items-center gap-3 max-w-[240px] mx-auto w-full">
          <span className="text-xs text-[#8C6E5B]/60 w-14 shrink-0">Volume</span>
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.005}
            value={audio.volume}
            onChange={(e) => audio.setVolume(Number(e.target.value))}
            aria-label="Sound volume"
            className="flex-1 h-1.5 appearance-none rounded-full cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-4
              [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-[#E8A87C]
              [&::-webkit-slider-track]:rounded-full"
            style={{
              background: `linear-gradient(to right, #E8A87C ${audio.volume * 200}%, rgba(232,168,124,0.2) ${audio.volume * 200}%)`,
            }}
          />
        </div>
      )}

      {/* Pause / End controls */}
      {!timer.isFinished && (
        <div className="px-6 pb-10 flex items-center justify-center gap-6">
          <button
            onClick={timer.isRunning
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

          <button
            onClick={() => { timer.end(); audio.stop() }}
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
    </div>
  )
}
