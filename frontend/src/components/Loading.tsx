"use client"

import { motion } from "framer-motion"

// Snowflake SVG component
const Snowflake = ({ delay = 0, size = 20, x = 0 }) => (
  <motion.div
    initial={{ y: -100, x, opacity: 0, rotate: 0 }}
    animate={{
      y: 100,
      opacity: [0, 1, 1, 0],
      rotate: 360,
      scale: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 2.5,
      delay,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "loop",
      ease: "easeInOut",
      times: [0, 0.2, 0.8, 1],
    }}
    className="absolute"
    style={{ width: size, height: size }}
  >
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3V21M12 3L8 7M12 3L16 7M12 21L8 17M12 21L16 17M3 12H21M3 12L7 8M3 12L7 16M21 12L17 8M21 12L17 16"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </motion.div>
)

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364] overflow-hidden">
      {/* Snowflakes */}
      {[...Array(20)].map((_, i) => (
        <Snowflake
          key={i}
          delay={i * 0.1}
          size={Math.random() * 15 + 10}
          x={(Math.random() - 0.5) * window.innerWidth * 0.8}
        />
      ))}

      {/* Loading spinner */}
      <div className="relative z-10">
        <motion.div
          className="h-16 w-16 border-3 border-[#38ef7d] border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Pulsing glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-[#38ef7d]"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{ filter: "blur(8px)" }}
        />

        {/* Loading text */}
        <motion.p
          className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading...
        </motion.p>
      </div>
    </div>
  )
}
