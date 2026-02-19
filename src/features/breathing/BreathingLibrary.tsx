import { useNavigate } from 'react-router-dom'
import { breathingPatterns } from '../../data/breathingPatterns'
import { PatternCard } from './PatternCard'

export function BreathingLibrary() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 p-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-[#3D2B1F]">Breathe</h1>
        <p className="mt-1 text-[#8C6E5B]">Choose a pattern to begin.</p>
      </div>

      <div className="flex flex-col gap-3">
        {breathingPatterns.map((pattern) => (
          <PatternCard
            key={pattern.id}
            pattern={pattern}
            onClick={() =>
              navigate(`/breathe/session/${pattern.id}?duration=5`)
            }
          />
        ))}
      </div>
    </div>
  )
}
