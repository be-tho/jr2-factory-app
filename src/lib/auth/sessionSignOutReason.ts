const STORAGE_KEY = 'jr2_auth_signout_reason'

export type SessionSignOutReason = 'manual' | 'inactive' | 'idle'

/** Marca el próximo SIGNED_OUT como intencional para no mostrar el aviso de “sesión en otro lugar”. */
export function markSessionSignOutReason(reason: SessionSignOutReason): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, reason)
  } catch {
    // modo privado / storage bloqueado
  }
}

/** Lee y borra la razón; devuelve null si no había marca. */
export function consumeSessionSignOutReason(): SessionSignOutReason | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    sessionStorage.removeItem(STORAGE_KEY)
    if (raw === 'manual' || raw === 'inactive' || raw === 'idle') {
      return raw
    }
    return null
  } catch {
    return null
  }
}
