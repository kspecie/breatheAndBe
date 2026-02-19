import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './features/home/HomePage'
import { BreathingLibrary } from './features/breathing/BreathingLibrary'
import { PatternDetail } from './features/breathing/PatternDetail'
import { BreathingSession } from './features/breathing/BreathingSession'
import { MeditationLibrary } from './features/meditation/MeditationLibrary'
import { MeditationDetail } from './features/meditation/MeditationDetail'
import { MeditationSession } from './features/meditation/MeditationSession'

function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-4 p-6 text-center">
      <p className="text-4xl">✦</p>
      <h1 className="text-xl font-bold text-[#3D2B1F]">Page not found</h1>
      <p className="text-sm text-[#8C6E5B]">This page doesn't exist.</p>
      <button
        onClick={() => navigate('/')}
        className="mt-2 px-6 py-2.5 rounded-full text-sm font-semibold bg-[#E8A87C] text-white hover:bg-[#C47B3A] transition-colors"
      >
        Go home
      </button>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main layout with bottom nav */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="breathe" element={<BreathingLibrary />} />
          <Route path="breathe/:patternId" element={<PatternDetail />} />
          <Route path="meditate" element={<MeditationLibrary />} />
          <Route path="meditate/:meditationId" element={<MeditationDetail />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Immersive session routes — no bottom nav */}
        <Route
          path="breathe/session/:patternId"
          element={<BreathingSession />}
        />
        <Route
          path="meditate/session/:meditationId"
          element={<MeditationSession />}
        />
      </Routes>
    </BrowserRouter>
  )
}
