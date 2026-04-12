import {
  IconAt,
  IconBriefcase,
  IconCalendar,
  IconCamera,
  IconFileText,
  IconHash,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconUser,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useId, useState } from 'react'
import { toast } from 'sonner'
import { FormField } from '../../../components/ui/FormField'
import { useSession } from '../../../hooks/useSession'
import { useProfileQuery, useUpdateProfileMutation } from '../hooks/useProfile'
import {
  getAvatarPublicUrl,
  uploadAvatar,
  validateAvatarFile,
} from '../services/profile.service'

// ── Constants ─────────────────────────────────────────────────────────────────

const CARGO_OPTIONS = [
  { value: '', label: 'Sin especificar' },
  { value: 'admin', label: 'Administración' },
  { value: 'gerente', label: 'Gerente' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'produccion', label: 'Producción' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'costurero', label: 'Costurero/a' },
  { value: 'cortador', label: 'Cortador/a' },
]

const selectClass =
  'w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 disabled:opacity-60'

// ── Sub-components ────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  value?: string | null
  mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 px-5 py-3.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f8f7fa] text-[#b9b6c3]">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">{label}</p>
        <p className={`mt-0.5 text-sm font-medium text-[#3d3b4f] ${mono ? 'break-all font-mono text-xs text-[#6e6b7b]' : 'wrap-break-word'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-52 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-black/4" />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-black/4" />
          <div className="h-40 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-black/4" />
        </div>
        <div className="h-80 animate-pulse rounded-xl bg-white shadow-sm ring-1 ring-black/4" />
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function CuentaPage() {
  const { session } = useSession()
  const user = session?.user
  const { data: profile, isPending } = useProfileQuery()
  const updateMutation = useUpdateProfileMutation()

  // Edit state
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [cargo, setCargo] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const avatarInputId = useId()

  // Sync form when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setCargo(profile.role ?? '')
      setPhone(profile.phone ?? '')
      setLocation(profile.location ?? '')
      setBio(profile.bio ?? '')
    }
  }, [profile])

  // Object URL for avatar preview
  useEffect(() => {
    if (!avatarFile) { setAvatarPreview(null); return }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  function handleCancelEdit() {
    if (profile) {
      setFullName(profile.full_name ?? '')
      setCargo(profile.role ?? '')
      setPhone(profile.phone ?? '')
      setLocation(profile.location ?? '')
      setBio(profile.bio ?? '')
    }
    setAvatarFile(null)
    setIsEditing(false)
  }

  async function handleSave() {
    if (!user?.id) return
    setSaving(true)

    let newAvatarPath = profile?.avatar_path ?? null

    if (avatarFile) {
      try {
        newAvatarPath = await uploadAvatar(user.id, avatarFile)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'No se pudo subir la imagen.')
        setSaving(false)
        return
      }
    }

    updateMutation.mutate(
      {
        full_name: fullName.trim() || null,
        role: cargo || null,
        phone: phone.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        avatar_path: newAvatarPath,
      },
      {
        onSuccess: () => {
          setAvatarFile(null)
          setIsEditing(false)
        },
        onSettled: () => setSaving(false),
      },
    )
  }

  // Derived
  const displayName =
    profile?.full_name?.trim() || user?.email?.split('@')[0] || 'Usuario'
  const cargoLabel =
    CARGO_OPTIONS.find((o) => o.value === (profile?.role ?? ''))?.label ??
    profile?.role ??
    null
  const currentAvatarUrl = profile?.avatar_path
    ? getAvatarPublicUrl(profile.avatar_path)
    : null
  const avatarUrl = avatarPreview ?? currentAvatarUrl
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
  const hasProfileData = !!(
    profile?.full_name ||
    profile?.phone ||
    profile?.location ||
    profile?.bio ||
    profile?.role
  )
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleString('es-AR', {
        month: 'long',
        year: 'numeric',
      })
    : null

  if (isPending) return <PageSkeleton />

  return (
    <div className="space-y-5">

      {/* ── Header card ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/4">
        {/* Gradient banner */}
        <div className="h-28 bg-linear-to-br from-brand-primary via-[#c07ad4] to-[#7c3aed]" />

        <div className="px-6 pb-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            {/* Avatar + info */}
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative -mt-10 shrink-0">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-brand-primary-ghost shadow-md">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-primary">
                      {initials || <IconUser size={28} stroke={1.5} />}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label
                    htmlFor={avatarInputId}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100"
                    aria-label="Cambiar foto de perfil"
                  >
                    <IconCamera size={18} className="text-white" aria-hidden />
                    <input
                      id={avatarInputId}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="sr-only"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null
                        if (!f) return
                        const err = validateAvatarFile(f)
                        if (err) { toast.error(err); return }
                        setAvatarFile(f)
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Name + meta */}
              <div className="mb-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-bold text-[#3d3b4f]">{displayName}</h1>
                  {!hasProfileData && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 ring-1 ring-amber-200">
                      Perfil incompleto
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#6e6b7b]">{user?.email}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {cargoLabel && (
                    <span className="inline-flex items-center rounded-full bg-brand-primary-ghost px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                      {cargoLabel}
                    </span>
                  )}
                  {profile?.location && (
                    <span className="flex items-center gap-1 text-xs text-[#6e6b7b]">
                      <IconMapPin size={12} stroke={1.5} aria-hidden />
                      {profile.location}
                    </span>
                  )}
                  {memberSince && (
                    <span className="flex items-center gap-1 text-xs text-[#b9b6c3]">
                      <IconCalendar size={12} stroke={1.5} aria-hidden />
                      Desde {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="flex items-center gap-2 pb-1">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover active:scale-95"
                >
                  <IconPencil size={15} stroke={1.5} aria-hidden />
                  Editar perfil
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4f0] bg-white px-4 py-2 text-sm font-medium text-[#6e6b7b] transition hover:text-[#3d3b4f]"
                >
                  <IconX size={15} stroke={1.5} aria-hidden />
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content grid ─────────────────────────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">

        {/* LEFT: About + Account ─────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* About */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
            <div className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
                Sobre mí
              </p>
            </div>
            <div className="divide-y divide-[#f0eef5]">
              <InfoRow
                icon={<IconUser size={14} stroke={1.5} />}
                label="Nombre completo"
                value={profile?.full_name}
              />
              <InfoRow
                icon={<IconBriefcase size={14} stroke={1.5} />}
                label="Cargo / Área"
                value={cargoLabel}
              />
              <InfoRow
                icon={<IconPhone size={14} stroke={1.5} />}
                label="Teléfono"
                value={profile?.phone}
              />
              <InfoRow
                icon={<IconMapPin size={14} stroke={1.5} />}
                label="Ubicación"
                value={profile?.location}
              />
              <InfoRow
                icon={<IconFileText size={14} stroke={1.5} />}
                label="Bio"
                value={profile?.bio}
              />
              {!hasProfileData && (
                <div className="px-5 py-5 text-center">
                  <p className="text-sm text-[#b9b6c3]">Aún no hay datos personales.</p>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="mt-2 text-sm font-medium text-brand-primary hover:underline"
                  >
                    Completar perfil
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Account info */}
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
            <div className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
                Cuenta
              </p>
            </div>
            <div className="divide-y divide-[#f0eef5]">
              <InfoRow
                icon={<IconAt size={14} stroke={1.5} />}
                label="Correo electrónico"
                value={user?.email}
              />
              {memberSince && (
                <InfoRow
                  icon={<IconCalendar size={14} stroke={1.5} />}
                  label="Miembro desde"
                  value={new Date(user?.created_at ?? '').toLocaleString('es-AR', {
                    dateStyle: 'long',
                  })}
                />
              )}
              <InfoRow
                icon={<IconHash size={14} stroke={1.5} />}
                label="ID de usuario"
                value={user?.id}
                mono
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Edit form or completion prompt ────────────────── */}
        <div>
          {isEditing ? (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
              <div className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
                  Editar perfil
                </p>
              </div>

              <div className="space-y-4 p-5">
                <p className="rounded-lg bg-brand-primary-ghost px-3 py-2 text-xs text-brand-primary">
                  <strong>Foto:</strong> hacé clic sobre el avatar para cambiarla.
                </p>

                <FormField
                  label="Nombre completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Juan Rodríguez"
                  disabled={saving}
                />

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-brand-ink-muted">
                    Cargo / Área
                  </span>
                  <select
                    className={selectClass}
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value)}
                    disabled={saving}
                  >
                    {CARGO_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    label="Teléfono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. +54 9 11 1234-5678"
                    disabled={saving}
                  />
                  <FormField
                    label="Ubicación"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej. Buenos Aires"
                    disabled={saving}
                  />
                </div>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-brand-ink-muted">
                    Bio / Notas
                  </span>
                  <textarea
                    className="min-h-24 w-full rounded-lg border border-brand-border-strong bg-brand-surface px-3 py-2 text-sm text-brand-ink outline-none transition placeholder:text-brand-ink-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-blush/50 disabled:opacity-60"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Breve descripción sobre vos…"
                    rows={3}
                    disabled={saving}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-[#f0eef5] px-5 py-4">
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || updateMutation.isPending}
                  className="rounded-lg bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving || updateMutation.isPending ? 'Guardando…' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center rounded-lg border border-[#e8e4f0] bg-white px-5 py-2.5 text-sm font-medium text-[#6e6b7b] transition hover:text-[#3d3b4f] disabled:opacity-60"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/4">
              <div className="border-b border-[#f0eef5] bg-[#f8f7fa] px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#b9b6c3]">
                  Estado del perfil
                </p>
              </div>
              <div className="p-5">
                {!hasProfileData ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                    <p className="font-semibold text-amber-900">Completá tu perfil</p>
                    <p className="mt-1 text-sm text-amber-800">
                      Agregá tu nombre, cargo, teléfono y foto para que el equipo
                      pueda identificarte fácilmente.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                    >
                      <IconPencil size={14} stroke={1.5} aria-hidden />
                      Completar ahora
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                      <IconUser size={26} stroke={1.5} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#3d3b4f]">Perfil completo</p>
                      <p className="mt-0.5 text-sm text-[#6e6b7b]">
                        Tus datos están guardados correctamente.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e4f0] bg-white px-4 py-2 text-sm font-medium text-[#6e6b7b] transition hover:border-brand-primary hover:text-brand-primary"
                    >
                      <IconPencil size={14} stroke={1.5} aria-hidden />
                      Actualizar datos
                    </button>
                  </div>
                )}

                {/* Stats */}
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#f0eef5] pt-4">
                  <div className="rounded-xl bg-[#f8f7fa] p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">
                      Estado
                    </p>
                    <p className="mt-1 text-sm font-bold text-emerald-600">Activo</p>
                  </div>
                  <div className="rounded-xl bg-[#f8f7fa] p-3 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#b9b6c3]">
                      Proveedor
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#3d3b4f]">
                      {session?.user.app_metadata?.provider ?? 'email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
