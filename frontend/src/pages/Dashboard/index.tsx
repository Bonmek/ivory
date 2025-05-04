'use client'

import { useState, useRef, useEffect } from 'react'
import {
  CalendarIcon,
  ExternalLink,
  Filter,
  Search,
  MoreHorizontal,
  RefreshCw,
  Trash,
  Users,
  Blocks,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion'
import * as THREE from 'three'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Sample data - replace with your actual data source
const projects = [
  {
    id: 1,
    name: 'E-commerce Website',
    url: 'ecommerce.wal.app',
    startDate: new Date(2023, 5, 15),
    expiredDate: new Date(2024, 5, 15),
    color: '#97f0e5',
    urlImg: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg',
  },
  {
    id: 2,
    name: 'Portfolio Site',
    url: 'portfolio.wal.app',
    startDate: new Date(2023, 7, 10),
    expiredDate: new Date(2024, 7, 10),
    color: '#97f0e5',
    urlImg: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg',
  },
  {
    id: 3,
    name: 'Blog Platform',
    url: 'blog.wal.app',
    startDate: new Date(2023, 9, 5),
    expiredDate: new Date(2024, 9, 5),
    color: '#97f0e5',
    urlImg: 'https://images.pexels.com/photos/34950/pexels-photo.jpg',
  },
  {
    id: 4,
    name: 'Corporate Website',
    url: 'corporate.wal.app',
    startDate: new Date(2023, 10, 20),
    expiredDate: new Date(2024, 10, 20),
    color: '#FFCCCC',
    urlImg: 'https://images.pexels.com/photos/2102416/pexels-photo-2102416.jpeg',
  },
  {
    id: 5,
    name: 'Mobile App Landing',
    url: 'app-landing.wal.app',
    startDate: new Date(2023, 11, 1),
    expiredDate: new Date(2024, 11, 1),
    color: '#FFCCFF',
    urlImg: 'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg',
  },
  {
    id: 6,
    name: 'SaaS Dashboard',
    url: 'saas.wal.app',
    startDate: new Date(2024, 0, 15),
    expiredDate: new Date(2025, 0, 15),
    color: '#CCFFFF',
    urlImg: 'https://images.pexels.com/photos/459225/pexels-photo-459225.jpeg',
  },
]

// Enhanced ThreeJS Background Component with beautiful effects
const ThreeJSBackground = () => {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    )
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement)
    }

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry()
    const particlesCount = 1000
    const posArray = new Float32Array(particlesCount * 3)

    for (let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 30
    }

    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(posArray, 3),
    )

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x97f0e5, // Secondary color
      transparent: true,
      opacity: 0.6,
    })

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial)
    scene.add(particlesMesh)

    camera.position.z = 15

    // Animation
    const animate = () => {
      requestAnimationFrame(animate)
      particlesMesh.rotation.y += 0.001
      particlesMesh.rotation.x += 0.0005
      renderer.render(scene, camera)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="fixed inset-0 -z-10" />
}

// Card animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.5,
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  }),
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeInOut',
    },
  },
  hover: {
    y: -5,
    boxShadow: '0 10px 30px -10px rgba(151, 240, 229, 0.4)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
}

// Tab indicator animation
const tabVariants = {
  inactive: { scale: 0.95, opacity: 0.7 },
  active: { scale: 1, opacity: 1 },
}

// Helper function to format date
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

