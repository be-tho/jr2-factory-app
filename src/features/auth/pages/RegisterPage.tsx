import { IconEye, IconEyeOff, IconUserPlus } from '@tabler/icons-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthCard } from '../../../components/ui/AuthCard'
import { FormField } from '../../../components/ui/FormField'
import { ic } from '../../../lib/tabler'
import { supabase } from '../../../lib/supabase/client'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    if (data.session) {
      setSuccess('Registro completado. Ya estas autenticado.')
    } else {
      setSuccess(
        'Registro completado. Revisa tu correo para confirmar la cuenta y luego inicia sesion.',
      )
    }
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Registra un usuario para acceder al dashboard."
      icon={<IconUserPlus {...ic.headerSm} aria-hidden />}
    >
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
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              autoComplete="new-password"
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

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}

        {success ? (
          <p className="rounded-lg border border-brand-mint/80 bg-brand-mint/40 px-3 py-2 text-sm text-brand-ink">{success}</p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creando cuenta...' : 'Registrarme'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-ink-muted">
        Ya tienes cuenta?{' '}
        <Link
          to="/login"
          className="font-medium text-brand-ink underline decoration-brand-primary/60 underline-offset-2 hover:text-brand-primary-hover"
        >
          Iniciar sesion
        </Link>
      </p>
    </AuthCard>
  )
}
