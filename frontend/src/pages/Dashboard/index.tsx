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
import { useWalletKit } from '@mysten/wallet-kit'
import { useAuth } from '@/context/AuthContext'
import { RefreshCw } from 'lucide-react'

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
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
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
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [activeTab, setActiveTab] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [sortType, setSortType] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // 2 rows of 3 items
  const [isRefreshing, setIsRefreshing] = useState(false)

  // State for separate paginations
  const [deployingPage, setDeployingPage] = useState(1)
  const [otherPage, setOtherPage] = useState(1)
  const sectionItemsPerPage = 4

  const { metadata, isLoading, refetch } = useSuiData(address || '')

  // Transform metadata into project format
  const filteredProjects = useMemo(() => {
    if (!metadata || metadata.length === 0) return []
    let projects = metadata
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
          (activeTab === 'building' && project.status === 0) ||
          (activeTab === 'active' && project.status === 1) ||
          (activeTab === 'failed' && project.status === 2) ||
          (activeTab === 'expiring' && remaining <= 30) ||
          (activeTab === 'recent' &&
            calculateDaysBetween(new Date(), project.startDate) <= 30)

        return matchesSearch && matchesDate && matchesTab
      })

    if (activeTab === 'building') {
      projects = projects.filter((p) => p.status === 0)
    } else if (activeTab === 'active') {
      projects = projects.filter((p) => p.status === 1)
    } else if (activeTab === 'failed') {
      projects = projects.filter((p) => p.status === 2)
    }

    return projects
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

  // Reset section pages when filter changes
  useEffect(() => {
    setDeployingPage(1)
    setOtherPage(1)
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

  // Deploying pagination
  const deployingProjects = sortedProjects.filter((p) => p.status === 0)
  const deployingTotalPages = Math.ceil(deployingProjects.length / sectionItemsPerPage)
  const paginatedDeployingProjects = deployingProjects.slice(
    (deployingPage - 1) * sectionItemsPerPage,
    deployingPage * sectionItemsPerPage
  )

  // Other pagination
  const otherProjects = sortedProjects.filter((p) => p.status !== 0)
  const otherTotalPages = Math.ceil(otherProjects.length / sectionItemsPerPage)
  const paginatedOtherProjects = otherProjects.slice(
    (otherPage - 1) * sectionItemsPerPage,
    otherPage * sectionItemsPerPage
  )

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
              {/* Section: Deploying */}
              {activeTab === 'all' && deployingProjects.length > 0 && (
                <section className="my-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-800/50 border border-primary-700">
                      <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-yellow-300 uppercase tracking-widest">
                        Deploying Projects
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {deployingProjects.length} {deployingProjects.length === 1 ? 'project' : 'projects'} in progress
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={deployingPage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch"
                      >
                        {paginatedDeployingProjects.map((project, index) => (
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
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {deployingTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <button
                        onClick={() => setDeployingPage(deployingPage - 1)}
                        disabled={deployingPage === 1}
                        className="px-3 py-1 rounded bg-primary-700 text-white disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: deployingTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setDeployingPage(page)}
                          className={`px-3 py-1 rounded ${deployingPage === page ? 'bg-secondary-500 text-black' : 'bg-primary-700 text-white hover:bg-primary-600'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setDeployingPage(deployingPage + 1)}
                        disabled={deployingPage === deployingTotalPages}
                        className="px-3 py-1 rounded bg-primary-700 text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Section: Other Projects */}
              {activeTab === 'all' && otherProjects.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-800/50 border border-primary-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4 text-primary-400"
                      >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">
                        Other Projects
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {otherProjects.length} {otherProjects.length === 1 ? 'project' : 'projects'} available
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={otherPage}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch"
                      >
                        {paginatedOtherProjects.map((project, index) => (
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
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {otherTotalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-4">
                      <button
                        onClick={() => setOtherPage(otherPage - 1)}
                        disabled={otherPage === 1}
                        className="px-3 py-1 rounded bg-primary-700 text-white disabled:opacity-50"
                      >
                        Previous
                      </button>
                      {Array.from({ length: otherTotalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setOtherPage(page)}
                          className={`px-3 py-1 rounded ${otherPage === page ? 'bg-secondary-500 text-black' : 'bg-primary-700 text-white hover:bg-primary-600'}`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setOtherPage(otherPage + 1)}
                        disabled={otherPage === otherTotalPages}
                        className="px-3 py-1 rounded bg-primary-700 text-white disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </section>
              )}

              {/* Section: Filtered Projects (for other tabs) */}
              {activeTab !== 'all' && filteredProjects.length > 0 && (
                <section>
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
                        {filteredProjects.map((project, index) => (
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
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    </AnimatePresence>
                  </div>
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
