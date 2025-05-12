import { Timer } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface ProjectDatesProps {
  startDate: Date
  expiredDate: Date
  status: number
  buildTime: number
  colors: {
    text: string
    date: string
  }
  startDateOpen: boolean
  setStartDateOpen: (open: boolean) => void
  expiredDateOpen: boolean
  setExpiredDateOpen: (open: boolean) => void
  remainingOpen: boolean
  setRemainingOpen: (open: boolean) => void
  remainingDays: number
  formatShortDate: (date: Date) => string
  formatDate: (date: Date) => string
  formatBuildTime: (seconds: number) => string
}

export const ProjectDates = ({
  startDate,
  expiredDate,
  status,
  buildTime,
  colors,
  startDateOpen,
  setStartDateOpen,
  expiredDateOpen,
  setExpiredDateOpen,
  remainingOpen,
  setRemainingOpen,
  remainingDays,
  formatShortDate,
  formatDate,
  formatBuildTime,
}: ProjectDatesProps) => {
  return (
    <div className="flex flex-row w-full gap-x-3 sm:gap-x-6 mt-auto min-h-[48px] opacity-80 group-hover:opacity-100 transition-opacity duration-200">
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="text-[10px] text-white/50 font-medium truncate">Start date</div>
        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
          <PopoverTrigger asChild>
            <div
              className="text-sm text-white font-semibold mt-0.5 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200"
              onMouseEnter={() => setStartDateOpen(true)}
              onMouseLeave={() => setStartDateOpen(false)}
            >
              {formatShortDate(startDate)}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm">
            <div className="text-sm">{formatDate(startDate)}</div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-3">
        <div className="text-[10px] text-white/50 font-medium truncate">Expired date</div>
        <Popover open={expiredDateOpen} onOpenChange={setExpiredDateOpen}>
          <PopoverTrigger asChild>
            <div
              className="text-sm text-white font-semibold mt-0.5 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200"
              onMouseEnter={() => setExpiredDateOpen(true)}
              onMouseLeave={() => setExpiredDateOpen(false)}
            >
              {formatShortDate(expiredDate)}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm">
            <div className="text-sm">{formatDate(expiredDate)}</div>
          </PopoverContent>
        </Popover>
      </div>

      {status === 0 && (
        <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-3">
          <div className="text-[10px] text-white/50 font-medium truncate">Build Time</div>
          <div className="flex items-center gap-1.5 mt-0.5 min-h-[20px]">
            <Timer className="h-3.5 w-3.5 text-yellow-400" />
            {buildTime === 0 ? (
              <span className="animate-pulse text-yellow-300 font-medium">Loading...</span>
            ) : (
              <span className="text-sm text-yellow-300 font-medium">{formatBuildTime(buildTime)}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-3">
        <div className="text-[10px] text-white/50 font-medium truncate">Remaining</div>
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
          <PopoverContent className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm">
            <div className="text-sm">Expires on {formatDate(expiredDate)}</div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
} 