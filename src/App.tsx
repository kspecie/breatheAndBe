import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { BreathingLibrary } from './features/breathing/BreathingLibrary'
import { MeditationLibrary } from './features/meditation/MeditationLibrary'
import { HistoryPage } from './features/history/HistoryPage'

function HomePage() {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#3D2B1F]">{greeting} 🌸</h1>
      <p className="mt-2 text-[#8C6E5B] text-lg">
        Welcome to Breathe &amp; Be
      </p>
      <p className="mt-4 text-[#8C6E5B]">
        Choose <strong>Breathe</strong> or <strong>Meditate</strong> below to
        get started.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="breathe" element={<BreathingLibrary />} />
          <Route path="meditate" element={<MeditationLibrary />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
