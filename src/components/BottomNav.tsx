import { NavLink } from 'react-router-dom'
import { Home, Wind, Sparkles, Clock } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/breathe', label: 'Breathe', icon: Wind },
  { to: '/meditate', label: 'Meditate', icon: Sparkles },
  { to: '/history', label: 'History', icon: Clock },
]

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10 flex justify-around items-center h-16 bg-white/80 backdrop-blur-sm border-t border-[#E8A87C]/30"
      aria-label="Main navigation"
    >
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors ${
              isActive
                ? 'text-[#C47B3A]'
                : 'text-[#8C6E5B] hover:text-[#E8A87C]'
            }`
          }
          aria-label={label}
        >
          <Icon size={22} strokeWidth={1.8} />
          <span className="text-xs font-semibold">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
