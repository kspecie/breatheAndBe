import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function Layout() {
  return (
    <div className="min-h-full flex justify-center">
      {/* Phone-frame container — full width on mobile, 480px centred on desktop */}
      <div className="relative w-full max-w-[480px] flex flex-col min-h-screen pb-16">
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
