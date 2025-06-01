import { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from 'sonner'
import { isValidSuiAddress } from '@mysten/sui.js/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  UserPlus,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
  ListChecks,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Save,
} from 'lucide-react'
import { MemberPermissions, ProjectMember } from '@/types/project'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface ManageMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  members?: ProjectMember[]
  onAddMember: (
    address: string,
    permissions: MemberPermissions,
  ) => Promise<void>
  onRemoveMember: (address: string) => Promise<void>
  onUpdatePermissions: (
    address: string,
    permissions: MemberPermissions,
  ) => Promise<void>
  isAddingMember?: boolean
  isRemovingMember?: boolean
  isUpdatingPermissions?: boolean
  onRefetch: () => Promise<void>
}

export function ManageMembersModal({
  open,
  onOpenChange,
  projectId,
  members: initialMembers,
  onAddMember,
  onRemoveMember,
  onUpdatePermissions,
  isAddingMember = false,
  isRemovingMember = false,
  isUpdatingPermissions = false,
  onRefetch,
}: ManageMembersModalProps) {
  const intl = useIntl()
  const [members, setMembers] = useState(initialMembers || [])
  const [newMemberAddress, setNewMemberAddress] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [newMemberPermissions, setNewMemberPermissions] =
    useState<MemberPermissions>({
      update: false,
      delete: false,
      generateSite: false,
      setSuins: false,
    })
  const [removingMember, setRemovingMember] = useState<string | null>(null)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [pendingPermissions, setPendingPermissions] = useState<{
    [key: string]: MemberPermissions
  }>({})
  const [hasChanges, setHasChanges] = useState<{ [key: string]: boolean }>({})

  // Add refresh states
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isInCooldown, setIsInCooldown] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const COOLDOWN_PERIOD = 5

  useEffect(() => {
    if (initialMembers) {
      setMembers(initialMembers)
      // Reset pending permissions when members change
      setPendingPermissions({})
      setHasChanges({})
    }
  }, [initialMembers])

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value
    setNewMemberAddress(address)

    if (address) {
      if (isValidSuiAddress(address)) {
        setAddressError(null)
        setIsValidAddress(true)
      } else {
        setAddressError(
          intl.formatMessage({
            id: 'projectCard.manageMembers.invalidAddress',
          }),
        )
        setIsValidAddress(false)
      }
    } else {
      setAddressError(null)
      setIsValidAddress(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberAddress) {
      toast.error(
        intl.formatMessage({ id: 'projectCard.manageMembers.enterAddress' }),
      )
      return
    }

    if (!isValidSuiAddress(newMemberAddress)) {
      toast.error(
        intl.formatMessage({ id: 'projectCard.manageMembers.invalidAddress' }),
      )
      return
    }

    if (members?.some((member) => member.address === newMemberAddress)) {
      toast.error(
        intl.formatMessage({ id: 'projectCard.manageMembers.addressExists' }),
      )
      return
    }

    try {
      await onAddMember(newMemberAddress, newMemberPermissions)
      setNewMemberAddress('')
      setNewMemberPermissions({
        update: false,
        delete: false,
        generateSite: false,
        setSuins: false,
      })
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add member')
    }
  }

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(address)
      toast.success(intl.formatMessage({ id: 'projectCard.copyToClipboard' }))
      setTimeout(() => {
        setCopiedAddress(null)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy address: ', err)
      toast.error(intl.formatMessage({ id: 'projectCard.failedToCopy' }))
    }
  }

  const handlePermissionChange = (
    address: string,
    field: keyof MemberPermissions,
    value: boolean,
  ) => {
    setPendingPermissions((prev) => ({
      ...prev,
      [address]: {
        ...(prev[address] ||
          members.find((m) => m.address === address)?.permissions ||
          {}),
        [field]: value,
      },
    }))
    setHasChanges((prev) => ({
      ...prev,
      [address]: true,
    }))
  }

  const handleSavePermissions = async (address: string) => {
    if (!pendingPermissions[address]) return

    try {
      await onUpdatePermissions(address, pendingPermissions[address])
      setHasChanges((prev) => ({
        ...prev,
        [address]: false,
      }))
    } catch (error) {
      setPendingPermissions((prev) => ({
        ...prev,
        [address]: members.find((m) => m.address === address)?.permissions || {
          update: false,
          delete: false,
          generateSite: false,
          setSuins: false,
        },
      }))
    }
  }

  const handleSelectAllPermissions = (address: string, checked: boolean) => {
    const newPermissions = {
      update: checked,
      delete: checked,
      generateSite: checked,
      setSuins: checked,
    }
    setPendingPermissions((prev) => ({
      ...prev,
      [address]: newPermissions,
    }))
    setHasChanges((prev) => ({
      ...prev,
      [address]: true,
    }))
  }

  const handleRefresh = async () => {
    if (isRefreshing || isInCooldown) return

    try {
      setIsRefreshing(true)
      await onRefetch()
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
    } finally {
      setIsRefreshing(false)
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
          defaultMessage: 'Refreshing data...',
        })
      case 'cooldown':
        return intl.formatMessage(
          {
            id: 'dashboard.refresh.cooldown',
            defaultMessage: 'Please wait {time} before refreshing',
          },
          { time: formatCooldownTime(cooldownSeconds) },
        )
      default:
        return intl.formatMessage({
          id: 'dashboard.refresh.ready',
          defaultMessage: 'Refresh data',
        })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-primary-900 border-secondary-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-secondary-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <FormattedMessage id="projectCard.manageMembers.title" />
            </DialogTitle>
            <DialogDescription className="text-white/60">
              <FormattedMessage id="projectCard.manageMembers.description" />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white/80">
                <FormattedMessage id="projectCard.manageMembers.addMember" />
              </h3>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    placeholder={intl.formatMessage({
                      id: 'projectCard.manageMembers.enterAddress',
                    })}
                    value={newMemberAddress}
                    onChange={handleAddressChange}
                    className={`flex-1 bg-primary-800 border-secondary-500/20 pr-10 ${
                      addressError
                        ? 'border-red-500'
                        : isValidAddress
                          ? 'border-green-500'
                          : ''
                    }`}
                  />
                  {isValidAddress && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleAddMember}
                  disabled={!isValidAddress || isAddingMember}
                  className="bg-secondary-500 hover:bg-secondary-600 cursor-pointer"
                >
                  {isAddingMember ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {addressError && (
                <p className="text-xs text-red-400 mt-1">{addressError}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/80">
                  <FormattedMessage id="projectCard.manageMembers.permissions" />
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setNewMemberPermissions({
                      update: true,
                      delete: true,
                      generateSite: true,
                      setSuins: true,
                    })
                  }
                  className="text-xs text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/10 px-3 h-7 rounded-md border border-secondary-500/20 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                >
                  <ListChecks className="h-4 w-4" />
                  <FormattedMessage id="projectCard.manageMembers.selectAll" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newMemberPermissions.update}
                    onChange={(e) =>
                      setNewMemberPermissions((prev) => ({
                        ...prev,
                        update: e.target.checked,
                      }))
                    }
                    className="rounded border-secondary-500/20 bg-primary-800 h-3.5 w-3.5"
                  />
                  <span className="text-white/80">
                    <FormattedMessage id="projectCard.manageMembers.permissionUpdate" />
                  </span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newMemberPermissions.delete}
                    onChange={(e) =>
                      setNewMemberPermissions((prev) => ({
                        ...prev,
                        delete: e.target.checked,
                      }))
                    }
                    className="rounded border-secondary-500/20 bg-primary-800 h-3.5 w-3.5"
                  />
                  <span className="text-white/80">
                    <FormattedMessage id="projectCard.manageMembers.permissionDelete" />
                  </span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newMemberPermissions.generateSite}
                    onChange={(e) =>
                      setNewMemberPermissions((prev) => ({
                        ...prev,
                        generateSite: e.target.checked,
                      }))
                    }
                    className="rounded border-secondary-500/20 bg-primary-800 h-3.5 w-3.5"
                  />
                  <span className="text-white/80">
                    <FormattedMessage id="projectCard.manageMembers.permissionGenerateSite" />
                  </span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newMemberPermissions.setSuins}
                    onChange={(e) =>
                      setNewMemberPermissions((prev) => ({
                        ...prev,
                        setSuins: e.target.checked,
                      }))
                    }
                    className="rounded border-secondary-500/20 bg-primary-800 h-3.5 w-3.5"
                  />
                  <span className="text-white/80">
                    <FormattedMessage id="projectCard.manageMembers.permissionSetSuins" />
                  </span>
                </label>
              </div>
            </div>

            {members && members.length > 0 && (
              <>
                <Separator className="bg-secondary-500/20" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-primary-900 py-2">
                    <h3 className="text-sm font-medium text-white/80 flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-secondary-400" />
                      <span>
                        <FormattedMessage id="projectCard.manageMembers.currentMembers" />
                      </span>
                      <span className="text-xs text-secondary-400">
                        ({members.length}{' '}
                        <FormattedMessage id="projectCard.manageMembers.membersCount" />
                        )
                      </span>
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleRefresh}
                              disabled={isRefreshing || isInCooldown}
                              className={`text-xs text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/10 px-2 h-7 rounded-md transition-colors duration-200 relative overflow-hidden cursor-pointer
                                ${isInCooldown ? 'bg-primary-800/50' : ''}
                                ${isRefreshing ? 'bg-secondary-500/10' : ''}
                              `}
                            >
                              <RefreshCw
                                className={`h-3.5 w-3.5 transition-all duration-200
                                  ${isRefreshing ? 'animate-spin text-secondary-400' : ''}
                                  ${isInCooldown ? 'text-secondary-600' : ''}
                                `}
                              />
                              {isInCooldown && (
                                <div
                                  className="absolute bottom-0 left-0 h-1 bg-secondary-500/30"
                                  style={{
                                    width: `${(cooldownSeconds / COOLDOWN_PERIOD) * 100}%`,
                                    transition: 'width 1s linear',
                                  }}
                                />
                              )}
                            </Button>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="bg-primary-900/95 border-secondary-500/20 text-white text-xs"
                        >
                          {getTooltipMessage()}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 -mr-2">
                    {members.map((member) => (
                      <div
                        key={member.address}
                        className="bg-primary-800/50 rounded-lg"
                      >
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-secondary-400" />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="text-sm font-medium text-white/90 cursor-help">
                                    {member.address.slice(0, 6)}...
                                    {member.address.slice(-4)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="bg-primary-900 border-secondary-500/20 text-white text-xs"
                                >
                                  {member.address}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyAddress(member.address)}
                              className="text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/10 h-7 w-7 p-0 ml-1 cursor-pointer"
                            >
                              {copiedAddress === member.address ? (
                                <Check className="h-3.5 w-3.5 text-green-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setExpandedMember(
                                  expandedMember === member.address
                                    ? null
                                    : member.address,
                                )
                              }
                              className="text-xs text-secondary-400 hover:text-secondary-300 px-2 h-7 cursor-pointer"
                            >
                              {expandedMember === member.address ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span className="ml-1">
                                <FormattedMessage id="projectCard.manageMembers.permissions" />
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemovingMember(member.address)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0 cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {expandedMember === member.address && (
                          <div className="px-3 pb-3 border-t border-secondary-500/10 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-secondary-400">
                                <FormattedMessage id="projectCard.manageMembers.memberPermissions" />
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleSelectAllPermissions(
                                      member.address,
                                      true,
                                    )
                                  }
                                  className="text-xs text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/10 px-3 h-7 rounded-md border border-secondary-500/20 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                                >
                                  <ListChecks className="h-4 w-4" />
                                  <FormattedMessage id="projectCard.manageMembers.selectAll" />
                                </Button>
                                {hasChanges[member.address] && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      handleSavePermissions(member.address)
                                    }
                                    disabled={isUpdatingPermissions}
                                    className="text-xs px-3 h-7 bg-secondary-500 hover:bg-secondary-600 text-white flex items-center gap-1 cursor-pointer"
                                  >
                                    {isUpdatingPermissions ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Save className="h-3.5 w-3.5" />
                                    )}
                                    <FormattedMessage id="projectCard.manageMembers.applyChanges" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              {Object.entries({
                                update:
                                  'projectCard.manageMembers.permissionUpdate',
                                delete:
                                  'projectCard.manageMembers.permissionDelete',
                                generateSite:
                                  'projectCard.manageMembers.permissionGenerateSite',
                                setSuins:
                                  'projectCard.manageMembers.permissionSetSuins',
                              }).map(([permission, label]) => (
                                <label
                                  key={permission}
                                  className="flex items-center space-x-2 text-sm"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      pendingPermissions[member.address]?.[
                                        permission as keyof MemberPermissions
                                      ] ??
                                      member.permissions[
                                        permission as keyof MemberPermissions
                                      ]
                                    }
                                    onChange={(e) =>
                                      handlePermissionChange(
                                        member.address,
                                        permission as keyof MemberPermissions,
                                        e.target.checked,
                                      )
                                    }
                                    className="cursor-pointer rounded border-secondary-500/20 bg-primary-900 h-3.5 w-3.5"
                                  />
                                  <span className="text-white/80">
                                    <FormattedMessage id={label} />
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!removingMember}
        onOpenChange={() => setRemovingMember(null)}
      >
        <DialogContent className="bg-primary-900 border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">
              <FormattedMessage id="projectCard.manageMembers.removeMember" />
            </DialogTitle>
            <DialogDescription className="text-white/60">
              <FormattedMessage id="projectCard.manageMembers.removeConfirm" />
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setRemovingMember(null)}
              className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
            >
              <FormattedMessage id="projectCard.cancel" />
            </Button>
            <Button
              onClick={() => removingMember && onRemoveMember(removingMember)}
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              disabled={isRemovingMember}
            >
              {isRemovingMember ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              <FormattedMessage id="projectCard.manageMembers.removeMember" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
