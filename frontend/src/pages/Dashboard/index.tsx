'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeJSBackground from '@/components/ThreeJsBackground'
import ProjectCard from '@/components/Dashboard/ProjectCard'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import DashboardTabs from '@/components/Dashboard/DashboardTabs'
import EmptyState from '@/components/Dashboard/EmptyState'
import Loading from '@/components/Loading'
import { Helmet } from 'react-helmet'
import { useSuiData } from '@/hooks/useSuiData'
import { transformMetadataToProject } from '@/utils/metadataUtils'
import { useAuth } from '@/context/AuthContext'

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
  const { address } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [sortType, setSortType] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // 2 rows of 3 items

  const { metadata, isLoading } = useSuiData(address || '')

  // Transform metadata into project format
  const filteredProjects = useMemo(() => {
    if (!metadata || metadata.length === 0) return []
    return metadata
      .map((meta, index) => transformMetadataToProject(meta, index))
      .filter((project) => {
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
  }, [metadata, searchQuery, date, activeTab])

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

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedProjects.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedProjects, currentPage])

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, date, activeTab])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Memoize handlers
  const handleHoverStart = useCallback((id: number) => {
    setHoveredCard(id)
  }, [])

  const handleHoverEnd = useCallback(() => {
    setHoveredCard(null)
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

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loading />
            </div>
          ) : (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch"
                >
                  {paginatedProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ProjectCard
                        project={project}
                        index={index}
                        onHoverStart={handleHoverStart}
                        onHoverEnd={handleHoverEnd}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="flex justify-center items-center gap-2 mt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600"
                  >
                    Previous
                  </motion.button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <motion.button
                      key={page}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === page
                          ? 'bg-secondary-500 text-black'
                          : 'bg-primary-700 text-white hover:bg-primary-600'
                      }`}
                    >
                      {page}
                    </motion.button>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600"
                  >
                    Next
                  </motion.button>
                </motion.div>
              )}
            </>
          )}

          {!isLoading && sortedProjects.length === 0 && (
            <EmptyState onReset={() => setSearchQuery('')} />
          )}
        </div>
      </main>
    </>
  )
}
