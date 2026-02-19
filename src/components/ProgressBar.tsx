interface ProgressBarProps {
  value: number // 0–100
  className?: string
  'aria-label': string
}

export function ProgressBar({ value, className = '', 'aria-label': ariaLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      className={['w-full h-2 bg-[#E8A87C]/20 rounded-full overflow-hidden', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div
        className="h-full bg-[#C47B3A] rounded-full transition-all duration-300 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
