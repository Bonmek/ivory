import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  ChevronDown,
  RefreshCw,
  PlusCircle,
  MoreVertical,
  SlidersHorizontal,
  X,
  AlertCircle,
  Clock,
  Wallet,
  Info,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { FormattedMessage, useIntl } from 'react-intl'
import { useState, useEffect } from 'react'

// Define the CSS for the animations
const pulseAnimationStyle = `
  @keyframes pulse-slow {
    0% { opacity: 0.3; }
    50% { opacity: 0.6; }
    100% { opacity: 0.3; }
  }

  @keyframes flow-right {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes flow-left {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }

  @keyframes flow-down {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  @keyframes flow-up {
    0% { transform: translateY(100%); }
    100% { transform: translateY(-100%); }
  }

  .animate-flow-right {
    animation: flow-right 3s linear infinite;
  }

  .animate-flow-left {
    animation: flow-left 3s linear infinite;
  }

  .animate-flow-down {
    animation: flow-down 3s linear infinite;
  }

  .animate-flow-up {
    animation: flow-up 3s linear infinite;
  }

  .animate-pulse-slow {
    animation: pulse-slow 2s ease-in-out infinite;
  }
`;

interface DashboardHeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  sortType: string
  setSortType: (type: string) => void
  onRefresh: () => Promise<void>
  isRefreshing: boolean
  lastRefreshTime?: Date
  hasProjects?: boolean
  activeTab: string
}

