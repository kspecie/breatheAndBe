import type { ReactNode } from 'react'

interface BadgeProps {
  variant?: 'default' | 'streak' | 'category'
  children: ReactNode
  className?: string
}

const variantClasses = {
  default: 'bg-[#E8A87C]/20 text-[#C47B3A]',
  streak: 'bg-[#C47B3A] text-white',
  category: 'bg-[#8C6E5B]/10 text-[#8C6E5B]',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  )
}
