'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Menu, X, ChevronDown, Globe, Shield, Code, Cpu, Zap, Binary, Blocks } from 'lucide-react';
import CustomCursor from '@/components/CustomCursor';

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
};

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
};

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
};

const glowingBorderVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 10px rgba(147, 51, 234, 0.5)',
      '0 0 20px rgba(147, 51, 234, 0.7)',
      '0 0 30px rgba(147, 51, 234, 0.5)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
};

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, -100]);
  const rotation = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <CustomCursor />
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-900/20 to-black text-white overflow-hidden">
        <div
          className="fixed inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.2) 0%, transparent 60%)`,
            transition: 'background-position 0.3s',
          }}
        />

        <motion.div
          ref={heroRef}
          className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20"
          style={{ opacity, scale, y }}
          variants={heroVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"
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
              className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full filter blur-3xl"
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
              className="absolute top-1/2 right-1/3 w-40 h-40 bg-pink-500/20 rounded-full filter blur-3xl"
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
            { Icon: Globe, color: 'purple', position: 'top-1/4 left-1/5' },
            { Icon: Shield, color: 'cyan', position: 'bottom-1/3 right-1/4' },
            { Icon: Blocks, color: 'pink', position: 'top-1/2 right-1/3' },
            { Icon: Binary, color: 'yellow', position: 'bottom-1/4 left-1/3' },
            { Icon: Zap, color: 'green', position: 'top-1/3 right-1/5' },
          ].map(({ Icon, color, position }, index) => (
            <motion.div
              key={index}
              className={`absolute ${position} text-${color}-400`}
              variants={floatingIconsVariants}
              animate="animate"
              transition={{ delay: index * 0.3 }}
              style={{
                filter: 'drop-shadow(0 0 10px currentColor)',
              }}
            >
              <Icon size={32} />
            </motion.div>
          ))}

          <div className="max-w-5xl mx-auto text-center z-10 relative">
            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400"
              variants={itemVariants}
              style={{
                textShadow: '0 0 20px rgba(147, 51, 234, 0.5)',
              }}
            >
              Connect, protect, and build everywhere
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              We make websites, apps, and networks faster and more secure. Our developer platform is the best place to build modern apps and deliver AI initiatives.
            </motion.p>

            <motion.div
              className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 justify-center"
              variants={itemVariants}
            >
              <motion.button
                className="bg-gradient-to-r from-purple-500 to-cyan-500 px-8 py-4 rounded-full text-lg font-medium relative overflow-hidden"
                whileHover={{
                  scale: 1.05,
                  textShadow: '0 0 8px rgb(255,255,255)',
                  boxShadow: '0 0 15px rgb(147,51,234)',
                }}
                whileTap={{ scale: 0.95 }}
                variants={glowingBorderVariants}
                animate="animate"
              >
                <span className="relative z-10">Start Building</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600"
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                />
              </motion.button>

              <motion.button
                className="bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full text-lg font-medium"
                whileHover={{
                  scale: 1.05,
                  textShadow: '0 0 8px rgb(255,255,255)',
                  boxShadow: '0 0 15px rgba(255,255,255,0.3)',
                }}
                whileTap={{ scale: 0.95 }}
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

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-16 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              The future of{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
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
                    boxShadow: '0 10px 30px -10px rgba(138, 75, 255, 0.2)',
                  }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}