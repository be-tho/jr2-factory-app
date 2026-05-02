import { IconEye, IconEyeOff, IconUserPlus } from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthCard } from '../../../components/ui/AuthCard'
import { FormField } from '../../../components/ui/FormField'
import { registerSchema, type RegisterFormValues } from '../../../lib/schemas/auth'
import { ic } from '../../../lib/tabler'
import { supabase } from '../../../lib/supabase/client'

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: RegisterFormValues) {
    const { error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })
    if (signUpError) {
      toast.error(signUpError.message)
      return
    }
    toast.success('Cuenta creada. Iniciá sesión para continuar.')
    void navigate('/login', { replace: true })
  }

  const loading = isSubmitting

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Registra un usuario para acceder al dashboard."
      icon={<IconUserPlus {...ic.headerSm} aria-hidden />}
    >
      <form className="space-y-4" onSubmit={(e) => void handleSubmit(onSubmit)(e)} noValidate>
        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="block">
          <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-lg border border-brand-border-strong bg-brand-surface py-2 pl-3 pr-10 text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 aria-invalid:border-red-400"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
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
          {errors.password ? (
            <p className="mt-1 text-xs font-medium text-red-600">{errors.password.message}</p>
          ) : null}
        </div>

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