const DashboardHeader = ({
  searchQuery,
  setSearchQuery,
  date,
  setDate,
  sortType,
  setSortType,
  onRefresh,
  isRefreshing,
  lastRefreshTime,
  hasProjects = false,
  activeTab,
}: DashboardHeaderProps) => {
  const intl = useIntl()
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [showLimitWarning, setShowLimitWarning] = useState(false)
  const [isInCooldown, setIsInCooldown] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const COOLDOWN_PERIOD = 5

  const handleRefresh = async () => {
    if (isRefreshing || isInCooldown) return

    try {
      await onRefresh()
      setIsInCooldown(true)
      setCooldownSeconds(COOLDOWN_PERIOD)

      const timer = setInterval(() => {
        setCooldownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setIsInCooldown(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } catch (error) {
      console.error('Refresh failed:', error)
      setIsInCooldown(false)
      setCooldownSeconds(0)
    }
  }

  // Format cooldown time
  const formatCooldownTime = (seconds: number) => {
    return `${seconds}s`
  }

  // Get refresh button state
  const getRefreshButtonState = () => {
    if (isRefreshing) return 'refreshing'
    if (isInCooldown) return 'cooldown'
    return 'ready'
  }

  // Get tooltip message based on button state
  const getTooltipMessage = () => {
    switch (getRefreshButtonState()) {
      case 'refreshing':
        return intl.formatMessage({ 
          id: 'dashboard.refresh.loading', 
          defaultMessage: 'Refreshing data...'
        })
      case 'cooldown':
        return intl.formatMessage(
          { 
            id: 'dashboard.refresh.cooldown',
            defaultMessage: 'Please wait {time} before refreshing',
          },
          { time: formatCooldownTime(cooldownSeconds) }
        )
      default:
        return intl.formatMessage({ 
          id: 'dashboard.refresh.ready', 
          defaultMessage: 'Refresh data'
        })
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-container') && searchExpanded) {
        setSearchExpanded(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [searchExpanded])

  // ปิดช่องค้นหาเมื่อกดปุ่ม Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchExpanded) {
        setSearchExpanded(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [searchExpanded])

  const sortTypeLabel = {
    latest: intl.formatMessage({ id: 'dashboard.sort.latest' }),
    'name-az': intl.formatMessage({ id: 'dashboard.sort.nameAZ' }),
    'name-za': intl.formatMessage({ id: 'dashboard.sort.nameZA' }),
    'remaining-low': intl.formatMessage({ id: 'dashboard.sort.remainingLow' }),
    'remaining-high': intl.formatMessage({
      id: 'dashboard.sort.remainingHigh',
    }),
  }
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: pulseAnimationStyle }} />
      <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className="flex flex-row items-center justify-between gap-2 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0"
    >
      <motion.h1
        className="text-xl sm:text-3xl font-bold text-white font-pixel flex-shrink-0"
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
        <FormattedMessage id="dashboard.title" />
      </motion.h1>

      <motion.div
        className="flex items-center gap-2"
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
        <motion.div className="relative flex-shrink-0 search-container">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSearchExpanded(true)}
            className="md:hidden h-9 w-9 bg-primary-900/80 border-secondary-500/20 text-white hover:bg-secondary-500/10 cursor-pointer"
          >
            <Search className="h-4 w-4 text-secondary-400" />
          </Button>

          <motion.div
            className="relative hidden md:flex"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 z-10 pointer-events-none" />
            <Input
              type="search"
              placeholder={intl.formatMessage({ id: 'dashboard.search' })}
              className="w-[200px] md:w-[250px] pl-10 bg-primary-900/80 border-secondary-500/20 text-white placeholder:text-secondary-400 backdrop-blur-sm text-sm h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </motion.div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0"
        >
          <Button
            onClick={() => {
              if (hasProjects) {
                setShowLimitWarning(true)
              } else {
                window.location.href = '/create-website'
              }
            }}
            variant="outline"
            className="w-full sm:w-auto bg-primary-800 text-white font-medium flex items-center gap-1.5 border-secondary-500/40 hover:bg-primary-700 hover:border-secondary-500 cursor-pointer shadow-lg shadow-secondary-500/20 ring-2 ring-secondary-500/20 hover:ring-secondary-500/50 transition-all duration-200 transform hover:scale-105 relative overflow-hidden group"
          >
            {/* Inner pulse animations */}
            <div className="absolute inset-0 bg-secondary-500/10 animate-pulse-slow rounded-md pointer-events-none"></div>
            <div className="absolute -inset-1 bg-secondary-500/5 blur-sm animate-pulse-slow rounded-md pointer-events-none"></div>
            
            {/* Flowing animation elements */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary-500/70 to-transparent animate-flow-right pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-secondary-500/70 to-transparent animate-flow-left pointer-events-none"></div>
            <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-secondary-500/70 to-transparent animate-flow-down pointer-events-none"></div>
            <div className="absolute right-0 bottom-0 w-0.5 h-full bg-gradient-to-b from-transparent via-secondary-500/70 to-transparent animate-flow-up pointer-events-none"></div>
            
            {/* Corner glows */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-secondary-500/40 rounded-full blur-sm animate-pulse-slow pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-secondary-500/40 rounded-full blur-sm animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-secondary-500/40 rounded-full blur-sm animate-pulse-slow pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-secondary-500/40 rounded-full blur-sm animate-pulse-slow pointer-events-none"></div>
            
            <PlusCircle className="h-4 w-4 text-secondary-500 relative z-10" />
            <span className="relative z-10">
              <FormattedMessage
                id="dashboard.createNew"
                defaultMessage="Deploy Site"
              />
            </span>
          </Button>
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="outline"
                className="bg-primary-900/80 border-secondary-500/20 text-white hover:bg-secondary-500/10 hover:text-secondary-500 h-9 w-9 cursor-pointer flex-shrink-0"
                title="Actions"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm min-w-[220px]"
          >
            {/* Sort Options */}
            <DropdownMenuLabel className="text-secondary-400 text-xs">
              <FormattedMessage
                id="dashboard.sort.title"
                defaultMessage="Sort By"
              />
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setSortType('latest')}
                className={`cursor-pointer ${sortType === 'latest' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <FormattedMessage id="dashboard.sort.latest" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortType('name-az')}
                className={`cursor-pointer ${sortType === 'name-az' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <FormattedMessage id="dashboard.sort.nameAZ" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortType('name-za')}
                className={`cursor-pointer ${sortType === 'name-za' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <FormattedMessage id="dashboard.sort.nameZA" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortType('remaining-low')}
                className={`cursor-pointer ${sortType === 'remaining-low' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <FormattedMessage id="dashboard.sort.remainingLow" />
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setSortType('remaining-high')}
                className={`cursor-pointer ${sortType === 'remaining-high' ? 'bg-secondary-500/10 text-secondary-500 font-bold' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                <FormattedMessage id="dashboard.sort.remainingHigh" />
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {/* เส้นแบ่งสำหรับมือถือเท่านั้น */}
            <div className="md:hidden">
              <DropdownMenuSeparator />

              {/* Refresh Option สำหรับมือถือเท่านั้น */}
              <DropdownMenuItem
                onClick={handleRefresh}
                disabled={isRefreshing || isInCooldown}
                className="md:hidden cursor-pointer relative overflow-hidden"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <FormattedMessage 
                  id="dashboard.refresh" 
                  defaultMessage="Refresh Data" // Will be: 刷新数据 in Chinese
                />
                {isInCooldown && (
                  <span className="text-xs text-secondary-400 ml-auto">
                    {formatCooldownTime(cooldownSeconds)}
                  </span>
                )}
                {lastRefreshTime && !isInCooldown && (
                  <span className="text-xs text-secondary-400 ml-auto">
                    {lastRefreshTime.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </DropdownMenuItem>
            </div>

            {/* Clear Filters Option */}
            {(date || searchQuery) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setSearchQuery('')
                    setDate(undefined)
                  }}
                  className="cursor-pointer"
                >
                  <FormattedMessage
                    id="dashboard.clearFilters"
                    defaultMessage="Clear Filters"
                  />
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden md:flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRefresh}
                    disabled={isRefreshing || isInCooldown}
                    className={`h-9 w-9 cursor-pointer relative overflow-hidden
                      ${isInCooldown ? 'bg-primary-800/50' : ''}
                      ${isRefreshing ? 'bg-secondary-500/10' : ''}
                    `}
                  >
                    <RefreshCw
                      className={`h-4 w-4 transition-all duration-200
                        ${isRefreshing ? 'animate-spin text-secondary-400' : ''}
                        ${isInCooldown ? 'text-secondary-600' : ''}
                      `}
                    />
                    {isInCooldown && (
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-secondary-500/30"
                        style={{
                          width: `${(cooldownSeconds / COOLDOWN_PERIOD) * 100}%`,
                          transition: 'width 1s linear'
                        }}
                      />
                    )}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                className="bg-primary-900/95 border-secondary-500/20 text-white text-xs"
              >
                {getTooltipMessage()}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {lastRefreshTime && !isInCooldown && (
            <span className="text-xs text-secondary-400">
              {intl.formatMessage(
                { 
                  id: 'dashboard.lastRefresh',
                  defaultMessage: 'Last: {time}' // Will be: 上次: {time} in Chinese
                },
                {
                  time: lastRefreshTime.toLocaleTimeString(undefined, {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                },
              )}
            </span>
          )}
          {isInCooldown && (
            <span className="text-xs text-secondary-400">
              {formatCooldownTime(cooldownSeconds)}
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>

    {/* Warning Dialog for 1 project per wallet limit */}
    <Dialog open={showLimitWarning} onOpenChange={setShowLimitWarning}>
      <DialogContent className="bg-primary-900 border-amber-500/20 text-white max-w-xs p-0 overflow-hidden rounded-xl shadow-xl">
        {/* Top decorative banner */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 p-3 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-amber-400/20 blur-sm"></div>
          <div className="absolute right-12 bottom-1 w-6 h-6 rounded-full bg-amber-400/30 blur-sm"></div>
          <div className="absolute left-12 top-6 w-3 h-3 rounded-full bg-amber-400/30 blur-sm"></div>
          <div className="relative flex items-center gap-2.5">
            <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full flex items-center justify-center border border-white/30">
              <img src="/images/logos/Ivory.png" alt="Ivory Logo" className="h-4 w-4 object-contain" />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm tracking-wide">
                <FormattedMessage
                  id="dashboard.projectLimit.title"
                  defaultMessage="Beta Testing Limit"
                />
              </h2>
              <p className="text-amber-100/80 text-xs">Ivory Platform</p>
            </div>
          </div>
        </div>
        
        <div className="px-3.5 py-3 bg-gradient-to-b from-primary-800 to-primary-900">
          <div className="space-y-3">
            {/* Important message first */}
            <div className="bg-amber-500/10 rounded-xl p-3 border border-amber-500/30 flex gap-2.5 items-center">
              <div className="bg-amber-500 p-1.5 rounded-full flex-shrink-0 flex items-center justify-center">
                <Trash2 className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="text-white text-xs font-medium leading-relaxed">
                <FormattedMessage
                  id="dashboard.projectLimit.deleteInfo"
                  defaultMessage="If you encounter issues, you can"
                />{" "}<TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="text-amber-400 font-semibold cursor-help border-b border-dashed border-amber-400/50">
                        <FormattedMessage
                          id="dashboard.projectLimit.deleteProject"
                          defaultMessage="delete your existing project"
                        />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="bg-amber-600 text-white text-xs p-2 max-w-[200px]">
                      <FormattedMessage
                        id="dashboard.projectLimit.deleteHelp"
                        defaultMessage="You can delete your project from the dashboard by selecting the project and clicking the delete option."
                      />
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>{" "}
                <FormattedMessage
                  id="dashboard.projectLimit.createNew"
                  defaultMessage="and create a new one"
                />
              </p>
            </div>
            
            {/* Key points with icons */}
            <div className="grid grid-cols-2 gap-2.5 mt-1">
              <div className="flex gap-2 items-center bg-primary-800/50 rounded-lg p-2 border border-secondary-800">
                <div className="bg-amber-500 p-1.5 rounded-full flex-shrink-0 flex items-center justify-center">
                  <Wallet className="h-3 w-3 text-white" />
                </div>
                <p className="text-secondary-200 text-xs">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium text-amber-400 cursor-help border-b border-dashed border-amber-400/50">
                          <FormattedMessage
                            id="dashboard.projectLimit.oneProject"
                            defaultMessage="1 project per wallet"
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="bg-amber-600 text-white text-xs p-2 max-w-[200px]">
                        <FormattedMessage
                          id="dashboard.projectLimit.walletLimit"
                          defaultMessage="During beta testing, each wallet address is limited to creating one project at a time."
                        />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>{" "}
                  <FormattedMessage
                    id="dashboard.projectLimit.duringBeta"
                    defaultMessage="during beta testing"
                  />
                </p>
              </div>
              
              <div className="flex gap-2 items-center bg-primary-800/50 rounded-lg p-2 border border-secondary-800">
                <div className="bg-amber-500 p-1.5 rounded-full flex-shrink-0 flex items-center justify-center">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <p className="text-secondary-200 text-xs">
                  <FormattedMessage
                    id="dashboard.projectLimit.limitRefreshes"
                    defaultMessage="Limit refreshes each"
                  />{" "}
                  <a 
                    href="https://docs.wal.app/print.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-medium text-amber-400 cursor-pointer border-b border-dashed border-amber-400/50 hover:text-amber-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FormattedMessage
                      id="dashboard.projectLimit.epoch"
                      defaultMessage="epoch"
                    />
                  </a>{" "}
                  <FormattedMessage
                    id="dashboard.projectLimit.fairAccess"
                    defaultMessage="to ensure fair access"
                  />
                </p>
              </div>
            </div>
            
            <div className="bg-primary-800/30 rounded-lg p-2.5 text-xs text-secondary-300 border border-secondary-800/50">
              <p className="leading-relaxed">
                <FormattedMessage
                  id="dashboard.projectLimit.description"
                  defaultMessage="During our beta testing phase, we're limiting each wallet to one project per epoch to ensure everyone gets a chance to try the platform. Thank you for your understanding and participation!"
                />
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-3.5 pb-3.5 pt-0 bg-primary-900">
          <Button
            variant="default"
            onClick={() => setShowLimitWarning(false)}
            className="bg-amber-600 hover:bg-amber-500 text-white w-full py-2 text-xs font-medium rounded-lg shadow-lg shadow-amber-900/30 transition-all duration-200 hover:shadow-amber-900/50 hover:translate-y-[-1px] border border-amber-500/30"
          >
            <FormattedMessage
              id="dashboard.projectLimit.understand"
              defaultMessage="I Understand"
            />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  )
}

export default DashboardHeader
