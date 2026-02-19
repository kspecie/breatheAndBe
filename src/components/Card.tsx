import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  onClick?: () => void
  className?: string
}

export function Card({ children, onClick, className = '', ...props }: CardProps) {
  const isInteractive = Boolean(onClick)

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={[
        'bg-white rounded-[20px] shadow-[0_4px_24px_rgba(196,123,58,0.1)]',
        isInteractive
          ? 'cursor-pointer hover:shadow-[0_6px_28px_rgba(196,123,58,0.18)] transition-shadow duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C47B3A] focus-visible:ring-offset-2'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
