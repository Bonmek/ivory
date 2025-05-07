'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeJSBackground from '@/components/ThreeJsBackground'
import ProjectCard from '@/components/Dashboard/ProjectCard'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import DashboardTabs from '@/components/Dashboard/DashboardTabs'
import EmptyState from '@/components/Dashboard/EmptyState'
import { Helmet } from 'react-helmet'

// Sample data - replace with your actual data source
const projects = [
  {
    id: 1,
    name: 'E-commerce Website',
    url: 'ecommerce.wal.app',
    startDate: new Date(2023, 5, 15),
    expiredDate: new Date(2024, 5, 15),
    color: '#97f0e5',
    urlImg:
      'https://i.pinimg.com/originals/8d/33/da/8d33da6e29c1108b834c176483e376b9.gif',
  },
  {
    id: 2,
    name: 'Portfolio Site',
    url: 'portfolio.wal.app',
    startDate: new Date(2023, 7, 10),
    expiredDate: new Date(2024, 7, 10),
    color: '#97f0e5',
    urlImg:
      'https://i.pinimg.com/736x/ba/10/29/ba1029e64ee8e2e4fdf94192fb7a26d0.jpg',
  },
  {
    id: 3,
    name: 'Blog Platform',
    url: 'blog.wal.app',
    startDate: new Date(2023, 9, 5),
    expiredDate: new Date(2024, 9, 5),
    color: '#97f0e5',
    urlImg:
      'https://i.pinimg.com/736x/6c/2e/62/6c2e62530a7a063da7bb33cd4f9db066.jpg',
  },
  {
    id: 4,
    name: 'Corporate Website',
    url: 'corporate.wal.app',
    startDate: new Date(2023, 10, 20),
    expiredDate: new Date(2024, 10, 20),
    color: '#FFCCCC',
    urlImg:
      'https://i.pinimg.com/736x/57/38/bf/5738bfa4aac857c3da147999a0f2022f.jpg',
  },
  {
    id: 5,
    name: 'Mobile App Landing',
    url: 'app-landing.wal.app',
    startDate: new Date(2023, 11, 1),
    expiredDate: new Date(2024, 11, 1),
    color: '#FFCCFF',
    urlImg:
      'https://i.pinimg.com/736x/1a/ad/76/1aad761232cf0897a3cc5cd5bc515740.jpg',
  },
  {
    id: 6,
    name: 'SaaS Dashboard',
    url: 'saas.wal.app',
    startDate: new Date(2024, 0, 15),
    expiredDate: new Date(2025, 0, 15),
    color: '#CCFFFF',
    urlImg:
      'https://i.pinimg.com/736x/97/c2/a2/97c2a213211e28e1c7dbdc1d86df4713.jpg',
  },
]

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

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

  // Memoize filtered and sorted projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.url.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDate =
        !date ||
        formatDate(project.startDate) === formatDate(date) ||
        formatDate(project.expiredDate) === formatDate(date)

      const remaining = calculateDaysBetween(new Date(), project.expiredDate)

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'expiring' && remaining <= 30) ||
        (activeTab === 'recent' &&
          calculateDaysBetween(new Date(), project.startDate) <= 30)

      return matchesSearch && matchesDate && matchesTab
    })
  }, [searchQuery, date, activeTab])

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
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
        return (
          calculateDaysBetween(new Date(), a.expiredDate) -
          calculateDaysBetween(new Date(), b.expiredDate)
        )
      }
      if (sortType === 'remaining-high') {
        return (
          calculateDaysBetween(new Date(), b.expiredDate) -
          calculateDaysBetween(new Date(), a.expiredDate)
        )
      }
      return 0
    })
  }, [filteredProjects, sortType])

  // Memoize handlers
  const handleHoverStart = useCallback((id: number) => {
    setHoveredCard(id)
  }, [])

  const handleHoverEnd = useCallback(() => {
    setHoveredCard(null)
  }, [])

  const handleReset = useCallback(() => {
    setSearchQuery('')
    setDate(undefined)
    setActiveTab('all')
  }, [])

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Dashboard | Ivory</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <main>
        <div className="container mx-auto relative z-10">
          <DashboardHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortType={sortType}
            setSortType={setSortType}
            date={date}
            setDate={setDate}
          />

          <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <AnimatePresence mode="wait">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              {sortedProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  onHoverStart={handleHoverStart}
                  onHoverEnd={handleHoverEnd}
                />
              ))}
            </div>
          </AnimatePresence>

          {sortedProjects.length === 0 && <EmptyState onReset={handleReset} />}
        </div>
      </main>
    </>
  )
}
