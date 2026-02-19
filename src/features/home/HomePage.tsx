import { useNavigate } from 'react-router-dom'
import { Wind, Sparkles, ChevronRight } from 'lucide-react'
import { Card } from '../../components/Card'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 p-6 pt-32 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#3D2B1F]">
          {getGreeting()} ✦
        </h1>
        <p className="mt-1 text-[#8C6E5B]">Take a moment for yourself.</p>
      </div>

      {/* Quick-start cards */}
      <div>
        <h2 className="text-sm font-semibold text-[#8C6E5B] uppercase tracking-wider mb-3">
          Start a session
        </h2>
        <div className="flex flex-col gap-3">
          <Card onClick={() => navigate('/breathe')} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E8A87C]/20 flex items-center justify-center">
                <Wind size={22} className="text-[#C47B3A]" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#3D2B1F]">Breathing Exercises</p>
                <p className="text-sm text-[#8C6E5B]">6 guided patterns</p>
              </div>
              <ChevronRight size={18} className="text-[#8C6E5B] flex-shrink-0" />
            </div>
          </Card>

          <Card onClick={() => navigate('/meditate')} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E8A87C]/20 flex items-center justify-center">
                <Sparkles size={22} className="text-[#C47B3A]" strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#3D2B1F]">Guided Meditations</p>
                <p className="text-sm text-[#8C6E5B]">5 calming sessions</p>
              </div>
              <ChevronRight size={18} className="text-[#8C6E5B] flex-shrink-0" />
            </div>
          </Card>
        </div>
      </div>

      {/* Medical disclaimer */}
      <p className="text-xs text-[#8C6E5B]/70 text-center leading-relaxed">
        Breathe &amp; Be is not a substitute for professional medical or mental
        health treatment.
      </p>
    </div>
  )
}
