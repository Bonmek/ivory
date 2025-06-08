import { memo, useState, useEffect } from 'react'
import {
  useSignAndExecuteTransaction,
  useCurrentWallet,
} from '@mysten/dapp-kit'
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
  UserPlus,
  X,
  Shield,
  UserCog,
  Crown,
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
import { FormattedMessage, useIntl } from 'react-intl'
import {
  Project,
  ProjectCardProps,
  MemberPermissions,
  ProjectStatus,
  ProjectType,
} from '@/types/project'
import { ManageMembersModal } from './ManageMembersModal'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { GenerateSiteIdDialog } from './GenerateSiteIdDialog'
import { TransferOwnershipDialog } from './TransferOwnershipDialog'
import {
  formatDate,
  formatShortDate,
  calculateTimeBetween,
  formatBuildTime,
  getStatusColor,
  getUserPermissions,
} from '@/utils/projectUtils'
import { useNavigate } from 'react-router'
import { createMemberString } from '@/utils/memberUtils'
import { useMemberManagement } from '@/hooks/useMemberManagement'
import { useSiteManagement } from '@/hooks/useSiteManagement'
import { useOwnershipTransfer } from '@/hooks/useOwnershipTransfer'
import { useSuinsManagement } from '@/hooks/useSuinsManagement'

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
    const signAndExecute = useSignAndExecuteTransaction()
    const { currentWallet } = useCurrentWallet()
    const { connect } = useWalletKit()
    const navigate = useNavigate()
    const {
      addMember,
      removeMember,
      updateMemberPermissions,
      isAddingMember,
      isRemovingMember,
      isUpdatingPermissions,
    } = useMemberManagement()
    const { transferOwnership, isProcessing } = useOwnershipTransfer(
      userAddress || '',
    )
    const { generateSiteId, deleteSite, isGenerating, isDeleting } =
      useSiteManagement()
    const { linkSuinsToSite, isLinking, estimatedFee, estimateTransactionFee } =
      useSuinsManagement(userAddress || '')
    const { signAndExecuteTransactionBlock } = useWalletKit()

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
    const { suins, isLoadingSuins, refetchSuiNS } = useSuiData(
      userAddress || '',
    )
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [open, setOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
    const [manageMembersOpen, setManageMembersOpen] = useState(false)

    const [removingMember, setRemovingMember] = useState<string | null>(null)
    const [transferOwnershipOpen, setTransferOwnershipOpen] = useState(false)

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

    useEffect(() => {
      if (selectedSuins && project.parentId) {
        const selectedSuinsData = suins.find(
          (s) => s.data?.content?.fields?.domain_name === selectedSuins,
        )
        if (selectedSuinsData?.data?.objectId) {
          estimateTransactionFee(
            {
              objectId: selectedSuinsData.data.objectId,
              name: selectedSuins
            },
            project.parentId,
            process.env.REACT_APP_SUI_NETWORK as 'mainnet' | 'testnet'
          )
        }
      }
    }, [selectedSuins, project.parentId])

    const colors = getStatusColor(project.status)
    const userPermissions = getUserPermissions(userAddress, project)

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

      try {
        const selectedSuinsData = suins.find(
          (s) => s.data?.content?.fields?.domain_name === selectedSuins,
        )
        if (!selectedSuinsData?.data?.objectId) {
          throw new Error('SUINS NFT not found')
        }

        const result = await linkSuinsToSite(
          {
            objectId: selectedSuinsData.data.objectId,
            name: selectedSuins
          },
          project.parentId || '',
          userAddress,
          signAndExecuteTransactionBlock,
          process.env.REACT_APP_SUI_NETWORK as 'mainnet' | 'testnet',
        )

        if (result.status === 'success') {
          setOpen(false)
          onRefetch()
        }
      } catch (error: any) {
        console.error('Error in handleLinkSuins:', error)
      }
    }

    const handleGenerateSiteId = async (): Promise<void> => {
      if (!project.parentId) {
        toast.error('Project ID is missing')
        return
      }
      try {
        await generateSiteId(project.parentId)
        setGenerateDialogOpen(false)
      } catch (error: any) {
        console.error('Error generating site ID:', error)
      }
    }

    const handleDeleteSite = async (): Promise<void> => {
      if (!project.parentId) {
        toast.error('Project Parent ID is missing. Cannot delete site.')
        return
      }
      try {
        await deleteSite(project.parentId)
        setDeleteDialogOpen(false)
      } catch (error: any) {
        console.error('Error deleting site:', error)
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

    return (
      <div className="flex flex-col">
        <div
          key={project.id}
          className="rounded-lg overflow-hidden relative h-full group transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
          onMouseEnter={() => onHoverStart(project.id)}
          onMouseLeave={() => onHoverEnd()}
        >
          {/* Project card content */}
          <Card
            className={`flex flex-row items-center p-3 sm:p-4 ${colors.card} ${colors.shadow} shadow-lg backdrop-blur-sm h-full min-h-[160px] relative transition-all duration-300`}
          >
            {/* Left: Project Image */}
            <div className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200 relative">
              <img
                src={
                  project.status === 0
                    ? '/images/walrus_building.png'
                    : project.status === 2
                      ? '/images/walrus_fail.png'
                      : project.status === 3
                        ? '/images/walrus_fail.png'
                        : project.type === ProjectType.ZIP
                          ? '/images/zip.png'
                          : '/images/walrus.png'
                }
                alt="project avatar"
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full ${
                  project.type === ProjectType.ZIP
                    ? 'p-3 sm:p-2 object-contain'
                    : 'object-cover'
                } border-2 ${colors.avatar} shadow transition-all duration-300 group-hover:scale-105`}
              />
            </div>

            {/* Middle: Project Info */}
            <div className="flex flex-col flex-1 min-w-0 ml-3 sm:ml-4 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
              {/* Project Name with Status */}
              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className={`font-bold text-base truncate group-hover:translate-x-0.5 transition-transform duration-200 ${colors.text}`}
                >
                  {project.name}
                </div>
                {project.type === ProjectType.ZIP && (
                  <div className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/20 text-blue-300 border border-blue-500/20">
                    <FormattedMessage id="projectCard.type.zip" />
                  </div>
                )}
                {project.status === 3 && (
                  <div
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center gap-1`}
                  >
                    <FormattedMessage id="projectCard.deleting" defaultMessage="Deleting" />
                    <span className="ml-1">
                      <span className="inline-block w-2 h-2 bg-purple-300 rounded-full animate-pulse" />
                    </span>
                  </div>
                )}
                {project.status === 2 && project.client_error_description && (
                  <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center gap-1`}>
                    <FormattedMessage id="projectCard.failed" />
                  </div>
                )}
                {project.status === 0 && (
                  <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center gap-1`}>
                    <FormattedMessage id="projectCard.building" />
                    <span className="ml-1">
                      <span className="inline-block w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
                    </span>
                  </div>
                )}
                {project.status === 1 && (
                  <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${colors.badge} flex items-center`}>
                    <FormattedMessage id="projectCard.active" />
                  </div>
                )}
              </div>

              {/* Project Link */}
              <div className="flex flex-col">
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
                            {remaining.hours} hours and {remaining.minutes}{' '}
                            minutes remaining
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Dropdown Menu: Top Right */}
            <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
              {userAddress && project.owner && userAddress !== project.owner && (
                <div className="flex items-center px-2 py-1 rounded-full bg-primary-800/50 border border-secondary-500/10 shadow-sm backdrop-blur-sm">
                  <span className="text-[11px] font-medium text-secondary-300/70">
                    shared by{' '}
                  </span>
                  <span 
                    className="text-[11px] font-medium text-emerald-400/80 hover:text-emerald-400 cursor-pointer ml-1 transition-colors duration-200" 
                    onClick={() => handleCopy(project.owner)} 
                    title="Click to copy address"
                  >
                    {`${project.owner.slice(0, 4)}...${project.owner.slice(-4)}`}
                  </span>
                </div>
              )}

              {!project.suins &&
                project.status === 1 &&
                project.siteId &&
                project.site_status === 1 &&
                userPermissions?.setSuins && (
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
                            <div className="flex flex-col gap-2">
                              <div className="h-9 w-full rounded-md bg-primary-800/50 animate-pulse" />
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
                                  className="border-secondary-500/20 text-white hover:bg-primary-800"
                                  disabled={isLoadingSuins || isRefreshing}
                                >
                                  {isRefreshing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                              {selectedSuins && (
                                <div className="mt-4 p-3 rounded-lg bg-primary-800/50 border border-secondary-500/20">
                                  <div className="text-sm font-medium mb-2 text-secondary-400">Transaction Details</div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/60">Gas Fee (estimated)</span>
                                      <span className="font-medium text-white">
                                        {estimatedFee ? `~${estimatedFee.gasFee} SUI` : (
                                          <div className="h-4 w-16 bg-primary-700/50 rounded animate-pulse" />
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/60">Link Fee</span>
                                      <span className="font-medium text-white">0.00 SUI</span>
                                    </div>
                                    <div className="h-px bg-secondary-500/20 my-2" />
                                    <div className="flex justify-between items-center">
                                      <span className="text-white/60">Total</span>
                                      <span className="font-medium text-white">
                                        {estimatedFee ? `~${estimatedFee.total} SUI` : (
                                          <div className="h-4 w-16 bg-primary-700/50 rounded animate-pulse" />
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-white/40">
                                    * Gas fee may vary depending on network conditions
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {project.status === 1 && (
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={() => handleLinkSuins()}
                              className="bg-secondary-500 hover:bg-secondary-600 text-white flex-1 relative"
                              disabled={isLinking || isLoadingSuins || !selectedSuins}
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
              {project.status !== ProjectStatus.BUILDING && (
                <>
                  {/* Show dropdown if user has any permissions or is owner */}
                  {((project.status === ProjectStatus.ACTIVE &&
                    (project.owner === userAddress || userPermissions)) ||
                    (project.status === ProjectStatus.FAILED &&
                      userPermissions?.delete) ||
                    project.status === ProjectStatus.DELETING) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`h-8 w-8 flex items-center justify-center rounded-full ${colors.dropdown} transition-all duration-200 hover:scale-110 active:scale-95 ${project.status === ProjectStatus.DELETING ? '' : 'cursor-pointer'}`}
                          disabled={project.status === ProjectStatus.DELETING}
                        >
                          <MoreHorizontal className="h-5 w-5" />
                          <span className="sr-only">Open menu</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-56 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
                      >
                        {project.status === ProjectStatus.ACTIVE && (
                          <>
                            {project.type === ProjectType.ZIP ? (
                              // For ZIP files, only show delete option
                              <DropdownMenuItem
                                className="text-red-400 focus:text-red-400 focus:bg-primary-800 cursor-pointer group"
                                onClick={() => setDeleteDialogOpen(true)}
                              >
                                <div className="flex items-center w-full">
                                  <Trash className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                  <span>Delete ZIP file</span>
                                </div>
                              </DropdownMenuItem>
                            ) : (
                              // For non-ZIP files, show all options
                              <>
                                {/* Owner-only actions */}
                                {project.owner === userAddress && (
                                  <>
                                    <DropdownMenuItem
                                      className="focus:bg-primary-800 cursor-pointer group"
                                      onClick={() =>
                                        setTransferOwnershipOpen(true)
                                      }
                                    >
                                      <div className="flex items-center w-full">
                                        <div className="relative">
                                          <UserCog className="mr-2 h-4 w-4 group-hover:rotate-45 transition-all duration-300" />
                                        </div>
                                        <span className="group-hover:translate-x-0.5 transition-all duration-200">
                                          <FormattedMessage id="projectCard.transferOwnership" />
                                        </span>
                                      </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="focus:bg-primary-800 cursor-pointer group"
                                      onClick={() => setManageMembersOpen(true)}
                                    >
                                      <div className="flex items-center w-full">
                                        <div className="relative">
                                          <Users className="mr-2 h-4 w-4 group-hover:scale-110 group-hover:text-secondary-400 transition-all duration-200" />
                                        </div>
                                        <span className="group-hover:translate-x-0.5 transition-all duration-200">
                                          <FormattedMessage id="projectCard.manageMembers" />
                                        </span>
                                      </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-secondary-500/20" />
                                  </>
                                )}

                                {/* Member permissions */}
                                {userPermissions?.update && (
                                  <DropdownMenuItem
                                    className="focus:bg-primary-800 cursor-pointer group"
                                    onClick={() =>
                                      navigate(
                                        `/edit-website/${project.parentId}`,
                                      )
                                    }
                                  >
                                    <div className="flex items-center w-full">
                                      <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />
                                      <span>
                                        <FormattedMessage id="projectCard.updateSite" />
                                      </span>
                                    </div>
                                  </DropdownMenuItem>
                                )}
                                {userPermissions?.generateSite &&
                                  !project.siteId && (
                                    <DropdownMenuItem
                                      className="focus:bg-primary-800 cursor-pointer group"
                                      onClick={() =>
                                        setGenerateDialogOpen(true)
                                      }
                                    >
                                      <div className="flex items-center w-full">
                                        <Key className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        <span>
                                          <FormattedMessage id="projectCard.generateSiteId" />
                                        </span>
                                      </div>
                                    </DropdownMenuItem>
                                  )}
                                <DropdownMenuItem
                                  className="focus:bg-primary-800 cursor-pointer group relative"
                                  onClick={() => {}}
                                  disabled
                                >
                                  <div className="flex items-center w-full opacity-50">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    <span>
                                      <FormattedMessage id="projectCard.extendSite" />
                                    </span>
                                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-secondary-500/10 border border-secondary-500/20">
                                      <FormattedMessage id="projectCard.comingSoon" />
                                    </span>
                                  </div>
                                </DropdownMenuItem>
                                {userPermissions?.delete && (
                                  <>
                                    <DropdownMenuSeparator className="bg-secondary-500/20" />
                                    <DropdownMenuItem
                                      className="text-red-400 focus:text-red-400 focus:bg-primary-800 cursor-pointer group"
                                      onClick={() => setDeleteDialogOpen(true)}
                                    >
                                      <div className="flex items-center w-full">
                                        <Trash className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                        <span>Delete site</span>
                                      </div>
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </>
                            )}
                          </>
                        )}

                        {/* Failed status actions */}
                        {project.status === ProjectStatus.FAILED &&
                          userPermissions?.delete && (
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-400 focus:bg-primary-800 cursor-pointer group"
                              onClick={() => setDeleteDialogOpen(true)}
                            >
                              <div className="flex items-center w-full">
                                <Trash className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                <span>
                                  {project.type === ProjectType.ZIP
                                    ? 'Delete ZIP file'
                                    : 'Delete site'}
                                </span>
                              </div>
                            </DropdownMenuItem>
                          )}

                        {/* Deleting status indicator */}
                        {project.status === ProjectStatus.DELETING && (
                          <div className="px-4 py-2 text-purple-400 flex items-center gap-2 text-sm">
                            <Loader2 className="ml-1 h-3 w-3 text-purple-300 animate-spin" />
                            <FormattedMessage
                              id="projectCard.deleting"
                              defaultMessage="Deleting project..."
                            />
                          </div>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          isDeleting={isDeleting}
          onConfirm={handleDeleteSite}
        />

        {/* Generate Site ID Dialog */}
        <GenerateSiteIdDialog
          open={generateDialogOpen}
          onOpenChange={setGenerateDialogOpen}
          isGenerating={isGenerating}
          onConfirm={handleGenerateSiteId}
        />

        {/* Manage Members Dialog */}
        <ManageMembersModal
          open={manageMembersOpen}
          onOpenChange={setManageMembersOpen}
          projectId={project.parentId || ''}
          members={project.members}
          onAddMember={(address, permissions) =>
            addMember(
              project.parentId || '',
              address,
              permissions,
              project.members || [],
            )
          }
          onRemoveMember={(address) =>
            removeMember(project.parentId || '', address, project.members || [])
          }
          onUpdatePermissions={(address, permissions) => {
            const memberString = createMemberString(address, permissions)
            return updateMemberPermissions(project.parentId || '', memberString)
          }}
          isAddingMember={isAddingMember}
          isRemovingMember={isRemovingMember}
          isUpdatingPermissions={isUpdatingPermissions}
          onRefetch={onRefetch}
        />

        {/* Transfer Ownership Dialog */}
        <TransferOwnershipDialog
          open={transferOwnershipOpen}
          onOpenChange={setTransferOwnershipOpen}
          projectId={project.parentId || ''}
          currentOwner={project.owner}
          members={project.members}
          onRefetch={onRefetch}
          onTransferOwnership={transferOwnership}
        />

        <Toaster />
      </div>
    )
  },
)

export default ProjectCard
