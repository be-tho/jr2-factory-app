import { IconArrowLeft, IconMailForward } from '@tabler/icons-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthCard } from '../../../components/ui/AuthCard'
import { FormField } from '../../../components/ui/FormField'
import { ic } from '../../../lib/tabler'
import { supabase } from '../../../lib/supabase/client'

const publicAppUrl = (import.meta.env.VITE_PUBLIC_APP_URL ?? 'https://jr2moda.store').replace(/\/$/, '')

function getRecoveryErrorMessage(message: string) {
  if (message.toLowerCase().includes('rate limit')) {
    return 'Supabase limito el envio de emails por demasiados intentos. Espera unos minutos antes de pedir otro enlace.'
  }

  return message
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const normalizedEmail = email.trim().toLowerCase()
    const redirectTo = `${publicAppUrl}/actualizar-password`
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    })

    setLoading(false)

    if (error) {
      toast.error(getRecoveryErrorMessage(error.message))
      return
    }

    setSentTo(normalizedEmail)
    toast.success('Te enviamos el enlace de recuperacion.', {
      description: 'Revisa tu correo y segui el link para crear un password nuevo.',
    })
  }

  return (
    <AuthCard
      title="Recuperar password"
      subtitle="Indica tu email y Supabase te enviara un enlace seguro para cambiarlo."
      icon={<IconMailForward {...ic.headerSm} aria-hidden />}
    >
      {sentTo ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <p className="text-sm font-semibold text-emerald-800">Correo enviado</p>
            <p className="mt-1 text-sm text-emerald-700">
              Si existe una cuenta para {sentTo}, recibiras un enlace para actualizar el password. No pidas otro de
              inmediato: Supabase puede bloquear temporalmente los reenvios.
            </p>
          </div>
          <button
            type="button"
            className="w-full rounded-lg border border-brand-border-strong bg-brand-surface px-4 py-2.5 text-sm font-semibold text-brand-ink transition hover:border-brand-primary hover:text-brand-primary-hover"
            onClick={() => setSentTo(null)}
          >
            Usar otro email
          </button>
        </div>
      ) : (
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <FormField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Enviando enlace...' : 'Enviar enlace de recuperacion'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-brand-ink-muted">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-medium text-brand-ink underline decoration-brand-primary/60 underline-offset-2 hover:text-brand-primary-hover"
        >
          <IconArrowLeft size={16} stroke={1.5} aria-hidden />
          Volver al login
        </Link>
      </p>
    </AuthCard>
  )
}
