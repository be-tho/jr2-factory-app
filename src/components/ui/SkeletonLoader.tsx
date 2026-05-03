import { type HTMLAttributes } from 'react'

interface SkeletonLoaderProps extends HTMLAttributes<HTMLDivElement> {
  count?: number
  className?: string
}

export function SkeletonLoader({ count = 1, className = 'h-4 rounded bg-brand-border', ...props }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse ${className}`}
          {...props}
        />
      ))}
    </>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse overflow-hidden rounded-xl bg-brand-surface ring-1 ring-brand-border ${className}`}>
      <div className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 rounded-md bg-brand-primary-ghost" />
          <div className="h-3 w-12 rounded bg-brand-border" />
        </div>
        <div className="h-4 w-4/5 rounded bg-brand-border" />
        <div className="h-3 w-2/3 rounded bg-brand-border" />
        <div className="mt-3 flex items-center justify-between border-t border-brand-border-subtle pt-3">
          <div className="h-5 w-20 rounded bg-brand-border" />
          <div className="h-5 w-16 rounded-full bg-brand-border" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl bg-brand-surface shadow-sm ring-1 ring-brand-border">
      <div className="divide-y divide-brand-border-subtle">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 px-5 py-4">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className={`h-4 rounded bg-brand-border ${j === 0 ? 'w-20' : j === cols - 1 ? 'w-16 ml-auto' : 'flex-1'}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/4">
          <div className="flex items-start justify-between gap-3">
            <div className="h-4 w-24 rounded bg-brand-border" />
            <div className="h-5 w-5 rounded bg-brand-border" />
          </div>
          <div className="mt-2 h-7 w-20 rounded bg-brand-border" />
          <div className="mt-1 h-3 w-32 rounded bg-brand-border" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl bg-brand-surface p-5 shadow-sm ring-1 ring-brand-border">
      <div className="flex items-center justify-between">
        <div className="h-5 w-32 rounded bg-brand-border" />
        <div className="h-8 w-24 rounded bg-brand-border" />
      </div>
      <div className="h-[250px] rounded bg-brand-canvas" />
    </div>
  )
}
