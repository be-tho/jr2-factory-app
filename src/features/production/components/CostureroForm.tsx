import {
  IconArrowLeft,
  IconCheck,
  IconMapPin,
  IconPhone,
  IconUser,
  IconWallet,
} from '@tabler/icons-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FormField } from '../../../components/ui/FormField'
import { costureroFormSchema, type CostureroFormValues } from '../../../lib/schemas/production'
import { ic } from '../../../lib/tabler'
import type { Costurero } from '../../../types/database'
import type { CostureroInput } from '../services/costureros.service'

const selectClass =
  'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50'

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
      <header className="flex items-center gap-2 border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
        <span className="text-brand-ink-faint">{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">{title}</h2>
      </header>
      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

function costureroDefaults(initialData?: Costurero): CostureroFormValues {
  return {
    nombre_completo: initialData?.nombre_completo ?? '',
    telefono: initialData?.telefono ?? '',
    email: initialData?.email ?? '',
    direccion: initialData?.direccion ?? '',
    tipo_documento: initialData?.tipo_documento ?? 'DNI',
    numero_documento: initialData?.numero_documento ?? '',
    cbu_alias: initialData?.cbu_alias ?? '',
    notas: initialData?.notas ?? '',
    activo: initialData?.activo ?? true,
  }
}

export interface CostureroFormProps {
  mode: 'create' | 'edit'
  initialData?: Costurero
  onSubmit: (input: CostureroInput) => Promise<void>
  saving: boolean
  error: string | null
}

export function CostureroForm({ mode, initialData, onSubmit, saving, error }: CostureroFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CostureroFormValues>({
    resolver: zodResolver(costureroFormSchema),
    defaultValues: costureroDefaults(initialData),
  })

  useEffect(() => {
    reset(costureroDefaults(initialData))
  }, [initialData, reset])

  async function submitForm(values: CostureroFormValues) {
    await onSubmit({
      nombre_completo: values.nombre_completo.trim(),
      telefono: values.telefono.trim() || null,
      email: values.email.trim() || null,
      direccion: values.direccion.trim() || null,
      tipo_documento: values.tipo_documento,
      numero_documento: values.numero_documento.trim(),
      cbu_alias: values.cbu_alias.trim() || null,
      notas: values.notas.trim() || null,
      activo: values.activo,
    })
  }

  const busy = saving || isSubmitting

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary-ghost text-brand-primary">
            <IconUser {...ic.headerSm} aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#3d3b4f]">
              {mode === 'create' ? 'Nuevo costurero' : 'Editar costurero'}
            </h1>
            {mode === 'edit' && initialData && (
              <p className="mt-0.5 text-sm text-[#6e6b7b]">{initialData.nombre_completo}</p>
            )}
          </div>
        </div>
        <Link
          to="/produccion/costureros"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-[#6e6b7b] transition hover:bg-white hover:text-[#3d3b4f] hover:shadow-sm"
        >
          <IconArrowLeft size={16} stroke={1.5} aria-hidden />
          Volver al listado
        </Link>
      </div>

      <form onSubmit={(e) => void handleSubmit(submitForm)(e)} className="relative space-y-6" noValidate>
        {/* Loading overlay */}
        {saving && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/75 backdrop-blur-[2px]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-black/8">
              <svg className="h-7 w-7 animate-spin text-brand-primary" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-brand-ink">
              {mode === 'create' ? 'Creando costurero…' : 'Guardando cambios…'}
            </p>
          </div>
        )}

        {/* Datos personales */}
        <SectionCard title="Datos personales" icon={<IconUser size={14} stroke={1.5} />}>
          <div className="sm:col-span-2">
            <FormField
              label="Nombre completo *"
              placeholder="Ej: María González"
              disabled={busy}
              error={errors.nombre_completo?.message}
              {...register('nombre_completo')}
            />
          </div>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Tipo de documento *</span>
            <select className={selectClass} disabled={busy} {...register('tipo_documento')}>
              <option value="DNI">DNI</option>
              <option value="CUIL">CUIL</option>
              <option value="CUIT">CUIT</option>
            </select>
          </label>
          <FormField
            label="Número de documento *"
            placeholder="Ej: 28.456.123"
            disabled={busy}
            error={errors.numero_documento?.message}
            {...register('numero_documento')}
          />
        </SectionCard>

        {/* Contacto */}
        <SectionCard title="Contacto" icon={<IconPhone size={14} stroke={1.5} />}>
          <FormField
            label="Teléfono"
            type="tel"
            placeholder="Ej: +54 11 1234-5678"
            disabled={busy}
            {...register('telefono')}
          />
          <FormField
            label="Email"
            type="email"
            placeholder="Ej: maria@gmail.com"
            disabled={busy}
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="sm:col-span-2">
            <FormField
              label="Dirección"
              placeholder="Ej: Av. Corrientes 1234, CABA"
              disabled={busy}
              {...register('direccion')}
            />
          </div>
        </SectionCard>

        {/* Datos bancarios */}
        <SectionCard title="Datos bancarios (para pagos futuros)" icon={<IconWallet size={14} stroke={1.5} />}>
          <div className="sm:col-span-2">
            <FormField
              label="CBU o Alias"
              placeholder="Ej: maria.gonzalez o 0000003100012345678901"
              disabled={busy}
              {...register('cbu_alias')}
            />
            <p className="mt-1.5 text-xs text-brand-ink-faint">
              Se usará cuando se implemente el módulo de pagos por corte.
            </p>
          </div>
        </SectionCard>

        {/* Observaciones + Estado */}
        <section className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
          <header className="flex items-center gap-2 border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
            <span className="text-brand-ink-faint"><IconMapPin size={14} stroke={1.5} /></span>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">Observaciones y estado</h2>
          </header>
          <div className="space-y-4 px-5 py-5">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-brand-ink-muted">Notas internas</span>
              <textarea
                className="min-h-24 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50"
                placeholder="Anotaciones internas sobre el costurero, especialidades, disponibilidad…"
                disabled={busy}
                rows={3}
                {...register('notas')}
              />
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                disabled={busy}
                className="h-4 w-4 rounded border-brand-border-strong accent-brand-primary"
                {...register('activo')}
              />
              <span className="text-sm font-medium text-brand-ink-muted">Costurero activo</span>
            </label>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-medium">No se pudo guardar</p>
            <p className="mt-1 text-red-700">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            to="/produccion/costureros"
            className="inline-flex justify-center rounded-lg border border-[#e8e4f0] bg-white px-5 py-2.5 text-sm font-medium text-[#6e6b7b] transition hover:text-[#3d3b4f]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {mode === 'create' ? 'Creando…' : 'Guardando…'}
              </>
            ) : (
              <>
                <IconCheck size={15} stroke={2.5} aria-hidden />
                {mode === 'create' ? 'Crear costurero' : 'Guardar cambios'}
              </>
            )}
          </button>
        </div>
      </form>
    </>
  )
}
