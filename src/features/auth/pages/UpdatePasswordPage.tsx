import { IconArrowLeft, IconEye, IconEyeOff, IconKey } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthCard } from '../../../components/ui/AuthCard'
import { updatePasswordSchema, type UpdatePasswordFormValues } from '../../../lib/schemas/auth'
import { markSessionSignOutReason } from '../../../lib/auth/sessionSignOutReason'
import { ic } from '../../../lib/tabler'
import { supabase } from '../../../lib/supabase/client'
import { useSession } from '../../../hooks/useSession'

export function UpdatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { session, loading: sessionLoading } = useSession()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  async function onSubmit(values: UpdatePasswordFormValues) {
    const { error } = await supabase.auth.updateUser({ password: values.password })

    if (error) {
      toast.error(error.message)
      return
    }

    markSessionSignOutReason('manual')
    await supabase.auth.signOut()
    toast.success('Password actualizado.', {
      description: 'Ya podes iniciar sesion con tu nuevo password.',
    })
    void navigate('/login', { replace: true })
  }

  const loading = isSubmitting

  return (
    <AuthCard
      title="Crear password nuevo"
      subtitle="Ingresa un password nuevo para terminar la recuperacion de tu cuenta."
      icon={<IconKey {...ic.headerSm} aria-hidden />}
    >
      {sessionLoading ? (
        <p className="rounded-lg border border-brand-border bg-brand-blush/20 px-4 py-3 text-sm text-brand-ink-muted">
          Validando enlace de recuperacion...
        </p>
      ) : null}

      {!sessionLoading && !session ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-semibold text-amber-800">Enlace no valido o vencido</p>
            <p className="mt-1 text-sm text-amber-700">
              Pedi un nuevo correo de recuperacion para generar otro enlace seguro.
            </p>
          </div>
          <Link
            to="/recuperar-password"
            className="inline-flex w-full items-center justify-center rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover"
          >
            Solicitar nuevo enlace
          </Link>
        </div>
      ) : null}

      {!sessionLoading && session ? (
        <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
          <PasswordField
            label="Nuevo password"
            registration={register('password')}
            error={errors.password?.message}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword((value) => !value)}
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirmar password"
            registration={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            showPassword={showPassword}
            onToggleVisibility={() => setShowPassword((value) => !value)}
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-brand-primary-hover bg-brand-primary px-4 py-2.5 text-sm font-semibold text-brand-on-primary shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Actualizando password...' : 'Actualizar password'}
          </button>
        </form>
      ) : null}

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

function PasswordField({
  label,
  registration,
  error,
  showPassword,
  onToggleVisibility,
  autoComplete,
}: {
  label: string
  registration: UseFormRegisterReturn<'password'> | UseFormRegisterReturn<'confirmPassword'>
  error?: string
  showPassword: boolean
  onToggleVisibility: () => void
  autoComplete: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-brand-ink-muted">{label}</span>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Minimo 6 caracteres"
          autoComplete={autoComplete}
          className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-3 pr-10 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 aria-invalid:border-red-400"
          aria-invalid={Boolean(error)}
          {...registration}
        />
        <button
          type="button"
          aria-label={showPassword ? 'Ocultar password' : 'Mostrar password'}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-brand-ink-faint transition hover:text-brand-primary"
          onClick={onToggleVisibility}
        >
          {showPassword ? (
            <IconEyeOff size={18} stroke={1.5} aria-hidden />
          ) : (
            <IconEye size={18} stroke={1.5} aria-hidden />
          )}
        </button>
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-red-600">{error}</p> : null}
    </label>
  )
}
