import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  MoreHorizontal,
  Users,
  CalendarIcon,
  RefreshCw,
  Trash,
  ExternalLink,
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

interface ProjectCardProps {
  project: {
    id: number
    name: string
    url: string
    startDate: Date
    expiredDate: Date
    color: string
    urlImg: string
  }
  index: number
  onHoverStart: (id: number) => void
  onHoverEnd: () => void
}

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

const ProjectCard = memo(
  ({ project, index, onHoverStart, onHoverEnd }: ProjectCardProps) => {
    const remainingDays = calculateDaysBetween(new Date(), project.expiredDate)
    const [startDateOpen, setStartDateOpen] = useState(false)
    const [expiredDateOpen, setExpiredDateOpen] = useState(false)
    const [remainingOpen, setRemainingOpen] = useState(false)

    return (
      <div
        key={project.id}
        className="rounded-lg overflow-hidden relative h-full group transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        onMouseEnter={() => onHoverStart(project.id)}
        onMouseLeave={() => onHoverEnd()}
      >
        <Card className="flex flex-row items-center p-4 sm:p-6 bg-primary-900/80 border-secondary-500/20 shadow-lg backdrop-blur-sm h-full min-h-[180px] relative transition-all duration-300 hover:bg-primary-900/90 hover:border-secondary-500/30">
          {/* Dropdown Menu: Top Right */}
          <div className="absolute top-4 right-4 z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-10 w-10 flex items-center justify-center rounded-full text-secondary-300 hover:text-white hover:bg-primary-800/50 transition-all duration-200 hover:scale-110 active:scale-95">
                  <MoreHorizontal className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
              >
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
          <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
            <img
              src={project.urlImg}
              alt="project avatar"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20 shadow transition-all duration-300 group-hover:border-secondary-500/50 group-hover:scale-105"
            />
          </div>

          {/* Middle: Project Info */}
          <div className="flex flex-col flex-1 min-w-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
            {/* Project Name */}
            <div className="font-bold text-lg text-secondary-400 mb-1 truncate group-hover:translate-x-0.5 transition-transform duration-200">
              {project.name}
            </div>

            {/* Project Link */}
            <div className="flex items-center text-base text-white/80 mb-4 group-hover:translate-x-0.5 transition-transform duration-200">
              <a
                href={`https://${project.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center hover:underline truncate transition-colors duration-200 hover:text-secondary-500"
              >
                {project.url}
                <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-200">
                  <ExternalLink className="h-4 w-4 flex-shrink-0" />
                </span>
              </a>
            </div>

            {/* Dates Row */}
            <div className="flex flex-row w-full gap-x-4 sm:gap-x-8 mt-auto min-h-[56px] opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-[11px] text-white/50 font-medium truncate">
                  Start date
                </div>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <div
                      className="text-sm text-white font-semibold mt-1 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200"
                      onMouseEnter={() => setStartDateOpen(true)}
                      onMouseLeave={() => setStartDateOpen(false)}
                    >
                      {formatDate(project.startDate)}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                    onMouseEnter={() => setStartDateOpen(true)}
                    onMouseLeave={() => setStartDateOpen(false)}
                  >
                    <div className="text-sm">
                      {project.startDate.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-4">
                <div className="text-[11px] text-white/50 font-medium truncate">
                  Expired date
                </div>
                <Popover
                  open={expiredDateOpen}
                  onOpenChange={setExpiredDateOpen}
                >
                  <PopoverTrigger asChild>
                    <div
                      className="text-sm text-white font-semibold mt-1 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200"
                      onMouseEnter={() => setExpiredDateOpen(true)}
                      onMouseLeave={() => setExpiredDateOpen(false)}
                    >
                      {formatDate(project.expiredDate)}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                    onMouseEnter={() => setExpiredDateOpen(true)}
                    onMouseLeave={() => setExpiredDateOpen(false)}
                  >
                    <div className="text-sm">
                      {project.expiredDate.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-4">
                <div className="text-[11px] text-white/50 font-medium truncate">
                  Remaining
                </div>
                <Popover open={remainingOpen} onOpenChange={setRemainingOpen}>
                  <PopoverTrigger asChild>
                    <div
                      className="text-sm text-secondary-300 font-bold mt-1 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200"
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
                      Expires on{' '}
                      {project.expiredDate.toLocaleDateString('en-GB', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  },
)

export default ProjectCard
