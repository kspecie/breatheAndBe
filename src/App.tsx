import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './features/home/HomePage'
import { BreathingLibrary } from './features/breathing/BreathingLibrary'
import { BreathingSession } from './features/breathing/BreathingSession'
import { MeditationLibrary } from './features/meditation/MeditationLibrary'
import { HistoryPage } from './features/history/HistoryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main layout with bottom nav */}
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="breathe" element={<BreathingLibrary />} />
          <Route path="meditate" element={<MeditationLibrary />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>

        {/* Immersive session routes — no bottom nav */}
        <Route
          path="breathe/session/:patternId"
          element={<BreathingSession />}
        />
      </Routes>
    </BrowserRouter>
  )
}
