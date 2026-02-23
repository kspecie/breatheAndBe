import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { PageTransition } from './PageTransition'

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex flex-col h-dvh overflow-y-auto">
      {/* Scrollable content — centered, 480px max on desktop */}
      <main className="flex-1 w-full max-w-[480px] mx-auto">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}
