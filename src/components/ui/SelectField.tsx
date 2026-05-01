import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string
  error?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, className, children, ...props },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brand-ink-muted">{label}</span>
      <select
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-brand-surface px-3 py-2 text-brand-ink outline-none transition focus:ring-2',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200/50'
            : 'border-brand-border-strong focus:border-brand-primary focus:ring-brand-blush/50',
          className,
        )}
        aria-invalid={Boolean(error)}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      )}
    </label>
  )
})
