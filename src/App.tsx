import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './features/home/HomePage'
import { BreathingLibrary } from './features/breathing/BreathingLibrary'
import { MeditationLibrary } from './features/meditation/MeditationLibrary'
import { HistoryPage } from './features/history/HistoryPage'

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
