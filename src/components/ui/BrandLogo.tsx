import { cn } from '../../lib/utils'

type BrandLogoSize = 'sm' | 'md' | 'lg'

interface BrandLogoProps {
  size?: BrandLogoSize
  showText?: boolean
  subtitle?: string
  className?: string
}

const sizeConfig = {
  sm: {
    container: 'w-8 h-8 rounded-lg',
    fontSize: 'text-[11px]',
    dot: 'w-2 h-2 -top-[3px] -right-[3px] border',
    nameText: 'text-[11px] font-bold tracking-[0.12em]',
    subtitleText: 'text-[9px] mt-0.5',
  },
  md: {
    container: 'w-9 h-9 rounded-xl',
    fontSize: 'text-sm',
    dot: 'w-2.5 h-2.5 -top-1 -right-1 border-2',
    nameText: 'text-xs font-bold tracking-[0.12em]',
    subtitleText: 'text-[10px] mt-0.5',
  },
  lg: {
    container: 'w-12 h-12 rounded-2xl',
    fontSize: 'text-base',
    dot: 'w-3 h-3 -top-1 -right-1 border-2',
    nameText: 'text-sm font-bold tracking-[0.12em]',
    subtitleText: 'text-xs mt-0.5',
  },
}

export function BrandLogo({ size = 'md', showText = false, subtitle, className }: BrandLogoProps) {
  const cfg = sizeConfig[size]

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative shrink-0">
        {/* Main mark */}
        <div
          className={cn(
            cfg.container,
            'flex items-center justify-center select-none',
            'bg-linear-to-br from-brand-primary to-brand-primary-active',
            'shadow-lg shadow-brand-primary/30',
            'ring-1 ring-white/10',
          )}
          aria-hidden
        >
          {/* Subtle top-left shine */}
          <div className="absolute inset-0 rounded-[inherit] bg-linear-to-br from-white/15 to-transparent pointer-events-none" />
          <span className={cn(cfg.fontSize, 'font-extrabold tracking-tighter text-white relative z-10')}>
            JR
          </span>
        </div>

        {/* Gold accent dot */}
        <div
          className={cn(
            cfg.dot,
            'absolute rounded-full border-white',
            'bg-linear-to-br from-[#f0c84a] to-[#d4960a]',
            'shadow-sm',
            'animate-pulse',
          )}
          aria-hidden
        />
      </div>

      {showText && (
        <div className="min-w-0">
          <p className={cn(cfg.nameText, 'uppercase text-brand-primary leading-none')}>
            JR2-MODA
          </p>
          {subtitle && (
            <p className={cn(cfg.subtitleText, 'text-brand-ink-muted leading-none')}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
