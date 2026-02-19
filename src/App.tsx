import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './features/home/HomePage'
import { BreathingLibrary } from './features/breathing/BreathingLibrary'
import { PatternDetail } from './features/breathing/PatternDetail'
import { BreathingSession } from './features/breathing/BreathingSession'
import { MeditationLibrary } from './features/meditation/MeditationLibrary'
import { MeditationDetail } from './features/meditation/MeditationDetail'
import { MeditationSession } from './features/meditation/MeditationSession'

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
