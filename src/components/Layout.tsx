import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BottomNav } from './BottomNav'
import { PageTransition } from './PageTransition'

export function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-full flex justify-center">
      {/* Phone-frame container — full width on mobile, 480px centred on desktop */}
      <div className="relative w-full max-w-[480px] flex flex-col min-h-screen pb-16">
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
