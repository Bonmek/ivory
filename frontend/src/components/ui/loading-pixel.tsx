import { motion } from 'framer-motion'

export const PixelLoading = () => {
  return (
    <div className="flex items-center justify-center mb-5">
      <div className="relative w-24">
        {/* Rocket container - moves everything together */}
        <motion.div
          animate={{
            x: [-20, 20, -20],
            y: [0, -3, 0]
          }}
          transition={{
            x: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            },
            y: {
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="relative flex items-center"
        >
          {/* Rocket body */}
          <motion.div
            className="relative"
            animate={{
              rotate: [0, -5, 0, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {/* Main body */}
            <div className="w-8 h-12 bg-secondary-400 rounded-t-full relative">
              {/* Window */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-900 rounded-full border-2 border-secondary-500">
                <motion.div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-300 rounded-full"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* Wings */}
              <div className="absolute -left-2 top-6 w-2 h-6 bg-secondary-500 rounded-l-lg" />
              <div className="absolute -right-2 top-6 w-2 h-6 bg-secondary-500 rounded-r-lg" />
              
              {/* Flame */}
              <motion.div
                className="absolute -bottom-6 left-1/2 -translate-x-1/2"
                animate={{
                  scaleY: [1, 1.2, 1],
                  scaleX: [1, 1.1, 1]
                }}
                transition={{
                  duration: 0.3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-4 h-6 bg-gradient-to-b from-orange-500 via-yellow-400 to-transparent rounded-b-full" />
              </motion.div>
            </div>
          </motion.div>

          {/* Loading dots */}
          <div className="flex gap-0.5 ml-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 bg-secondary-400 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
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

        {/* Stars in background */}
        <div className="absolute inset-0 -z-10">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-secondary-400 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 