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
  UserPlus,
  X,
  Shield,
  UserCog,
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
import { FormattedMessage, useIntl } from 'react-intl'
import {
  Project,
  ProjectCardProps,
  MemberPermissions,
  ProjectStatus,
  ProjectType,
} from '@/types/project'
import { linkSuinsToSite } from '@/utils/suinsUtils'
import { ManageMembersModal } from './ManageMembersModal'
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog'
import { GenerateSiteIdDialog } from './GenerateSiteIdDialog'
import { RemoveMemberDialog } from './RemoveMemberDialog'
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
import { createMemberString, joinMemberStrings } from '@/utils/memberUtils'
import { createMemberStrings } from '@/utils/memberUtils'

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
    const { signAndExecuteTransactionBlock } = useWalletKit()
    const navigate = useNavigate()
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
    const { suins, isLoadingSuins, refetchSuiNS } = useSuiData(
      userAddress || '',
    )
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLinking, setIsLinking] = useState(false)
    const [open, setOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [generateDialogOpen, setGenerateDialogOpen] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const [manageMembersOpen, setManageMembersOpen] = useState(false)
    const [newMemberAddress, setNewMemberAddress] = useState('')
    const [newMemberPermissions, setNewMemberPermissions] =
      useState<MemberPermissions>({
        update: false,
        delete: false,
        generateSite: false,
        setSuins: false,
      })
    const [removingMember, setRemovingMember] = useState<string | null>(null)
    const [isAddingMember, setIsAddingMember] = useState(false)
    const [isRemovingMember, setIsRemovingMember] = useState(false)
    const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false)
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

    const colors = getStatusColor(project.status)
    const userPermissions = getUserPermissions(userAddress, project)

    // Helper function for delay and refetch
    const delayAndRefetch = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      onRefetch()
    }

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
        setIsLinking(true)

        const selectedSuinsData = suins.find(
          (s) => s.data?.content?.fields?.domain_name === selectedSuins,
        )
        if (!selectedSuinsData?.data?.objectId) {
          throw new Error('SUINS NFT not found')
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
            await delayAndRefetch()
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

    const handleDeleteSite = async (): Promise<void> => {
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
          await delayAndRefetch()
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

    const handleGenerateSiteId = async (): Promise<void> => {
      setIsGenerating(true)
      try {
        await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_ADD_SITE_ID!}?object_id=${project.parentId}`,
        )
        toast.success('Site ID generated successfully', {
          description: 'Please wait a moment',
          duration: 5000,
        })
        setGenerateDialogOpen(false)
        await delayAndRefetch()
      } catch (error: any) {
        toast.error(error?.message || 'Failed to generate Site ID')
      } finally {
        setIsGenerating(false)
      }
    }

    const handleAddMember = async (
      address: string,
      permissions: MemberPermissions,
    ) => {
      try {
        setIsAddingMember(true)

        const allMembers = [
          ...(project.members || []),
          { address, permissions },
        ]

        const memberString = createMemberStrings(allMembers)

        await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GRANT_ACCESS!}?object_id=${project.parentId}&member_address_n_access=${memberString}`,
        )

        toast.success(
          intl.formatMessage({ id: 'projectCard.manageMembers.memberAdded' }),
        )

        await delayAndRefetch()
      } catch (error: any) {
        console.error('Error adding member:', error)
        toast.error(
          error?.message || intl.formatMessage({ id: 'common.error.unknown' }),
        )
      } finally {
        setIsAddingMember(false)
      }
    }

    const handleRemoveMember = async (addressToRemove: string) => {
      try {
        setIsRemovingMember(true)

        const remainingMembers =
          project.members?.filter(
            (member) => member.address !== addressToRemove,
          ) || []

        const memberString = createMemberStrings(remainingMembers)

        await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GRANT_ACCESS!}?object_id=${project.parentId}&member_address_n_access=${memberString}`,
        )

        toast.success(
          intl.formatMessage({ id: 'projectCard.manageMembers.memberRemoved' }),
        )

        await delayAndRefetch()
      } catch (error: any) {
        console.error('Error removing member:', error)
        toast.error(
          error?.message || intl.formatMessage({ id: 'common.error.unknown' }),
        )
      } finally {
        setIsRemovingMember(false)
      }
    }

    const handleUpdateMemberPermissions = async (
      addressToUpdate: string,
      newPermissions: MemberPermissions,
    ) => {
      try {
        setIsUpdatingPermissions(true)

        const updatedMembers =
          project.members?.map((member) =>
            member.address === addressToUpdate
              ? { ...member, permissions: newPermissions }
              : member,
          ) || []

        const memberString = createMemberStrings(updatedMembers)

        await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GRANT_ACCESS!}?object_id=${project.parentId}&member_address_n_access=${memberString}`,
        )

        toast.success(
          intl.formatMessage({
            id: 'projectCard.manageMembers.permissionsUpdated',
          }),
        )

        await delayAndRefetch()
      } catch (error: any) {
        console.error('Error updating permissions:', error)
        toast.error(
          error?.message || intl.formatMessage({ id: 'common.error.unknown' }),
        )
      } finally {
        setIsUpdatingPermissions(false)
      }
    }

    const handleTransferOwnership = async (
      objectId: string,
      newOwnerAddress: string,
    ): Promise<void> => {
      try {
        await apiClient.put(
          `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_TRANSFER_OWNER!}?object_id=${objectId}&new_owner_address=${newOwnerAddress}`,
        )
        toast.success('Ownership transferred successfully', {
          description: 'Please wait a moment for the changes to take effect',
          duration: 5000,
        })
        await delayAndRefetch()
        return Promise.resolve()
      } catch (error: any) {
        toast.error(error?.message || 'Failed to transfer ownership')
        return Promise.reject(error)
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
          <Card
            className={`flex flex-row items-center p-3 sm:p-4 ${colors.card} ${colors.shadow} shadow-lg backdrop-blur-sm h-full min-h-[160px] relative transition-all duration-300`}
          >
            {/* Dropdown Menu: Top Right */}
            <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
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
                                isLinking || isLoadingSuins || !selectedSuins
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
                            {/* Owner-only actions */}
                            {project.owner === userAddress && (
                              <>
                                <DropdownMenuItem
                                  className="focus:bg-primary-800 cursor-pointer group"
                                  onClick={() => setTransferOwnershipOpen(true)}
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
                                  navigate(`/edit-website/${project.parentId}`)
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
                                  onClick={() => setGenerateDialogOpen(true)}
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

                        {/* Failed status actions */}
                        {project.status === ProjectStatus.FAILED &&
                          userPermissions?.delete && (
                            <DropdownMenuItem
                              className="text-red-400 focus:text-red-400 focus:bg-primary-800 cursor-pointer group"
                              onClick={() => setDeleteDialogOpen(true)}
                            >
                              <div className="flex items-center w-full">
                                <Trash className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                <span>Delete site</span>
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
            <div className="flex flex-col flex-1 min-w-0 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
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
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onUpdatePermissions={handleUpdateMemberPermissions}
          isAddingMember={isAddingMember}
          isRemovingMember={isRemovingMember}
          isUpdatingPermissions={isUpdatingPermissions}
          onRefetch={delayAndRefetch}
        />

        <RemoveMemberDialog
          open={!!removingMember}
          onOpenChange={(open) => !open && setRemovingMember(null)}
          isRemoving={isRemovingMember}
          onConfirm={async () => {
            if (removingMember) {
              await handleRemoveMember(removingMember)
            }
          }}
        />

        {/* Transfer Ownership Dialog */}
        <TransferOwnershipDialog
          open={transferOwnershipOpen}
          onOpenChange={setTransferOwnershipOpen}
          projectId={project.parentId || ''}
          currentOwner={project.owner}
          onRefetch={onRefetch}
          onTransferOwnership={handleTransferOwnership}
        />

        <Toaster />
      </div>
    )
  },
)

export default ProjectCard
