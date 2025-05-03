'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, Variants } from 'framer-motion'
import {
  ChevronDown,
  Globe,
  Shield,
  Code,
  Zap,
  FolderLock,
  Blocks,
} from 'lucide-react'
import * as THREE from 'three'
import CustomCursor from '@/components/HomePage/CustomCursor'
import LogoCarousel from '@/components/HomePage/LogoCarousel'
import { Helmet } from 'react-helmet'

const floatingIconsVariants: Variants = {
  animate: {
    y: [0, -20, 0],
    scale: [1, 1.2, 1],
    rotate: [0, 180, 360],
    filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'reverse' as const,
      ease: 'easeInOut',
    },
  },
}

const heroVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    rotateX: 45,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 20,
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

const itemVariants: Variants = {
  hidden: {
    y: 50,
    opacity: 0,
    rotateX: -45,
    scale: 0.8,
  },
  visible: {
    y: 0,
    opacity: 1,
    rotateX: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
      duration: 1,
    },
  },
}

const glowingBorderVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 10px var(--tw-color-secondary-500, #97f0e5, 0.5)',
      '0 0 20px var(--tw-color-secondary-500, #97f0e5, 0.7)',
      '0 0 30px var(--tw-color-secondary-500, #97f0e5, 0.5)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

const GRID_SIZE = 15
const GRID_COLOR = 'rgba(59, 130, 246, 0.05)' // Single static color

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
    },
  },
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { scrollYProgress } = useScroll()

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100])

  useEffect(() => {
    if (!canvasRef.current) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    })
    renderer.setSize(window.innerWidth, window.innerHeight)

    const particlesGeometry = new THREE.BufferGeometry()
    const particleCount = 1000
    const posArray = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3),
    )
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    camera.position.z = 5

    const animate = () => {
      requestAnimationFrame(animate)
      particlesMesh.rotation.y += 0.001
      particlesMesh.rotation.x += 0.0005
      const positions = particlesGeometry.attributes.position
        .array as Float32Array
      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i + 1] += Math.sin(Date.now() * 0.001 + positions[i]) * 0.001
      }
      particlesGeometry.attributes.position.needsUpdate = true
      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Home | Ivory</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <CustomCursor />
      <div className="min-h-screen bg-gradient-to-b from-black via-primary-900/20 to-black text-white overflow-hidden relative">
        {/* Grid Background */}
        <motion.div
          className="fixed inset-0 z-0 grid"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
        >
          {Array(GRID_SIZE)
            .fill(0)
            .map((_, y) =>
              Array(GRID_SIZE)
                .fill(0)
                .map((_, x) => (
                  <motion.div
                    key={`${x}-${y}`}
                    className="relative"
                    variants={cellVariants}
                    style={{
                      transform: 'translateZ(0)',
                      willChange: 'transform',
                    }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: GRID_COLOR,
                        border: '1px solid rgba(59, 130, 246, 0.05)',
                        transform: 'translateZ(0)',
                        willChange: 'background-color',
                      }}
                    />
                  </motion.div>
                )),
            )}
        </motion.div>

        <canvas
          ref={canvasRef}
          className="fixed inset-0 z-0 opacity-30 pointer-events-none"
        />
        <div
          className="fixed inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at center, rgba(59, 130, 246, 0.2) 0%, transparent 60%), url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g opacity="0.2" filter="url(#glow)"><line x1="0" y1="50" x2="100" y2="50" stroke="rgba(59, 130, 246, 0.5)" stroke-width="0.5"/><line x1="50" y1="0" x2="50" y2="100" stroke="rgba(59, 130, 246, 0.5)" stroke-width="0.5"/></g></svg>')`,
            backgroundSize: '100px 100px',
            backgroundPosition: 'center',
            animation: 'gridPulse 10s infinite linear',
          }}
        />

        <motion.div
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 z-10"
          style={{ opacity, scale, y }}
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-secondary-500/20 rounded-full filter blur-3xl"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-secondary-500/20 rounded-full filter blur-3xl"
              animate={{
                scale: [1.2, 0.8, 1.2],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute top-1/2 right-1/3 w-40 h-40 bg-secondary-500/20 rounded-full filter blur-3xl"
              animate={{
                scale: [0.8, 1.3, 0.8],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: 1,
              }}
            />
          </div>

          {[
            { 
              Icon: Globe, 
              color: 'purple', 
              position: 'top-1/4 left-1/5'
            },
            { 
              Icon: Shield, 
              color: 'cyan', 
              position: 'bottom-1/3 right-1/4'
            },
            { 
              Icon: Blocks, 
              color: 'pink', 
              position: 'top-1/2 right-1/3'
            },
            {
              Icon: FolderLock,
              color: 'yellow',
              position: 'bottom-1/4 left-1/3'
            },
            { 
              Icon: Zap, 
              color: 'green', 
              position: 'top-1/3 right-1/5'
            },
          ].map(({ Icon, color, position }, index) => (
            <motion.div
              key={index}
              className={`absolute ${position}`}
              variants={floatingIconsVariants}
              animate="animate"
              transition={{ delay: index * 0.3 }}
            >
              <motion.div
                className={`text-${color}-400`}
                style={{
                  filter: 'drop-shadow(0 0 10px currentColor)',
                }}
                whileHover={{
                  scale: 1.2,
                  filter: 'drop-shadow(0 0 20px currentColor) brightness(1.5)',
                }}
              >
                <Icon size={32} />
              </motion.div>
            </motion.div>
          ))}

          <div className="max-w-5xl mx-auto text-center z-10 relative">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
              variants={itemVariants}
              style={{
                textShadow: '0 0 20px var(--tw-color-secondary-500, #97f0e5, 0.5)',
                fontFamily: "'Pixelify Sans', sans-serif",
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
              }}
            >
              {['Connect', 'Protect', 'and', 'Build'].map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block">
                  {word.split('').map((char, charIndex) => (
                    <motion.span
                      key={`${wordIndex}-${charIndex}`}
                      className="inline-block cursor-pointer bg-clip-text text-transparent bg-gradient-to-r from-secondary-400 to-secondary-600"
                      whileHover={{
                        y: [0, -30, 0, -15, 0],
                        scale: [1, 1.1, 1],
                        transition: {
                          duration: 0.6,
                          times: [0, 0.2, 0.4, 0.6, 1],
                          ease: "easeInOut"
                        }
                      }}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {wordIndex < 3 && <span className="inline-block w-4" />}
                </span>
              ))}
              <span className="inline-block w-4" />
              <motion.span 
                className="text-white inline-block"
              >
                {'everywhere'.split('').map((char, index) => (
                  <motion.span
                    key={index}
                    className="inline-block cursor-pointer relative"
                    initial={{ y: 0 }}
                    whileHover={{
                      y: [0, -30, 0, -15, 0],
                      scale: [1, 1.1, 1],
                      transition: {
                        duration: 0.6,
                        times: [0, 0.2, 0.4, 0.6, 1],
                        ease: "easeInOut"
                      }
                    }}
                    style={{
                      transformOrigin: "bottom center"
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
              variants={itemVariants}
              style={{
                fontFamily: "'Pixelify Sans', sans-serif",
                fontWeight: 400,
                lineHeight: '1.6',
                letterSpacing: '0.02em',
              }}
            >
              We make websites, apps, and networks faster and more secure. Our
              developer platform is the best place to build modern apps and
              deliver AI initiatives.
            </motion.p>

            <motion.div
              className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                className="font-pixel bg-gradient-to-r from-secondary-500 to-secondary-600 px-8 py-4 rounded-full text-lg font-medium relative overflow-hidden group"
                whileHover={{
                  scale: 1.05,
                  textShadow: '0 0 8px rgb(255,255,255)',
                  boxShadow: '0 0 30px var(--tw-color-secondary-500, #97f0e5, 0.7)',
                  filter: 'brightness(1.2)',
                }}
                whileTap={{ scale: 0.95 }}
                variants={glowingBorderVariants}
                animate="animate"
                style={{
                  letterSpacing: '0.05em',
                }}
              >
                <span className="relative z-10">Start Building</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-secondary-600 to-secondary-700"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-secondary-500/20 to-secondary-600/20 blur-xl"
                  whileHover={{
                    scale: 1.2,
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              </motion.button>

              <motion.button
                className="font-pixel bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full text-lg font-medium"
                whileHover={{
                  scale: 1.05,
                  textShadow: '0 0 8px rgb(255,255,255)',
                  boxShadow: '0 0 15px rgba(255,255,255,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  letterSpacing: '0.05em',
                }}
              >
                Explore Docs
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            animate={{
              y: [0, 10, 0],
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <ChevronDown className="text-gray-400 w-8 h-8" />
          </motion.div>
        </motion.div>
        <LogoCarousel />
        <section className="py-20 px-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              style={{
                fontFamily: "'Pixelify Sans', sans-serif",
                letterSpacing: '-0.02em',
                lineHeight: '1.2',
              }}
            >
              The future of{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-400 to-secondary-600">
                Web3
              </span>{' '}
              development
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Globe className="w-10 h-10 text-purple-400" />,
                  title: 'Global Network',
                  description:
                    'Deploy your applications on our global edge network for maximum performance and reliability.',
                },
                {
                  icon: <Shield className="w-10 h-10 text-cyan-400" />,
                  title: 'Enhanced Security',
                  description:
                    'Protect your applications with advanced security features and DDoS protection.',
                },
                {
                  icon: <Code className="w-10 h-10 text-pink-400" />,
                  title: 'Developer Experience',
                  description:
                    'Build and deploy with ease using our intuitive developer tools and workflows.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{
                    y: -5,
                    boxShadow: '0 10px 30px -10px rgba(239, 68, 68, 0.2)',
                  }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{
                      fontFamily: "'Pixelify Sans', sans-serif",
                      letterSpacing: '-0.02em',
                      lineHeight: '1.2',
                    }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-gray-400"
                    style={{
                      fontFamily: "'Pixelify Sans', sans-serif",
                      fontWeight: 400,
                      lineHeight: '1.6',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
