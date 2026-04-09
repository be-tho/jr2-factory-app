import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

/** Transición suave entre rutas del panel; desactiva animación si el usuario pide menos movimiento. */
export function PageTransition() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <Outlet />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
