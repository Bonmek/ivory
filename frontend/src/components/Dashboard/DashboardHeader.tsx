import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, RefreshCw, PlusCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FormattedMessage, useIntl } from 'react-intl'

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
}: DashboardHeaderProps) => {
  const intl = useIntl();
  
  const sortTypeLabel = {
    latest: intl.formatMessage({ id: 'dashboard.sort.latest' }),
    'name-az': intl.formatMessage({ id: 'dashboard.sort.nameAZ' }),
    'name-za': intl.formatMessage({ id: 'dashboard.sort.nameZA' }),
    'remaining-low': intl.formatMessage({ id: 'dashboard.sort.remainingLow' }),
    'remaining-high': intl.formatMessage({ id: 'dashboard.sort.remainingHigh' }),
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-8"
    >
      <motion.h1
        className="text-3xl font-bold text-white font-pixel"
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
        className="flex flex-col space-y-4 md:flex-row md:space-y-0 gap-2 items-center"
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
        <motion.div
          className="relative"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 z-10 pointer-events-none" />
          <Input
            type="search" 
            placeholder={intl.formatMessage({ id: 'dashboard.search' })}
            className="w-full pl-10 md:w-[250px] bg-primary-900/80 border-secondary-500/20 text-white placeholder:text-secondary-400 backdrop-blur-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </motion.div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant="outline"
                className={`
                  w-full md:w-auto flex items-center gap-2
                  bg-primary-900/80 border-secondary-500/20 text-white
                  hover:bg-secondary-500/10 hover:text-secondary-500
                  transition-all duration-150
                  ${sortType !== 'latest' ? 'border-secondary-500 text-secondary-500' : ''}
                `}
              >
                <Filter className="h-4 w-4" />
                <span className="font-semibold">{sortTypeLabel[sortType as keyof typeof sortTypeLabel]}</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm min-w-[220px]"
          >
            <DropdownMenuItem
              onClick={() => setSortType('latest')}
              className={
                sortType === 'latest'
                  ? 'bg-secondary-500/10 text-secondary-500 font-bold'
                  : ''
              }
            >
              <FormattedMessage id="dashboard.sort.latest" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortType('name-az')}
              className={
                sortType === 'name-az'
                  ? 'bg-secondary-500/10 text-secondary-500 font-bold'
                  : ''
              }
            >
              <FormattedMessage id="dashboard.sort.nameAZ" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortType('name-za')}
              className={
                sortType === 'name-za'
                  ? 'bg-secondary-500/10 text-secondary-500 font-bold'
                  : ''
              }
            >
              <FormattedMessage id="dashboard.sort.nameZA" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortType('remaining-low')}
              className={
                sortType === 'remaining-low'
                  ? 'bg-secondary-500/10 text-secondary-500 font-bold'
                  : ''
              }
            >
              <FormattedMessage id="dashboard.sort.remainingLow" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setSortType('remaining-high')}
              className={
                sortType === 'remaining-high'
                  ? 'bg-secondary-500/10 text-secondary-500 font-bold'
                  : ''
              }
            >
              <FormattedMessage id="dashboard.sort.remainingHigh" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <motion.div
          whileHover={!hasProjects ? { scale: 1.05 } : {}}
          whileTap={!hasProjects ? { scale: 0.95 } : {}}
          className="mr-2"
        >
          <Button
            onClick={() => !hasProjects && (window.location.href = '/create-website')}
            variant="outline"
            disabled={hasProjects}
            className={`bg-primary-800 text-white font-medium flex items-center gap-1.5 border-secondary-500/40 ${!hasProjects ? 'hover:bg-primary-700 hover:border-secondary-500/70' : 'opacity-50 cursor-not-allowed'}`}
            title={hasProjects ? intl.formatMessage({ id: 'dashboard.limitReached' }, { defaultMessage: 'You can only have one project at a time' }) : ''}
          >
            <PlusCircle className="h-4 w-4 text-secondary-500" />
            <FormattedMessage id="dashboard.createNew" defaultMessage="Deploy Site" />
          </Button>
        </motion.div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="h-9 w-9 cursor-pointer"
            title={intl.formatMessage({ id: 'dashboard.refresh' }, { defaultMessage: 'Refresh data' })}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          {lastRefreshTime && (
            <span className="text-xs text-secondary-400">
              {intl.formatMessage(
                { id: 'dashboard.lastRefresh' },
                { 
                  defaultMessage: 'Last: {time}',
                  time: lastRefreshTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                }
              )}
            </span>
          )}
        </div>

        {(date || searchQuery) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              onClick={() => {
                setSearchQuery('')
                setDate(undefined)
              }}
              className="text-secondary-300 hover:text-white hover:bg-primary-800/50"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default DashboardHeader 