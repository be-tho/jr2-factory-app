import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, className, ...props },
  ref,
) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brand-ink-muted">{label}</span>
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50',
          className,
        )}
        {...props}
      />
    </label>
  )
})
