import { memo, useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useWalletKit } from '@mysten/wallet-kit'
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
  Loader2,
  Key,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSuiData } from '@/hooks/useSuiData'
import apiClient from '@/lib/axiosConfig'
import axios from 'axios'
import { FormattedMessage, useIntl } from 'react-intl';
import { ProjectCardProps } from '@/types/project'
import { linkSuinsToSite } from '@/utils/suinsUtils'

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

const calculateTimeBetween = (date1: Date, date2: Date) => {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days, hours, minutes, totalMs: diffTime }
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
    const intl = useIntl()
    const remaining = calculateTimeBetween(new Date(), project.expiredDate)
    const [startDateOpen, setStartDateOpen] = useState(false)
    const [expiredDateOpen, setExpiredDateOpen] = useState(false)
    const [remainingOpen, setRemainingOpen] = useState(false)
    const [errorOpen, setErrorOpen] = useState(false)
    const [statusOpen, setStatusOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [buildTime, setBuildTime] = useState<number>(() => {
      if (project.status === 0) {
        const startTime = new Date(project.startDate).getTime()
        const now = Date.now()
        return Math.floor((now - startTime) / 1000)
      }
      return 0
    })
    const [dots, setDots] = useState('.')
    const [selectedSuins, setSelectedSuins] = useState<string>('')
    const [otherSuins, setOtherSuins] = useState<string>('')
    const { suins, isLoadingSuins, refetchSuiNS } = useSuiData(userAddress)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLinking, setIsLinking] = useState(false)
    const [open, setOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

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

    useEffect(() => {
      if (project.status !== 0) return
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + '.' : '.'))
      }, 400)
      return () => clearInterval(interval)
    }, [project.status])

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
        case 3:
          return {
            card: 'bg-primary-900/90 hover:bg-primary-900 border-gray-500/10 hover:border-gray-500/30',
            text: 'text-gray-400',
            badge: 'bg-gray-500/20 text-gray-300',
            link: 'text-gray-300 hover:text-gray-400',
            date: 'text-gray-300',
            dropdown: 'text-gray-300 hover:text-white hover:bg-gray-500/20',
            avatar: 'border-gray-500/50',
            shadow: 'shadow-gray-500/5',
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

    const { signAndExecuteTransactionBlock } = useWalletKit()

    const colors = getStatusColor(project.status)

    const handleCopy = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        toast.success(<FormattedMessage id="projectCard.copyToClipboard" />)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      } catch (err) {
        console.error('Failed to copy text: ', err)
        toast.error(<FormattedMessage id="projectCard.failedToCopy" />)
      }
    }

    const handleLinkSuins = async () => {
      if (!selectedSuins) {
        toast.error(<FormattedMessage id="projectCard.pleaseSelect" />)
        return
      }

      if (!userAddress) {
        toast.error(<FormattedMessage id="projectCard.connectWallet" />, {
          description: intl.formatMessage({
            id: 'projectCard.connectWalletDesc',
          }),
        })
        return
      }

      if (!userAddress) {
        toast.error('Please connect your wallet first', {
          className: 'bg-red-900 border-red-500/20 text-white',
          description: 'Click the wallet button in the top right to connect',
        })
        return
      }

      try {
        setIsLinking(true)

        // Get the NFT ID for the selected SUINS
        const selectedSuinsData = suins.find(
          (s) => s.data?.content?.fields?.domain_name === selectedSuins,
        )
        if (!selectedSuinsData?.data?.objectId) {
          throw new Error('SUINS NFT not found')
        }

        if (!userAddress) {
          throw new Error(
            'Wallet address not found. Please connect your wallet.',
          )
        }

        const result = await linkSuinsToSite(
          selectedSuinsData.data.objectId,
          project.siteId || '',
          userAddress,
          signAndExecuteTransactionBlock,
          process.env.REACT_APP_SUI_NETWORK as 'mainnet' | 'testnet',
        )
        const response = await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_SET_ATTRIBUTES!}?object_id=${project.parentId}&sui_ns=${selectedSuins}`,
        )
        setOpen(false)
        if (result.status === 'success') {
          toast.success(<FormattedMessage id="projectCard.suinsLinked" />, {
            description: intl.formatMessage({
              id: 'projectCard.suinsLinkedDesc',
            }),
            duration: 5000,
          })
          if (result.status === 'success' && response.status === 200) {
            onRefetch()
          }
        }
      } catch (error: any) {
        console.error('Error linking SUINS:', error)
        toast.error(
          error.message || <FormattedMessage id="projectCard.failedToLink" />,
          {
            description: intl.formatMessage({
              id: 'projectCard.failedToLinkDesc',
            }),
            duration: 5000,
          },
        )
      } finally {
        setIsLinking(false)
      }
    }

    const handleDeleteSite = async () => {
      if (!project.parentId) {
        toast.error('Project Parent ID is missing. Cannot delete site.')
        return
      }
      try {
        setIsDeleting(true)
        const response = await apiClient.delete(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_DELETE_WEBSITE!}?object_id=${project.parentId}`,
        )
        if (response.status === 200) {
          toast.success(<FormattedMessage id="projectCard.siteDeleted" />, {
            description: intl.formatMessage({
              id: 'projectCard.siteDeletedDesc',
            }),
            duration: 5000,
          })
          setDeleteDialogOpen(false)
          onRefetch()
        }
      } catch (error: any) {
        console.error('Error deleting site:', error)
        toast.error(
          error.response?.data?.message || (
            <FormattedMessage id="projectCard.failedToDelete" />
          ),
        )
      } finally {
        setIsDeleting(false)
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

    const handleGenerateSiteId = async () => {
      setIsGenerating(true)
      try {
        await apiClient.put(`${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_ADD_SITE_ID!}?object_id=${project.parentId}`)
        toast.success('Site ID generated successfully', {
          description: 'Please wait a moment',
          duration: 5000,
        })
        setGenerateDialogOpen(false)
        onRefetch()
      } catch (error: any) {
        toast.error(error?.message || 'Failed to generate Site ID')
      } finally {
        setIsGenerating(false)
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
            {/* Dropdown Menu: Top Right */}
            <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
              {!project.suins &&
                project.status === 1 &&
                project.siteId &&
                project.site_status === 1 && (
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button
                        className={`h-8 px-3 flex items-center justify-center rounded-full ${colors.dropdown} transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer`}
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
                          Select your SUINS name to link it with this project
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          {isLoadingSuins ? (
                            <div className="flex items-center justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin text-secondary-400" />
                            </div>
                          ) : (
                            <>
                              <div className="flex gap-2 items-center">
                                <Select
                                  value={selectedSuins}
                                  onValueChange={setSelectedSuins}
                                >
                                  <SelectTrigger className="bg-primary-800 border-secondary-500/20 text-white w-full flex-1">
                                    <SelectValue placeholder="Select SUINS domain" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-primary-800 border-secondary-500/20 text-white">
                                    {suins.map((sui) => {
                                      const domainName =
                                        sui.data?.content?.fields
                                          ?.domain_name || ''
                                      const displayName = domainName.endsWith(
                                        '.sui',
                                      )
                                        ? domainName.slice(0, -4)
                                        : domainName

                                      return (
                                        <SelectItem
                                          key={sui.data?.objectId}
                                          value={domainName}
                                          className="hover:bg-primary-700"
                                        >
                                          {displayName}
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={handleRefreshSuins}
                                  variant="outline"
                                  className="border-secondary-500/20 text-white hover:bg-primary-800 ${isLoadingSuins || isRefreshing ? '' : 'cursor-pointer'}"
                                  disabled={isLoadingSuins || isRefreshing}
                                >
                                  {isRefreshing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>

                            </>
                          )}
                        </div>
                        {project.status === 1 && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleLinkSuins()}
                              className="bg-secondary-500 hover:bg-secondary-600 text-white flex-1 relative ${isLinking || isLoadingSuins || !selectedSuins ? '' : 'cursor-pointer'}"
                              disabled={
                                isLinking ||
                                isLoadingSuins ||
                                !selectedSuins
                              }
                            >
                              {isLinking ? (
                                <div className="flex items-center justify-center">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span>Linking SUINS...</span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center">
                                  <Link className="h-4 w-4 mr-2" />
                                  <span>Link SUINS</span>
                                </div>
                              )}
                            </Button>
                          </div>
                        )}
                        {project.status !== 1 && (
                          <div className="text-sm text-white/60 italic">
                            SUINS linking is only available for active projects
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              {project.status !== 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`h-8 w-8 flex items-center justify-center rounded-full ${colors.dropdown} transition-all duration-200 hover:scale-110 active:scale-95 ${project.status === 3 ? '' : 'cursor-pointer'}`}
                      disabled={project.status === 3}
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
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400 focus:bg-primary-800 cursor-pointer"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete site</span>
                      </DropdownMenuItem>
                    </>
                  ) : project.status === 0 ? (
                    <>
                    </>
                  ) : project.status === 3 ? (
                    <>
                      <div className="px-4 py-2 text-purple-400 flex items-center gap-2 text-sm">
                        <Loader2 className="ml-1 h-3 w-3 text-purple-300 animate-spin" />
                        <FormattedMessage
                          id="projectCard.deleting"
                          defaultMessage="Deleting project..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        className="focus:bg-primary-800 opacity-60 cursor-not-allowed flex items-center justify-between"
                        disabled
                      >
                        <div className="flex items-center">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          <span>
                            <FormattedMessage id="projectCard.updateSite" />
                          </span>
                        </div>
                        <div className="ml-1 text-[9px] px-1 py-0 leading-tight rounded-sm bg-secondary-500/10 text-secondary-400/80 whitespace-nowrap">
                          <FormattedMessage id="projectCard.comingSoon" />
                        </div>
                      </DropdownMenuItem>
                      {!project.siteId && (
                        <DropdownMenuItem
                          className={`focus:bg-primary-800 ${project.site_status === 0 ? '' : 'cursor-pointer'}`}
                          onClick={() => setGenerateDialogOpen(true)}
                          disabled={project.site_status === 0}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          <span>
                            <FormattedMessage id="projectCard.generateSiteId" />
                          </span>
                          {isGenerating && (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin text-secondary-400" />
                          )}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="focus:bg-primary-800 opacity-60 cursor-not-allowed flex items-center justify-between"
                        disabled
                      >
                        <div className="flex items-center">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          <span>
                            <FormattedMessage id="projectCard.extendSite" />
                          </span>
                        </div>
                        <div className="ml-1 text-[9px] px-1 py-0 leading-tight rounded-sm bg-secondary-500/10 text-secondary-400/80 whitespace-nowrap">
                          <FormattedMessage id="projectCard.comingSoon" />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="focus:bg-primary-800 opacity-60 cursor-not-allowed flex items-center justify-between"
                        disabled
                      >
                        <div className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          <span>
                            <FormattedMessage id="projectCard.transferOwnership" />
                          </span>
                        </div>
                        <div className="ml-1 text-[9px] px-1 py-0 leading-tight rounded-sm bg-secondary-500/10 text-secondary-400/80 whitespace-nowrap">
                          <FormattedMessage id="projectCard.comingSoon" />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-secondary-500/20" />
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400 focus:bg-primary-800 cursor-pointer"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        <span>Delete site</span>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              )}
            </div>

            {/* Left: Project Image */}
            <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              <img
                src={
                  project.status === 0
                    ? '/images/walrus_building.png'
                    : project.status === 2
                      ? '/images/walrus_fail.png'
                      : project.status === 3
                        ? '/images/walrus_fail.png'
                        : '/images/walrus.png'
                }
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
                {project.status === 3 ? (
                  <div
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center gap-1`}
                  >
                    <FormattedMessage
                      id="projectCard.deleting"
                      defaultMessage="Deleting"
                    />
                    <span className="ml-1">
                      <span className="inline-block w-2 h-2 bg-purple-300 rounded-full animate-pulse" />
                    </span>
                  </div>
                ) : project.status === 2 && project.client_error_description ? (
                  <Popover open={errorOpen} onOpenChange={setErrorOpen}>
                    <PopoverTrigger asChild>
                      <div
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center gap-1 cursor-pointer hover:bg-red-500/30 transition-colors duration-200`}
                        onMouseEnter={() => setErrorOpen(true)}
                        onMouseLeave={() => setErrorOpen(false)}
                        title="Click to view error details"
                      >
                        <FormattedMessage id="projectCard.failed" />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-3 h-3"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 p-3 bg-primary-900 border-red-500/20 text-white backdrop-blur-sm"
                      onMouseEnter={() => setErrorOpen(true)}
                      onMouseLeave={() => setErrorOpen(false)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-red-400"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-red-400 mb-1">
                            <FormattedMessage id="projectCard.deploymentFailed" />
                          </div>
                          <div className="text-xs text-white/80 leading-relaxed">
                            {project.client_error_description}
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : project.status === 0 ? (
                  <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                    <PopoverTrigger asChild>
                      <div
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center gap-1 cursor-help`}
                        onMouseEnter={() => setStatusOpen(true)}
                        onMouseLeave={() => setStatusOpen(false)}
                      >
                        <FormattedMessage id="projectCard.building" />
                        <span className="ml-1">
                          <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                        </span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 p-3 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                      sideOffset={5}
                      onMouseEnter={() => setStatusOpen(true)}
                      onMouseLeave={() => setStatusOpen(false)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-4 h-4 text-yellow-400"
                          >
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-yellow-400 mb-1">
                            <FormattedMessage id="projectCard.buildingInProgress" />
                          </div>
                          <div className="text-xs text-white/80 leading-relaxed">
                            <FormattedMessage id="projectCard.buildingDesc" />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center`}
                  >
                    <FormattedMessage id="projectCard.active" />
                  </div>
                )}
              </div>

              {/* Project Link */}
              <div className="flex items-center text-sm group-hover:translate-x-0.5 transition-transform duration-200">
                {project.suins ? (
                  <a
                    href={`https://${project.suins?.endsWith('.sui') ? project.suins.slice(0, -4) : project.suins}.wal.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center h-[28px] hover:underline truncate transition-colors duration-200 text-secondary-200/80 hover:text-secondary-100/90 max-w-[340px] cursor-pointer"
                  >
                    {project.suins?.endsWith('.sui')
                      ? project.suins.slice(0, -4)
                      : project.suins}
                    .wal.app
                    <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-200">
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </span>
                  </a>
                ) : project.showcase_url ? (
                  <a
                    href={`https://kursui.wal.app/${project.showcase_url}/index.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center h-[24px] hover:underline transition-colors duration-200 text-secondary-200/80 hover:text-secondary-100/90 max-w-[340px] cursor-pointer"
                    title={`https://kursui.wal.app/${project.showcase_url}/index.html`}
                  >
                    <span className="flex-shrink-0">https://</span>
                    <span className="truncate" style={{ minWidth: 0 }}>
                      kursui.wal.app/{project.showcase_url}/index.html
                    </span>
                    <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-200">
                      <ExternalLink className="h-4 w-4 flex-shrink-0" />
                    </span>
                  </a>
                ) : null}
              </div>

              {/* Site ID with Copy Button */}
              {project.status === 1 && !project.suins && (
                <div className="flex items-center text-xs group-hover:translate-x-0.5 transition-transform duration-200 min-h-[20px]">
                  {project.site_status === 0 ? (
                    <span
                      className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-yellow-400/10 border border-yellow-300/30 shadow-sm text-yellow-200 text-xs animate-pulse"
                      style={{ minHeight: 28 }}
                    >
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-300" />
                      <span>
                        <FormattedMessage id="projectCard.generatingSiteId" />
                      </span>
                    </span>
                  ) : project.site_status === 2 ? (
                    <span
                      className="flex items-center gap-2 px-2 py-0.5 rounded-md bg-red-400/10 border border-red-400/30 shadow-sm text-red-300 text-xs"
                      style={{ minHeight: 28 }}
                    >
                      <svg
                        className="h-4 w-4 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                      <span>
                        <FormattedMessage id="projectCard.failedToGenerateSiteId" />
                      </span>
                    </span>
                  ) : project.siteId && project.siteId.trim() !== '' ? (
                    <>
                      <span className="truncate mr-2 text-white/80">
                        Site ID:{' '}
                        {project.siteId && project.siteId.trim() !== ''
                          ? `${project.siteId.slice(0, 6)}...${project.siteId.slice(-4)}`
                          : 'N/A'}
                      </span>
                      <button
                        onClick={() => handleCopy(project.siteId!)}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors duration-200 cursor-pointer"
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-green-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </>
                  ) : null}
                </div>
              )}

              {/* Dates Row */}
              <div className="flex flex-row w-full gap-x-3 sm:gap-x-6 mt-auto min-h-[48px] opacity-80 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="text-[10px] text-white/50 font-medium truncate">
                    <FormattedMessage id="projectCard.startDate" />
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
                    <FormattedMessage id="projectCard.expiredDate" />
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
                      <FormattedMessage id="projectCard.buildTime" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 min-h-[20px]">
                      <Timer className="h-3.5 w-3.5 text-yellow-400" />
                      {buildTime === 0 ? (
                        <span className="animate-pulse font-medium text-yellow-300">
                          <FormattedMessage id="projectCard.loading" />
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-yellow-300">
                          {formatBuildTime(buildTime)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-center border-l border-white/10 pl-2 sm:pl-3">
                  <div className="text-[10px] text-white/50 font-medium truncate">
                    <FormattedMessage id="projectCard.remaining" />
                  </div>
                  <Popover open={remainingOpen} onOpenChange={setRemainingOpen}>
                    <PopoverTrigger asChild>
                      <div
                        className={`text-sm font-bold mt-0.5 truncate cursor-help group-hover:translate-x-0.5 transition-transform duration-200 ${colors.text}`}
                        onMouseEnter={() => setRemainingOpen(true)}
                        onMouseLeave={() => setRemainingOpen(false)}
                      >
                        {remaining.days === 0 ? (
                          <>
                            {remaining.hours}h {remaining.minutes}m
                          </>
                        ) : (
                          <>
                            {remaining.days}{' '}
                            <FormattedMessage id="projectCard.days" />
                          </>
                        )}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-2 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                      onMouseEnter={() => setRemainingOpen(true)}
                      onMouseLeave={() => setRemainingOpen(false)}
                    >
                      <div className="text-sm">
                        <FormattedMessage
                          id="projectCard.expiresOn"
                          values={{ date: formatDate(project.expiredDate) }}
                          defaultMessage="Expires on {date}"
                        />
                        {remaining.days === 0 && (
                          <div className="mt-1 text-xs text-secondary-300">
                            {remaining.hours} hours and {remaining.minutes} minutes remaining
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="bg-primary-900 border-red-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-red-400">Delete Site</DialogTitle>
              <DialogDescription className="text-white/60">
                Are you sure you want to delete this site? This action cannot be
                undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteSite}
                className="bg-red-500 hover:bg-red-600 text-white ${isDeleting ? '' : 'cursor-pointer'}"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Trash className="h-4 w-4 mr-2" />
                    <span>Delete Site</span>
                  </div>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate Site ID Dialog */}
        <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
          <DialogContent className="bg-primary-900 border-secondary-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-secondary-400">
                <FormattedMessage id="projectCard.generateSiteId" />
              </DialogTitle>
              <DialogDescription className="text-white/60">
                <FormattedMessage id="projectCard.generateSiteIdDesc" />
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setGenerateDialogOpen(false)}
                className="border-white/20 text-white hover:bg-white/10 ${isGenerating ? '' : 'cursor-pointer'}"
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateSiteId}
                className="bg-secondary-500 hover:bg-secondary-600 text-white ${isGenerating ? '' : 'cursor-pointer'}"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <FormattedMessage id="projectCard.generating" />
                  </>
                ) : (
                  <FormattedMessage id="projectCard.generate" />
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Toaster />
      </>
    )
  },
)

export default ProjectCard
