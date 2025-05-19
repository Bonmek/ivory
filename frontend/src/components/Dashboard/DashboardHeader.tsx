import { motion } from 'framer-motion'
import { Search, Filter, ChevronDown, RefreshCw, PlusCircle, MoreVertical, SlidersHorizontal, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  const [searchExpanded, setSearchExpanded] = useState(false);
  
  // ปิดช่องค้นหาเมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container') && searchExpanded) {
        setSearchExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchExpanded]);
  
  // ปิดช่องค้นหาเมื่อกดปุ่ม Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && searchExpanded) {
        setSearchExpanded(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [searchExpanded]);
  
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
      className="flex flex-row flex-wrap items-center justify-between gap-2 mb-4 sm:mb-6 md:mb-8 px-2 sm:px-0"
    >
      <motion.h1
        className="text-2xl sm:text-3xl font-bold text-white font-pixel order-1 sm:order-1 text-left mb-0 mr-auto"
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
        className="flex flex-row flex-wrap items-center justify-end gap-2 order-2 flex-1 min-w-0"
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
        <motion.div className="relative order-none flex-shrink-0 search-container">
          {/* แสดงเฉพาะไอคอนแว่นขยายบนมือถือ */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSearchExpanded(true)}
            className="md:hidden h-9 w-9 bg-primary-900/80 border-secondary-500/20 text-white hover:bg-secondary-500/10"
          >
            <Search className="h-4 w-4 text-secondary-400" />
          </Button>
          
          {/* ช่องค้นหาแบบเต็มสำหรับ desktop */}
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
        
        {/* Modal ช่องค้นหาลอยตรงกลางจอสำหรับมือถือ */}
        {searchExpanded && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:hidden">
            <motion.div 
              className="w-full max-w-md bg-primary-800 rounded-lg shadow-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-white">
                    <FormattedMessage id="dashboard.search" defaultMessage="Search Projects" />
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchExpanded(false)}
                    className="h-8 w-8 text-secondary-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 z-10 pointer-events-none" />
                  <Input
                    type="search" 
                    placeholder={intl.formatMessage({ id: 'dashboard.searchPlaceholder', defaultMessage: 'Enter project name...' })}
                    className="w-full pl-10 bg-primary-900/80 border-secondary-500/20 text-white placeholder:text-secondary-400 backdrop-blur-sm h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setSearchExpanded(false)}
                    className="text-secondary-300 hover:text-white"
                  >
                    <FormattedMessage id="common.cancel" defaultMessage="Cancel" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSearchExpanded(false)}
                    className="bg-secondary-500/20 text-secondary-500 border-secondary-500/40 hover:bg-secondary-500/30"
                  >
                    <FormattedMessage id="common.search" defaultMessage="Search" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        
        {/* ปุ่ม Deploy Site */}
        {!hasProjects && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="order-none flex-shrink-0"
          >
            <Button
              onClick={() => window.location.href = '/create-website'}
              variant="outline"
              className="w-full sm:w-auto bg-primary-800 text-white font-medium flex items-center gap-1.5 border-secondary-500/40 hover:bg-primary-700 hover:border-secondary-500/70"
            >
              <PlusCircle className="h-4 w-4 text-secondary-500" />
              <FormattedMessage id="dashboard.createNew" defaultMessage="Deploy Site" />
            </Button>
          </motion.div>
        )}

        {/* ปุ่ม Actions ที่รวมทุกอย่างเข้าด้วยกัน */}
        <DropdownMenu>

          <DropdownMenuTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                variant="outline"
                className="bg-primary-900/80 border-secondary-500/20 text-white hover:bg-secondary-500/10 hover:text-secondary-500 h-9 w-9"
                title={intl.formatMessage({ id: 'dashboard.actions' }, { defaultMessage: 'Actions' })}
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
              <FormattedMessage id="dashboard.sort.title" defaultMessage="Sort By" />
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => setSortType('latest')}
                className={
                  sortType === 'latest'
                    ? 'bg-secondary-500/10 text-secondary-500 font-bold'
                    : ''
                }
              >
                <Filter className="h-4 w-4 mr-2" />
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
                <Filter className="h-4 w-4 mr-2" />
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
                <Filter className="h-4 w-4 mr-2" />
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
                <Filter className="h-4 w-4 mr-2" />
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
                <Filter className="h-4 w-4 mr-2" />
                <FormattedMessage id="dashboard.sort.remainingHigh" />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            {/* เส้นแบ่งสำหรับมือถือเท่านั้น */}
            <div className="md:hidden">
              <DropdownMenuSeparator />
              
              {/* Refresh Option สำหรับมือถือเท่านั้น */}
              <DropdownMenuItem
                onClick={onRefresh}
                disabled={isRefreshing}
                className="md:hidden"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <FormattedMessage id="dashboard.refresh" defaultMessage="Refresh Data" />
                {lastRefreshTime && (
                  <span className="text-xs text-secondary-400 ml-auto">
                    {lastRefreshTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
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
                >
                  <FormattedMessage id="dashboard.clearFilters" defaultMessage="Clear Filters" />
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* ปุ่ม Refresh สำหรับ PC */}
        <div className="hidden md:flex items-center gap-2">
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
      </motion.div>
    </motion.div>
  )
}

export default DashboardHeader 