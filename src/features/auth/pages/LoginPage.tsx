import { IconClock, IconEye, IconEyeOff, IconLogin } from '@tabler/icons-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthCard } from '../../../components/ui/AuthCard'
import { FormField } from '../../../components/ui/FormField'
import { ic } from '../../../lib/tabler'
import { supabase } from '../../../lib/supabase/client'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const pendingActivation = (location.state as { pendingActivation?: boolean } | null)?.pendingActivation === true

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setLoading(false)
      toast.error(signInError.message)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profile?.is_active === false) {
      await supabase.auth.signOut()
      setLoading(false)
      toast.warning('Tu cuenta aún no fue habilitada.', {
        description: 'El administrador te activará pronto. Volvé a intentarlo más tarde.',
        duration: 6000,
      })
      return
    }

    setLoading(false)
    const name = data.user?.email?.split('@')[0] ?? 'usuario'
    toast.success(`¡Bienvenido, ${name}!`, {
      description: 'Sesión iniciada correctamente.',
    })
  }

  return (
    <AuthCard
      title="Bienvenido de nuevo"
      subtitle="Inicia sesion para entrar al dashboard."
      icon={<IconLogin {...ic.headerSm} aria-hidden />}
    >
      {pendingActivation && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <IconClock size={18} stroke={1.5} className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-800">Cuenta pendiente de activación</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Tu correo fue verificado correctamente. El administrador habilitará tu cuenta pronto.
            </p>
          </div>
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          autoComplete="email"
          required
        />
        <div className="block">
          <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-3 pr-10 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-ink-faint transition hover:text-brand-primary"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <IconEyeOff size={18} stroke={1.5} aria-hidden />
              ) : (
                <IconEye size={18} stroke={1.5} aria-hidden />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-ink-muted">
        No tienes cuenta?{' '}
        <Link
          to="/registro"
          className="font-medium text-brand-ink underline decoration-brand-primary/60 underline-offset-2 hover:text-brand-primary-hover"
        >
          Registrarte
        </Link>
      </p>

      <p className="mt-3 text-center text-xs text-brand-ink-faint">Acceso solo para personal autorizado.</p>
    </AuthCard>
  )
}
