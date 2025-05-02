import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useEffect } from 'react'

export default function CustomCursor() {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 100, damping: 20 })
  const springY = useSpring(cursorY, { stiffness: 100, damping: 20 })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const moveCursor = (e) => {
      cursorX.set(e.clientX - 8)
      cursorY.set(e.clientY - 8)
    }

    window.addEventListener('mousemove', moveCursor)
    return () => window.removeEventListener('mousemove', moveCursor)
  }, [cursorX, cursorY])

  return (
    <motion.div
      style={{
        width: 12,
        height: 12,
        borderRadius: '50%',
        backgroundColor: 'white',
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 9999,
        x: springX,
        y: springY,
      }}
      transition={{ duration: 0.2 }}
    />
  )
}
