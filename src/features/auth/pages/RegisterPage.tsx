import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AuthCard } from '../../../components/ui/AuthCard'
import { FormField } from '../../../components/ui/FormField'
import { supabase } from '../../../lib/supabase/client'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      setSuccess('Registro completado. Ya estas autenticado.')
    } else {
      setSuccess(
        'Registro completado. Revisa tu correo para confirmar la cuenta y luego inicia sesion.'
      )
    }

    setLoading(false)
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Registra un usuario para acceder al dashboard."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="tu@email.com"
          required
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Minimo 6 caracteres"
          minLength={6}
          required
        />

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="rounded-lg border border-brand-mint/80 bg-brand-mint/40 px-3 py-2 text-sm text-brand-ink">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border border-brand-border-strong bg-brand-primary px-4 py-2.5 text-sm font-medium text-brand-ink shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
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