// Helper function to calculate days between dates
const calculateDaysBetween = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [sortType, setSortType] = useState('latest')
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  // Calculate remaining days
  const calculateRemaining = (expiredDate: Date) => {
    return calculateDaysBetween(new Date(), expiredDate)
  }

  // Filter projects based on search query, date, and tab
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.url.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate =
      !date ||
      formatDate(project.startDate) === formatDate(date) ||
      formatDate(project.expiredDate) === formatDate(date)

    const remaining = calculateRemaining(project.expiredDate)
    const status = remaining <= 30 ? 'expiring-soon' : 'active'

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'expiring' && remaining <= 30) ||
      (activeTab === 'recent' &&
        calculateDaysBetween(new Date(), project.startDate) <= 30)

    return matchesSearch && matchesDate && matchesTab
  })

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortType === 'latest') {
      return b.startDate.getTime() - a.startDate.getTime()
    }
    if (sortType === 'name-az') {
      return a.name.localeCompare(b.name)
    }
    if (sortType === 'name-za') {
      return b.name.localeCompare(a.name)
    }
    if (sortType === 'remaining-low') {
      return calculateRemaining(a.expiredDate) - calculateRemaining(b.expiredDate)
    }
    if (sortType === 'remaining-high') {
      return calculateRemaining(b.expiredDate) - calculateRemaining(a.expiredDate)
    }
    return 0
  })

  const sortTypeLabel = {
    latest: 'Latest',
    'name-az': 'Name A-Z',
    'name-za': 'Name Z-A',
    'remaining-low': 'Remaining Days: low to high',
    'remaining-high': 'Remaining Days: high to low',
  }[sortType]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-primary-900/20 to-black relative overflow-hidden">
      <ThreeJSBackground />

      <div className="mt-20 container mx-auto py-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8"
        >
          <motion.h1
            className="text-3xl font-bold text-white font-pixel"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
          >
            Dashboard
          </motion.h1>
          <motion.div
            className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.5,
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 z-10 pointer-events-none" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="w-full pl-10 md:w-[250px] bg-primary-900/80 border-secondary-500/20 text-white placeholder:text-secondary-400 backdrop-blur-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </motion.div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    variant="outline"
                    className={`
                      w-full md:w-auto flex items-center gap-2
                      bg-primary-900/80 border-secondary-500/20 text-white
                      hover:bg-secondary-500/10 hover:text-secondary-500
                      transition-all duration-150
                      ${sortType !== 'latest' ? 'border-secondary-500 text-secondary-500' : ''}
                    `}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="font-semibold">{sortTypeLabel}</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm min-w-[220px]">
                <DropdownMenuItem onClick={() => setSortType('latest')} className={sortType === 'latest' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}>
                  Latest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortType('name-az')} className={sortType === 'name-az' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}>
                  Name A-Z
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortType('name-za')} className={sortType === 'name-za' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}>
                  Name Z-A
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortType('remaining-low')} className={sortType === 'remaining-low' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}>
                  Remaining Days: low to high
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortType('remaining-high')} className={sortType === 'remaining-high' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}>
                  Remaining Days: high to low
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {(date || searchQuery) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery('')
                    setDate(undefined)
                  }}
                  className="text-secondary-300 hover:text-white hover:bg-primary-800/50"
                >
                  Clear Filters
                </Button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.4,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          className="mb-6"
        >
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 md:w-[400px] bg-primary-900/80 backdrop-blur-sm relative">
              <TabsTrigger
                value="all"
                className="relative z-10 data-[state=active]:text-secondary-500"
              >
                {activeTab === 'all' && (
                  <motion.div
                    className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                    layoutId="tab-background"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.span
                  variants={tabVariants}
                  animate={activeTab === 'all' ? 'active' : 'inactive'}
                  transition={{ duration: 0.2 }}
                >
                  All Sites
                </motion.span>
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="relative z-10 data-[state=active]:text-secondary-500"
              >
                {activeTab === 'recent' && (
                  <motion.div
                    className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                    layoutId="tab-background"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.span
                  variants={tabVariants}
                  animate={activeTab === 'recent' ? 'active' : 'inactive'}
                  transition={{ duration: 0.2 }}
                >
                  Recently Added
                </motion.span>
              </TabsTrigger>
              <TabsTrigger
                value="expiring"
                className="relative z-10 data-[state=active]:text-secondary-500"
              >
                {activeTab === 'expiring' && (
                  <motion.div
                    className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                    layoutId="tab-background"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <motion.span
                  variants={tabVariants}
                  animate={activeTab === 'expiring' ? 'active' : 'inactive'}
                  transition={{ duration: 0.2 }}
                >
                  Expiring Soon
                </motion.span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {sortedProjects.map((project, index) => {
              const remainingDays = calculateRemaining(project.expiredDate)
              const isHovered = hoveredCard === project.id

              return (
                <motion.div
                  key={project.id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover="hover"
                  layout
                  onHoverStart={() => setHoveredCard(project.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="rounded-lg overflow-hidden relative h-full"
                >
                  <Card className="flex flex-row items-center p-4 sm:p-6 bg-primary-900/80 border-secondary-500/20 shadow-lg backdrop-blur-sm h-full min-h-[180px] relative">
                    {/* Dropdown Menu: Top Right */}
                    <div className="absolute top-4 right-4 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-10 w-10 flex items-center justify-center rounded-full text-secondary-300 hover:text-white hover:bg-primary-800/50 transition">
                            <MoreHorizontal className="h-6 w-6" />
                            <span className="sr-only">Open menu</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm">
                          <DropdownMenuItem className="focus:bg-primary-800">
                            <Users className="mr-2 h-4 w-4" />
                            <span>Transfer ownership</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-primary-800">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <span>Extend site</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="focus:bg-primary-800">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Update site</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-secondary-500/20" />
                          <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-primary-800">
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Delete site</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {/* Left: Project Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={project.urlImg}
                        alt="project avatar"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20 shadow"
                      />
                    </div>
                    {/* Middle: Project Info */}
                    <div className=" flex flex-col flex-1 min-w-0">
                      {/* Project Name */}
                      <div className="font-bold text-lg text-yellow-400 mb-1 truncate">{project.name}</div>
                      {/* Project Link */}
                      <div className="flex items-center text-base text-white/80 mb-4">
                        <a href={`https://${project.url}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline truncate">
                          {project.url}
                          <ExternalLink className="ml-1 h-4 w-4 flex-shrink-0" />
                        </a>
                      </div>
                      {/* Dates Row */}
                      <div className="flex flex-row w-full gap-x-4 sm:gap-x-8 mt-auto min-h-[56px]">
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="text-[11px] text-white/50 font-medium truncate">Start date</div>
                          <div className="text-base text-white font-semibold mt-1 truncate">{formatDate(project.startDate)}</div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-4">
                          <div className="text-[11px] text-white/50 font-medium truncate">Expired date</div>
                          <div className="text-base text-white font-semibold mt-1 truncate">{formatDate(project.expiredDate)}</div>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-4">
                          <div className="text-[11px] text-white/50 font-medium truncate">Remaining</div>
                          <div className="text-base text-yellow-300 font-bold mt-1 truncate">{calculateRemaining(project.expiredDate)} days</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>

        {sortedProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center rounded-lg border border-secondary-500/20 border-dashed p-8 text-center mt-8 bg-primary-900/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              <Blocks className="h-12 w-12 text-secondary-400 mb-4" />
            </motion.div>
            <motion.h3
              className="mt-2 text-lg font-semibold text-white"
              animate={{
                textShadow: [
                  '0 0 0px rgba(255, 255, 255, 0)',
                  '0 0 10px rgba(255, 255, 255, 0.5)',
                  '0 0 0px rgba(255, 255, 255, 0)',
                ],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            >
              No projects found
            </motion.h3>
            <p className="mb-4 mt-1 text-sm text-secondary-300">
              Try adjusting your search or filter criteria
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => {
                  setSearchQuery('')
                  setDate(undefined)
                  setActiveTab('all')
                }}
                className="bg-secondary-500 hover:bg-secondary-600 text-primary-900"
              >
                Reset Filters
              </Button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
