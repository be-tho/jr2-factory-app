import type { AppRole } from '../../types/database'
import { supabase } from '../supabase/client'

export const INVENTORY_WRITE_ALLOWED_ROLES: readonly AppRole[] = ['admin', 'gerente']

export async function getCurrentProfileRole(): Promise<AppRole | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return null
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: AppRole | null }>()

  if (profileError || !profile) {
    return null
  }

  return profile.role
}

export async function assertInventoryWriteAccess(): Promise<void> {
  const role = await getCurrentProfileRole()

  if (!role || !INVENTORY_WRITE_ALLOWED_ROLES.includes(role)) {
    throw new Error(
      'No tenés permisos para crear, editar o eliminar artículos. Este acceso está reservado para Admin y Gerente.'
    )
  }
}
