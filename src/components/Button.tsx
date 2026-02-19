import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const sizeClasses = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
}

const variantClasses = {
  primary:
    'bg-[#E8A87C] text-white hover:bg-[#C47B3A] active:bg-[#C47B3A] disabled:bg-[#E8A87C]/50',
  ghost:
    'bg-transparent border border-[#E8A87C] text-[#C47B3A] hover:bg-[#E8A87C]/10 active:bg-[#E8A87C]/20 disabled:opacity-50',
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        'rounded-full font-semibold transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C47B3A] focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
