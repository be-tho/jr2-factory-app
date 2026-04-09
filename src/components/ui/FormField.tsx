import type { InputHTMLAttributes } from 'react'

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function FormField({ label, className, ...props }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brand-ink-muted">{label}</span>
      <input
        className={`w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 ${className ?? ''}`}
        {...props}
      />
    </label>
  )
}
