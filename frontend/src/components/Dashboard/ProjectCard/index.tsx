import { memo, useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { useSuiData } from '@/hooks/useSuiData'
import apiClient from '@/lib/axiosConfig'
import { toast } from 'sonner'
import { ProjectCardProps } from '@/types/project'
import { ProjectStatus } from './ProjectStatus'
import { ProjectDates } from './ProjectDates'
import { ProjectActions } from './ProjectActions'
import { ProjectInfo } from './ProjectInfo'

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatShortDate = (date: Date) => {
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

const ProjectCard = memo(
  ({
    project,
    index,
    onHoverStart,
    onHoverEnd,
    userAddress,
    onRefetch,
  }: ProjectCardProps) => {
    const remainingDays = calculateDaysBetween(new Date(), project.expiredDate)
    const [startDateOpen, setStartDateOpen] = useState(false)
    const [expiredDateOpen, setExpiredDateOpen] = useState(false)
    const [remainingOpen, setRemainingOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [statusOpen, setStatusOpen] = useState(false)
    const [buildTime, setBuildTime] = useState<number>(() => {
      if (project.status === 0) {
        const startTime = new Date(project.startDate).getTime()
        const now = Date.now()
        return Math.floor((now - startTime) / 1000)
      }
      return 0
    })
    const [selectedSuins, setSelectedSuins] = useState<string>('')
    const [otherSuins, setOtherSuins] = useState<string>('')
    const { suins, isLoadingSuins, refetchSuiNS } = useSuiData(userAddress)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLinking, setIsLinking] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
      if (project.status === 0) {
        const startTime = new Date(project.startDate).getTime()
        setBuildTime(Math.floor((Date.now() - startTime) / 1000))

        const timer = setInterval(() => {
          setBuildTime(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)

        return () => clearInterval(timer)
      }
    }, [project.status, project.startDate])

    const formatBuildTime = (seconds: number) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const remainingSeconds = seconds % 60

      if (hours > 0) {
        return `${hours}h ${minutes}m ${remainingSeconds}s`
      } else if (minutes > 0) {
        return `${minutes}m ${remainingSeconds}s`
      } else {
        return `${remainingSeconds}s`
      }
    }

    const getStatusColor = (status?: number) => {
      switch (status) {
        case 1:
          return {
            card: 'bg-primary-900/90 hover:bg-primary-900 border-secondary-500/10 hover:border-secondary-500/30',
            indicator: 'bg-secondary-400',
            text: 'text-secondary-400',
            badge: 'bg-secondary-500/20 text-secondary-300',
            link: 'text-secondary-300 hover:text-secondary-400',
            date: 'text-secondary-300',
            dropdown: 'text-secondary-300 hover:text-white hover:bg-secondary-500/20',
            avatar: 'border-secondary-500/50',
            shadow: 'shadow-secondary-500/5',
          }
        case 0:
          return {
            card: 'bg-primary-900/90 hover:bg-primary-900 border-yellow-500/10 hover:border-yellow-500/30',
            text: 'text-yellow-400',
            badge: 'bg-yellow-500/20 text-yellow-300',
            link: 'text-yellow-300 hover:text-yellow-400',
            date: 'text-yellow-300',
            dropdown: 'text-yellow-300 hover:text-white hover:bg-yellow-500/20',
            avatar: 'border-yellow-500/50',
            shadow: 'shadow-yellow-500/5',
          }
        case 2:
          return {
            card: 'bg-primary-900/90 hover:bg-primary-900 border-red-500/10 hover:border-red-500/30',
            text: 'text-red-400',
            badge: 'bg-red-500/20 text-red-300',
            link: 'text-red-300 hover:text-red-400',
            date: 'text-red-300',
            dropdown: 'text-red-300 hover:text-white hover:bg-red-500/20',
            avatar: 'border-red-500/50',
            shadow: 'shadow-red-500/5',
          }
        default:
          return {
            card: 'bg-primary-900/90 hover:bg-primary-900 border-secondary-500/10 hover:border-secondary-500/30',
            indicator: 'bg-secondary-400',
            text: 'text-secondary-400',
            badge: 'bg-secondary-500/20 text-secondary-300',
            link: 'text-secondary-300 hover:text-secondary-400',
            date: 'text-secondary-300',
            dropdown: 'text-secondary-300 hover:text-white hover:bg-secondary-500/20',
            avatar: 'border-secondary-500/50',
            shadow: 'shadow-secondary-500/5',
          }
      }
    }

    const colors = getStatusColor(project.status)

    const handleCopy = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        toast.success('Copied to clipboard', {
          className: 'bg-primary-900 border-secondary-500/20 text-white',
          style: {
            background: 'var(--primary-900)',
            border: '1px solid var(--secondary-500)',
            color: 'white',
          },
        })
      } catch (err) {
        toast.error('Failed to copy', {
          className: 'bg-red-900 border-red-500/20 text-white',
          style: {
            background: 'var(--red-900)',
            border: '1px solid var(--red-500)',
            color: 'white',
          },
        })
      }
    }

    const handleLinkSuins = async () => {
      const finalSuins = selectedSuins === 'other' ? otherSuins : selectedSuins
      if (!finalSuins) {
        toast.error('Please select a SUINS domain', {
          className: 'bg-red-900 border-red-500/20 text-white',
          style: {
            background: 'var(--red-900)',
            border: '1px solid var(--red-500)',
            color: 'white',
          },
        })
        return
      }

      try {
        setIsLinking(true)
        const response = await apiClient.put(
          `/set-attributes?object_id=${project.parentId}&sui_ns=${finalSuins}`,
        )
        if (response.status === 200) {
          toast.success('SUINS linked successfully', {
            className: 'bg-primary-900 border-secondary-500/20 text-white',
            style: {
              background: 'var(--primary-900)',
              border: '1px solid var(--secondary-500)',
              color: 'white',
            },
            description: 'Your SUINS domain has been linked to this project. It may take a few moments to update.',
            duration: 5000,
          })
          setOpen(false)
          onRefetch()
        }
      } catch (error: any) {
        console.error('Error linking SUINS:', error)
        toast.error(error.response?.data?.message || 'Failed to link SUINS', {
          className: 'bg-red-900 border-red-500/20 text-white',
          style: {
            background: 'var(--red-900)',
            border: '1px solid var(--red-500)',
            color: 'white',
          },
          description: 'Please try again or contact support if the problem persists.',
          duration: 5000,
        })
      } finally {
        setIsLinking(false)
      }
    }

    const handleRefreshSuins = async () => {
      setIsRefreshing(true)
      try {
        await refetchSuiNS()
      } finally {
        setIsRefreshing(false)
      }
    }

    const handleDeleteSite = async () => {
      if (!project.parentId) {
        toast.error('Project Parent ID is missing. Cannot delete site.', {
          className: 'bg-red-900 border-red-500/20 text-white',
          style: {
            background: 'var(--red-900)',
            border: '1px solid var(--red-500)',
            color: 'white',
          },
        })
        return
      }
      try {
        const response = await apiClient.delete(
          `/delete-site?object_id=${project.parentId}`,
        )
        if (response.status === 200) {
          toast.success('Site deleted successfully', {
            className: 'bg-primary-900 border-secondary-500/20 text-white',
            style: {
              background: 'var(--primary-900)',
              border: '1px solid var(--secondary-500)',
              color: 'white',
            },
          })
        }
      } catch (error: any) {
        console.error('Error deleting site:', error)
        toast.error(error.response?.data?.message || 'Failed to delete site', {
          className: 'bg-red-900 border-red-500/20 text-white',
          style: {
            background: 'var(--red-900)',
            border: '1px solid var(--red-500)',
            color: 'white',
          },
        })
      }
    }

    return (
      <>
        <div
          key={project.id}
          className="rounded-lg overflow-hidden relative h-full group transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
          onMouseEnter={() => onHoverStart(project.id)}
          onMouseLeave={() => onHoverEnd()}
        >
          <Card
            className={`flex flex-row items-center p-3 sm:p-4 ${colors.card} ${colors.shadow} shadow-lg backdrop-blur-sm h-full min-h-[160px] relative transition-all duration-300`}
          >
            <ProjectActions
              project={project}
              colors={colors}
              open={open}
              setOpen={setOpen}
              selectedSuins={selectedSuins}
              setSelectedSuins={setSelectedSuins}
              otherSuins={otherSuins}
              setOtherSuins={setOtherSuins}
              isLoadingSuins={isLoadingSuins}
              isRefreshing={isRefreshing}
              isLinking={isLinking}
              suins={suins}
              handleRefreshSuins={handleRefreshSuins}
              handleLinkSuins={handleLinkSuins}
              handleDeleteSite={handleDeleteSite}
            />

            <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              <img
                src={
                  project.status === 0
                    ? '/images/walrus_building.png'
                    : project.status === 2
                      ? '/images/walrus_fail.png'
                      : '/images/walrus.png'
                }
                alt="project avatar"
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 ${colors.avatar} shadow transition-all duration-300 group-hover:scale-105`}
              />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <ProjectInfo project={project} colors={colors} handleCopy={handleCopy} />
                <ProjectStatus
                  status={project.status}
                  client_error_description={project.client_error_description}
                  colors={colors}
                  errorOpen={errorOpen}
                  setErrorOpen={setErrorOpen}
                  statusOpen={statusOpen}
                  setStatusOpen={setStatusOpen}
                />
              </div>

              <ProjectDates
                startDate={project.startDate}
                expiredDate={project.expiredDate}
                status={project.status}
                buildTime={buildTime}
                colors={colors}
                startDateOpen={startDateOpen}
                setStartDateOpen={setStartDateOpen}
                expiredDateOpen={expiredDateOpen}
                setExpiredDateOpen={setExpiredDateOpen}
                remainingOpen={remainingOpen}
                setRemainingOpen={setRemainingOpen}
                remainingDays={remainingDays}
                formatShortDate={formatShortDate}
                formatDate={formatDate}
                formatBuildTime={formatBuildTime}
              />
            </div>
          </Card>
        </div>
        <Toaster />
      </>
    )
  },
)

export default ProjectCard 