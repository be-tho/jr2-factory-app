import { IconUser } from '@tabler/icons-react'
import { useEffect, useRef } from 'react'
import { cn } from '../../../lib/utils'
import { useAvatarUrl } from '../hooks/useProfile'

type ProfileAvatarImageProps = {
  storagePath: string | null | undefined
  alt: string
  /** Preview local (blob URL) mientras editás en Cuenta */
  previewUrl?: string | null
  /** Raíz (debe ocupar el hueco del padre, ej. h-full w-full) */
  className?: string
  imgClassName?: string
  initials?: string
  /** Clases para el estado sin foto (ej. text-xl en avatar grande) */
  initialsClassName?: string
  iconSize?: number
}

/**
 * Avatar con signed URL de Storage; ante error (URL vencida, SW, red) vuelve a pedir la URL hasta 2 veces.
 */
export function ProfileAvatarImage({
  storagePath,
  alt,
  previewUrl,
  className,
  imgClassName,
  initials,
  initialsClassName,
  iconSize = 14,
}: ProfileAvatarImageProps) {
  const pathForQuery = previewUrl ? null : storagePath
  const { data: signedUrl, refetch } = useAvatarUrl(pathForQuery)
  const url = previewUrl ?? signedUrl ?? null
  const retries = useRef(0)

  useEffect(() => {
    retries.current = 0
  }, [storagePath, previewUrl, url])

  function handleError() {
    if (previewUrl) return
    if (retries.current >= 2) return
    retries.current += 1
    void refetch()
  }

  return (
    <div className={className}>
      {url ? (
        <img
          key={url}
          src={url}
          alt={alt}
          decoding="async"
          className={cn('h-full w-full object-cover', imgClassName)}
          onError={handleError}
        />
      ) : (
        <div
          className={cn(
            'flex h-full w-full items-center justify-center font-bold text-brand-primary',
            initialsClassName,
          )}
        >
          {initials?.trim() ? (
            initials.trim().slice(0, 2).toUpperCase()
          ) : (
            <IconUser size={iconSize} stroke={1.5} aria-hidden />
          )}
        </div>
      )}
    </div>
  )
}
