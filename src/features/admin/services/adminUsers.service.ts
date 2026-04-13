import { supabase } from '../../../lib/supabase/client'
import type { Profile } from '../../../types/database'

export async function getAllUsers() {
  return supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
}

export async function updateUserRole(userId: string, role: string | null) {
  return supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .maybeSingle<Profile>()
}

export async function setUserActive(userId: string, is_active: boolean) {
  return supabase
    .from('profiles')
    .update({ is_active })
    .eq('id', userId)
    .select()
    .maybeSingle<Profile>()
}
