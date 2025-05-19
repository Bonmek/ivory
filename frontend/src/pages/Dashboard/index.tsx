'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ThreeJSBackground from '@/components/ThreeJsBackground'
import DashboardHeader from '@/components/Dashboard/DashboardHeader'
import DashboardTabs from '@/components/Dashboard/DashboardTabs'
import EmptyState from '@/components/Dashboard/EmptyState'
import Loading from '@/components/Loading'
import { Helmet } from 'react-helmet'
import { useSuiData } from '@/hooks/useSuiData'
import { transformMetadataToProject } from '@/utils/metadataUtils'
import { useWalletKit } from '@mysten/wallet-kit'
import { useAuth } from '@/context/AuthContext'
import { RefreshCw } from 'lucide-react'
import { mockProjects } from '@/mocks/projectData'
import { Project } from '@/types/project'
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
  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    if (current > 2) pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i)
    }
    if (current < total - 2) pages.push('...')
    if (current < total - 1) pages.push(total)
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
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { metadata, isLoading, refetch } = useSuiData(address || '')

  const filteredProjects = useMemo(() => {
    const projects = metadata
      ? metadata.map((meta, index) => transformMetadataToProject(meta, index))
      : []
    if (!projects || projects.length === 0) return []
    let filtered = projects.filter((project) => {
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

      return matchesSearch && matchesDate && matchesTab
    })

    if (activeTab === 'building') {
      filtered = filtered.filter((p) => p.status === 0)
    } else if (activeTab === 'active') {
      filtered = filtered.filter((p) => p.status === 1)
    } else if (activeTab === 'failed') {
      filtered = filtered.filter((p) => p.status === 2)
    }

    return filtered
  }, [searchQuery, date, activeTab, metadata])

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

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Calculate total pages
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage)

  // Get current page items
  const currentItems = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

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
          />

          <DashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {isLoading ? (
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
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 rounded-lg bg-primary-700 text-white disabled:opacity-50 hover:bg-primary-600 transition-colors duration-200"
                      >
                        <FormattedMessage id="dashboard.pagination.previous" />
                      </button>
                      {pageNumbers.map((page, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            typeof page === 'number' && handlePageChange(page)
                          }
                          className={`px-3 py-1.5 rounded-lg transition-colors duration-200 ${
                            page === currentPage
                              ? 'bg-secondary-500 text-black'
                              : page === '...'
                                ? 'bg-transparent text-white cursor-default'
                                : 'bg-primary-700 text-white hover:bg-primary-600'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 rounded-lg bg-primary-700 text-white disabled:opacity-50 hover:bg-primary-600 transition-colors duration-200"
                      >
                        <FormattedMessage id="dashboard.pagination.next" />
                      </button>
                    </div>
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
