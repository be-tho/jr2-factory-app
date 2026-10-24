import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

/** Transición suave entre rutas del panel; desactiva animación si el usuario pide menos movimiento. */
export function PageTransition() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia('(max-width: 639px)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 639px)')
    const updateViewport = () => setIsMobile(mediaQuery.matches)
    mediaQuery.addEventListener('change', updateViewport)
    return () => mediaQuery.removeEventListener('change', updateViewport)
  }, [])

  if (reduceMotion) {
    return <Outlet />
  }

  const enterMotion = isMobile ? { opacity: 0, x: 16 } : { opacity: 0, y: 6 }
  const exitMotion = isMobile ? { opacity: 0, x: -12 } : { opacity: 0, y: -4 }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={enterMotion}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={exitMotion}
        transition={{ duration: isMobile ? 0.24 : 0.16, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: 'opacity, transform' }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
