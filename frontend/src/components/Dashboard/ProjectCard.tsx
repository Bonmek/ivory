import { memo, useState, useEffect } from 'react'
import {
  MoreHorizontal,
  Users,
  CalendarIcon,
  RefreshCw,
  Trash,
  ExternalLink,
  Copy,
  Check,
  Link,
  Timer,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

interface ProjectCardProps {
  project: {
    id: number
    name: string
    url: string
    startDate: Date
    expiredDate: Date
    color: string
    urlImg: string
    suins?: string
    siteId?: string
    status?: number
  }
  index: number
  onHoverStart: (id: number) => void
  onHoverEnd: () => void
}

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
  ({ project, index, onHoverStart, onHoverEnd }: ProjectCardProps) => {
    const remainingDays = calculateDaysBetween(new Date(), project.expiredDate)
    const [startDateOpen, setStartDateOpen] = useState(false)
    const [expiredDateOpen, setExpiredDateOpen] = useState(false)
    const [remainingOpen, setRemainingOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [suinsValue, setSuinsValue] = useState('')
    const [buildTime, setBuildTime] = useState<number>(0)

    useEffect(() => {
      if (project.status === 0) {
        const startTime = new Date(project.startDate).getTime()
        const timer = setInterval(() => {
          const currentTime = new Date().getTime()
          const elapsedTime = Math.floor((currentTime - startTime) / 1000)
          setBuildTime(elapsedTime)
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
            dropdown:
              'text-secondary-300 hover:text-white hover:bg-secondary-500/20',
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
            dropdown:
              'text-secondary-300 hover:text-white hover:bg-secondary-500/20',
            avatar: 'border-secondary-500/50',
            shadow: 'shadow-secondary-500/5',
          }
      }
    }

    const colors = getStatusColor(project.status)

    const handleCopy = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success('Copied to clipboard', {
          className: 'bg-primary-900 border-secondary-500/20 text-white',
          style: {
            background: 'var(--primary-900)',
            border: '1px solid var(--secondary-500)',
            color: 'white',
          },
        })
        setTimeout(() => setCopied(false), 2000)
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

    const handleLinkSuins = () => {
      if (!suinsValue) {
        toast.error('Please enter SUINS name', {
          className: 'bg-red-900 border-red-500/20 text-white',
          style: {
            background: 'var(--red-900)',
            border: '1px solid var(--red-500)',
            color: 'white',
          },
        })
        return
      }
      // TODO: Implement SUINS linking logic
      toast.success('SUINS linked successfully', {
        className: 'bg-primary-900 border-secondary-500/20 text-white',
        style: {
          background: 'var(--primary-900)',
          border: '1px solid var(--secondary-500)',
          color: 'white',
        },
      })
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
            {/* Dropdown Menu: Top Right */}
            <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
              {!project.suins && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      className={`h-8 px-3 flex items-center justify-center rounded-full ${colors.dropdown} transition-all duration-200 hover:scale-110 active:scale-95`}
                    >
                      <Link className="h-4 w-4 mr-1.5" />
                      <span className="text-sm">Link SUINS</span>
                      <span className="text-[10px] opacity-60 ml-1">
                        (initial setup)
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-primary-900 border-secondary-500/20 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-secondary-400">
                        Link SUINS
                      </DialogTitle>
                      <DialogDescription className="text-white/60">
                        Enter your SUINS name to link it with this project
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Input
                          placeholder="Enter SUINS name"
                          value={suinsValue}
                          onChange={(e) => setSuinsValue(e.target.value)}
                          className="bg-primary-800 border-secondary-500/20 text-white"
                        />
                      </div>
                      <Button
                        onClick={handleLinkSuins}
                        className="bg-secondary-500 hover:bg-secondary-600 text-white"
                      >
                        Link SUINS
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`h-8 w-8 flex items-center justify-center rounded-full ${colors.dropdown} transition-all duration-200 hover:scale-110 active:scale-95`}
                    disabled={project.status === 0}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                >
                  {project.status === 2 ? (
                    <>
                      <DropdownMenuItem className="focus:bg-primary-800">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Retry Deploy</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-secondary-500/20" />
                      <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-primary-800">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete site</span>
                      </DropdownMenuItem>
                    </>
                  ) : project.status === 0 ? (
                    <>
                      <div className="px-4 py-2 text-yellow-400 flex items-center gap-2 text-sm">
                        <RefreshCw className="animate-spin h-4 w-4" />
                        Deploying...
                      </div>
                      <DropdownMenuSeparator className="bg-secondary-500/20" />
                      <DropdownMenuItem className="text-red-400 focus:text-red-400 focus:bg-primary-800">
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete site</span>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Left: Project Image */}
            <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              <img
                src="/images/walrus.png"
                alt="project avatar"
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 ${colors.avatar} shadow transition-all duration-300 group-hover:scale-105`}
              />
            </div>

            {/* Middle: Project Info */}
            <div className="flex flex-col flex-1 min-w-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              {/* Project Name with Status */}
              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className={`font-bold text-base truncate group-hover:translate-x-0.5 transition-transform duration-200 ${colors.text}`}
                >
                  {project.name}
                </div>
                <div
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge}`}
                >
                  {project.status === 1
                    ? 'Active'
                    : project.status === 0
                      ? 'Building'
                      : project.status === 2
                        ? 'Failed'
                        : 'Unknown'}
                </div>
              </div>

              {/* Project Link */}
              <div className="flex items-center text-sm mb-1 group-hover:translate-x-0.5 transition-transform duration-200">
                {project.suins ? (
                  <a
                    href={`https://${project.suins}.wal.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center h-[28px] hover:underline truncate transition-colors duration-200 ${colors.link}`}
                  >
                    {project.suins}.suins
                    <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-200">
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </span>
                  </a>
                ) : null}
              </div>

              {/* Site ID with Copy Button */}
              {project.status === 1 && project.siteId && (
                <div className="flex items-center text-xs text-white/60 mb-2 group-hover:translate-x-0.5 transition-transform duration-200">
                  <span className="truncate mr-2">
                    Site ID: {project.siteId.slice(0, 6)}...
                    {project.siteId.slice(-4)}
                  </span>
                  <button
                    onClick={() => handleCopy(project.siteId!)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}

              {/* Dates Row */}
              <div className="flex flex-row w-full gap-x-3 sm:gap-x-6 mt-auto min-h-[48px] opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="text-[10px] text-white/50 font-medium truncate">
                    Start date
                  </div>
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <div
                        className="text-sm text-white font-semibold mt-0.5 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200"
                        onMouseEnter={() => setStartDateOpen(true)}
                        onMouseLeave={() => setStartDateOpen(false)}
                      >
                        {formatShortDate(project.startDate)}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                      onMouseEnter={() => setStartDateOpen(true)}
                      onMouseLeave={() => setStartDateOpen(false)}
                    >
                      <div className="text-sm">
                        {formatDate(project.startDate)}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-3">
                  <div className="text-[10px] text-white/50 font-medium truncate">
                    Expired date
                  </div>
                  <Popover
                    open={expiredDateOpen}
                    onOpenChange={setExpiredDateOpen}
                  >
                    <PopoverTrigger asChild>
                      <div
                        className="text-sm text-white font-semibold mt-0.5 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200"
                        onMouseEnter={() => setExpiredDateOpen(true)}
                        onMouseLeave={() => setExpiredDateOpen(false)}
                      >
                        {formatShortDate(project.expiredDate)}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                      onMouseEnter={() => setExpiredDateOpen(true)}
                      onMouseLeave={() => setExpiredDateOpen(false)}
                    >
                      <div className="text-sm">
                        {formatDate(project.expiredDate)}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                {project.status === 0 && (
                  <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-3">
                    <div className="text-[10px] text-white/50 font-medium truncate">
                      Build Time
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Timer className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="text-sm text-yellow-300 font-medium">
                        {formatBuildTime(buildTime)}
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-3">
                  <div className="text-[10px] text-white/50 font-medium truncate">
                    Remaining
                  </div>
                  <Popover open={remainingOpen} onOpenChange={setRemainingOpen}>
                    <PopoverTrigger asChild>
                      <div
                        className={`text-sm font-bold mt-0.5 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200 ${colors.text}`}
                        onMouseEnter={() => setRemainingOpen(true)}
                        onMouseLeave={() => setRemainingOpen(false)}
                      >
                        {remainingDays} days
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                      onMouseEnter={() => setRemainingOpen(true)}
                      onMouseLeave={() => setRemainingOpen(false)}
                    >
                      <div className="text-sm">
                        Expires on {formatDate(project.expiredDate)}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <Toaster />
      </>
    )
  },
)

export default ProjectCard
