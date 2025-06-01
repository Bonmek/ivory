'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import DashboardTabs from '@/components/Dashboard/DashboardTabs'
import EmptyState from '@/components/Dashboard/EmptyState'
import Loading from '@/components/Loading'
import { Helmet } from 'react-helmet'
import { useSuiData } from '@/hooks/useSuiData'
import { transformMetadataToProject } from '@/utils/metadataUtils'
import { useAuth } from '@/context/AuthContext'
import ProjectCard from '@/components/Dashboard/ProjectCard'
import { FormattedMessage, useIntl } from 'react-intl'

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

function getPageList(current: number, total: number) {
  const pages: (number | string)[] = []
  
  // Always show first page
  pages.push(1)
  
  if (total <= 7) {
    // If total pages is 7 or less, show all pages
    for (let i = 2; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // If current page is near the start
    if (current <= 4) {
      for (let i = 2; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
    // If current page is near the end
    else if (current >= total - 3) {
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    }
    // If current page is in the middle
    else {
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
}

export default function Dashboard() {
  const { address } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const intl = useIntl()
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [sortType, setSortType] = useState('latest')
  const [projectType, setProjectType] = useState<'all' | 'site' | '.zip'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState<Date>(new Date())
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const { metadata, isLoading, refetch } = useSuiData(address || '')
  // Get all projects before filtering by tab
  const allProjects = useMemo(() => {
    return metadata
      ? metadata.map((meta, index) => transformMetadataToProject(meta, index))
      : []
  }, [metadata])
  console.log(allProjects)

  const filteredProjects = useMemo(() => {
    const projects = [...allProjects]
    if (!projects || projects.length === 0) return []

    const currentDate = new Date()
    let filtered = projects.filter((project) => {
      if (project.expiredDate < currentDate) {
        return false
      }

      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.url.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDate =
        !date ||
        formatDate(project.startDate) === formatDate(date) ||
        formatDate(project.expiredDate) === formatDate(date)

      const matchesTab =
        activeTab === 'all' ||
        (activeTab === 'building' && project.status === 0) ||
        (activeTab === 'active' && project.status === 1) ||
        (activeTab === 'failed' && project.status === 2)

      const matchesType = projectType === 'all' || project.type === projectType

      return matchesSearch && matchesDate && matchesTab && matchesType
    })

    if (activeTab === 'building') {
      filtered = filtered.filter((p) => p.status === 0)
    } else if (activeTab === 'active') {
      filtered = filtered.filter((p) => p.status === 1)
    } else if (activeTab === 'failed') {
      filtered = filtered.filter((p) => p.status === 2)
    }

    return filtered
  }, [searchQuery, date, activeTab, projectType, metadata])

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

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, date, activeTab])

  // Reset section pages when filter changes
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

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      setLastRefreshTime(new Date())
    } finally {
      setIsRefreshing(false)
    }
  }, [refetch])

  // Calculate total pages
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage)

  // Get current page items
  const currentItems = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  // Auto-refresh every minute
  useEffect(() => {
    // Clear any existing interval when component mounts or address changes
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current)
    }

    // Only set up auto-refresh if we have an address
    if (address) {
      refreshIntervalRef.current = setInterval(async () => {
        await handleRefresh()
      }, 60000) // 60000 ms = 1 minute
    }

    // Clean up interval on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
        refreshIntervalRef.current = null
      }
    }
  }, [address, handleRefresh])

  // Get page numbers to display
  const pageNumbers = getPageList(currentPage, totalPages)

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{intl.formatMessage({ id: 'dashboard.title' })} | Ivory</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <main className="min-h-screen pb-24 relative">
        <div className="container mx-auto relative z-10">
          <DashboardHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortType={sortType}
            setSortType={setSortType}
            date={date}
            setDate={setDate}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            lastRefreshTime={lastRefreshTime}
            hasProjects={allProjects.length > 0}
            activeTab={activeTab}
            projectType={projectType}
            setProjectType={setProjectType}
          />

          <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {isLoading && allProjects.length === 0 ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <Loading />
            </div>
          ) : (
            <>
              {sortedProjects.length > 0 && (
                <section className="my-10">
                  <div className="rounded-xl">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch"
                      >
                        {currentItems.map((project, index) => (
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
                              userAddress={address || ''}
                              onRefetch={async () => {
                                await refetch()
                              }}
                            />
                          </motion.div>
                        ))}
                        {currentItems.length < 6 &&
                          Array.from({ length: 6 - currentItems.length }).map(
                            (_, index) => (
                              <motion.div
                                key={`empty-${index}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                className="min-h-[160px] rounded-lg bg-primary-800/30 border border-white/5"
                              />
                            ),
                          )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {totalPages > 1 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-center items-center gap-3 mt-8"
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-primary-800/80 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-700 transition-all duration-200 cursor-pointer"
                      >
                        <FormattedMessage id="dashboard.pagination.previous" />
                      </motion.button>

                      <div className="flex gap-2 items-center">
                        {pageNumbers.map((page, index) => (
                          <motion.button
                            key={index}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            disabled={page === '...'}
                            whileHover={page !== '...' ? { scale: 1.05 } : {}}
                            whileTap={page !== '...' ? { scale: 0.95 } : {}}
                            className={`relative min-w-[40px] h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              page === currentPage
                                ? 'bg-secondary-500 text-black font-medium'
                                : page === '...'
                                  ? 'bg-transparent text-white/60 cursor-default'
                                  : 'bg-primary-800/80 text-white hover:bg-primary-700 cursor-pointer'
                            }`}
                          >
                            {page === currentPage && (
                              <motion.div
                                layoutId="activePage"
                                className="absolute inset-0 bg-secondary-500 rounded-lg -z-10"
                                transition={{ type: "spring", duration: 0.5 }}
                              />
                            )}
                            {page}
                          </motion.button>
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-primary-800/80 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-700 transition-all duration-200 cursor-pointer"
                      >
                        <FormattedMessage id="dashboard.pagination.next" />
                      </motion.button>
                    </motion.div>
                  )}
                </section>
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
