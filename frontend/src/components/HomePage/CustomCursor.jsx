'use client'

import { motion, useMotionValue, useSpring } from 'framer-motion'
import { Code, Cloud, Server, Terminal } from 'lucide-react'
import { useEffect, useState, useCallback, memo } from 'react'

const icons = [
  { Icon: Code, color: 'text-blue-500' },
  { Icon: Cloud, color: 'text-cyan-500' },
  { Icon: Server, color: 'text-purple-500' },
  { Icon: Terminal, color: 'text-green-500' },
]

const CustomCursor = memo(() => {
  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const springX = useSpring(cursorX, { stiffness: 200, damping: 20, mass: 0.1 })
  const springY = useSpring(cursorY, { stiffness: 200, damping: 20, mass: 0.1 })
  const [isHovering, setIsHovering] = useState(false)
  const [iconIndex, setIconIndex] = useState(0)

  const moveCursor = useCallback(
    (e) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    },
    [cursorX, cursorY],
  )

  const handleMouseEnter = useCallback(() => setIsHovering(true), [])
  const handleMouseLeave = useCallback(() => setIsHovering(false), [])

  useEffect(() => {
    if (typeof window === 'undefined' || 'ontouchstart' in window) return

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseenter', handleMouseEnter)
    window.addEventListener('mouseleave', handleMouseLeave)

    const iconInterval = setInterval(() => {
      setIconIndex((prev) => (prev + 1) % icons.length)
    }, 2000)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mouseenter', handleMouseEnter)
      window.removeEventListener('mouseleave', handleMouseLeave)
      clearInterval(iconInterval)
    }
  }, [moveCursor, handleMouseEnter, handleMouseLeave])

  const CurrentIcon = icons[iconIndex].Icon
  const iconColor = icons[iconIndex].color

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-full pointer-events-none hidden md:block"
      style={{
        x: springX,
        y: springY,
      }}
    >
      <motion.div
        className={`absolute ${iconColor}`}
        style={{
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          rotate: [0, 360],
        }}
        transition={{
          scale: {
            type: 'spring',
            stiffness: 400,
            damping: 15,
            mass: 0.1,
          },
          rotate: {
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          },
        }}
      >
        <CurrentIcon size={24} />
      </motion.div>

      <motion.div
        className="absolute w-8 h-8 border-2 border-current rounded-full"
        style={{
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: isHovering ? 1.2 : 1,
          opacity: isHovering ? 1 : 0.8,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 15,
          mass: 0.1,
        }}
      />

      <motion.div
        className="absolute w-20 h-20 rounded-full"
        style={{
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 0.5 : 0.3,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 15,
          mass: 0.1,
        }}
      />
    </motion.div>
  )
})

CustomCursor.displayName = 'CustomCursor'

export default CustomCursor
