import { motion } from 'framer-motion'

export const PixelLoading = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-24">
        {/* Character container - moves everything together */}
        <motion.div
          animate={{
            x: [-20, 40, -20],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="relative flex items-center"
        >
          {/* Head */}
          <motion.div
            className="w-6 h-6 bg-secondary-400 rounded-sm relative"
            animate={{
              scaleX: [1, 1, -1, -1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.45, 0.5, 0.95, 1]
            }}
          >
            {/* Eyes */}
            <motion.div 
              className="absolute top-1 left-1 w-1 h-1 bg-primary-900"
              animate={{ y: [0, 0.5, 0] }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div 
              className="absolute top-1 right-1 w-1 h-1 bg-primary-900"
              animate={{ y: [0, 0.5, 0] }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                ease: "linear",
                delay: 0.15
              }}
            />
            {/* Smile */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-primary-900 rounded-sm" />

            {/* Shadow */}
            <motion.div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/20 rounded-full"
              animate={{
                scaleX: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>

          {/* Body (Loading dots) */}
          <div className="flex gap-0.5 ml-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-secondary-400 rounded-sm"
                animate={{
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 