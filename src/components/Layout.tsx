import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { PageTransition } from './PageTransition'

export function Layout() {
  const location = useLocation()

  return (
    <div className="flex justify-center min-h-dvh">
      {/* Centered content column — full width on mobile, 480px on desktop */}
      <div className="w-full max-w-[480px] flex flex-col h-dvh">
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
