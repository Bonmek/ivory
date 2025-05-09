"use client"

import { motion } from "framer-motion"
import styles from './Loading.module.css'

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

const LoadingText = () => {
  const letters = "LOADING".split("")
  
  return (
    <div className="flex space-x-1 mt-4">
      {letters.map((letter, index) => (
        <motion.span
          key={index}
          className="font-pixel text-white text-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 1.5,
            repeatType: "reverse"
          }}
        >
          {letter}
        </motion.span>
      ))}
    </div>
  )
}

const Spinner = () => (
  <div className={styles.spinner}>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
)

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
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
      <div className="relative z-10 flex flex-col items-center">
        <Spinner />
        <LoadingText/>
      </div>
    </div>
  )
}
