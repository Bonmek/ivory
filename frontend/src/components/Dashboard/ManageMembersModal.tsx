import { useState, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { toast } from 'sonner'
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
import { Users, UserPlus, Shield, X, Loader2, ChevronDown, ChevronUp, ListChecks } from 'lucide-react'
import { MemberPermissions, ProjectMember } from '@/types/project'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ManageMembersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  members?: ProjectMember[]
  onRefetch: () => Promise<void>
}

export function ManageMembersModal({
  open,
  onOpenChange,
  projectId,
  members: initialMembers,
  onRefetch,
}: ManageMembersModalProps) {
  const intl = useIntl()
  const [members, setMembers] = useState(initialMembers || [])

  useEffect(() => {
    if (initialMembers) {
      setMembers(initialMembers)
    }
  }, [initialMembers])

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
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  const handleAddMember = async () => {
    if (!newMemberAddress) {
      toast.error(
        intl.formatMessage({ id: 'projectCard.manageMembers.enterAddress' }),
      )
      return
    }

    if (!newMemberAddress.startsWith('0x') || newMemberAddress.length !== 66) {
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
      setIsAddingMember(true)
      // TODO: Add API call to add member
      toast.success(
        intl.formatMessage({ id: 'projectCard.manageMembers.memberAdded' }),
      )
      setNewMemberAddress('')
      setNewMemberPermissions({
        update: false,
        delete: false,
        generateSite: false,
        setSuins: false,
      })
      onRefetch()
    } catch (error: any) {
      console.error('Error adding member:', error)
      toast.error(
        error?.message || intl.formatMessage({ id: 'common.error.unknown' }),
      )
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (address: string) => {
    try {
      setIsRemovingMember(true)
      // TODO: Add API call to remove member
      toast.success(
        intl.formatMessage({ id: 'projectCard.manageMembers.memberRemoved' }),
      )
      setRemovingMember(null)
      onRefetch()
    } catch (error: any) {
      console.error('Error removing member:', error)
      toast.error(
        error?.message || intl.formatMessage({ id: 'common.error.unknown' }),
      )
    } finally {
      setIsRemovingMember(false)
    }
  }

  const handleUpdatePermissions = async (
    address: string,
    permissions: MemberPermissions,
  ) => {
    try {
      setIsUpdatingPermissions(true)
      // TODO: Add API call to update permissions
      toast.success(
        intl.formatMessage({
          id: 'projectCard.manageMembers.permissionsUpdated',
        }),
      )
      onRefetch()
    } catch (error: any) {
      console.error('Error updating permissions:', error)
      toast.error(
        error?.message || intl.formatMessage({ id: 'common.error.unknown' }),
      )
    } finally {
      setIsUpdatingPermissions(false)
    }
  }

  const handleSelectAllPermissions = (address: string, checked: boolean) => {
    handleUpdatePermissions(address, {
      update: checked,
      delete: checked,
      generateSite: checked,
      setSuins: checked,
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-primary-900 border-secondary-500/20 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-secondary-400 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <FormattedMessage 
                id="projectCard.manageMembers.title" 
                defaultMessage="Manage Members"
              />
            </DialogTitle>
            <DialogDescription className="text-white/60">
              <FormattedMessage 
                id="projectCard.manageMembers.description" 
                defaultMessage="Add or remove members and manage their permissions"
              />
            </DialogDescription>
          </DialogHeader>

          {/* Add New Member Section */}
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-white/80">
                <FormattedMessage 
                  id="projectCard.manageMembers.addMember" 
                  defaultMessage="Add Member"
                />
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder={intl.formatMessage({
                    id: 'projectCard.manageMembers.enterAddress',
                  })}
                  value={newMemberAddress}
                  onChange={(e) => setNewMemberAddress(e.target.value)}
                  className="flex-1 bg-primary-800 border-secondary-500/20"
                />
                <Button
                  onClick={handleAddMember}
                  disabled={isAddingMember}
                  className="bg-secondary-500 hover:bg-secondary-600"
                >
                  {isAddingMember ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* New Member Permissions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/80">
                  <FormattedMessage 
                    id="projectCard.manageMembers.permissions" 
                    defaultMessage="Permissions"
                  />
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNewMemberPermissions({
                    update: true,
                    delete: true,
                    generateSite: true,
                    setSuins: true,
                  })}
                  className="text-xs text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/10 px-3 h-7 rounded-md border border-secondary-500/20 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                >
                  <ListChecks className="h-4 w-4" />
                  <FormattedMessage 
                    id="projectCard.manageMembers.selectAll" 
                    defaultMessage="Select All"
                  />
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
                    <FormattedMessage 
                      id="projectCard.manageMembers.permissionUpdate" 
                      defaultMessage="Update"
                    />
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
                    <FormattedMessage 
                      id="projectCard.manageMembers.permissionDelete" 
                      defaultMessage="Delete"
                    />
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
                    <FormattedMessage 
                      id="projectCard.manageMembers.permissionGenerateSite" 
                      defaultMessage="Generate Site"
                    />
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
                    <FormattedMessage 
                      id="projectCard.manageMembers.permissionSetSuins" 
                      defaultMessage="Set SUINS"
                    />
                  </span>
                </label>
              </div>
            </div>

            {/* Separator and Current Members List */}
            {members && members.length > 0 && (
              <>
                <Separator className="bg-secondary-500/20" />
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  <h3 className="text-sm font-medium text-white/80 flex items-center gap-2 sticky top-0 bg-primary-900 py-2">
                    <Shield className="h-4 w-4" />
                    <span>
                      <FormattedMessage 
                        id="projectCard.manageMembers.currentMembers" 
                        defaultMessage="Current Members"
                      />
                    </span>
                    <span className="text-xs text-secondary-400">
                      ({members.length} <FormattedMessage 
                        id="projectCard.manageMembers.membersCount" 
                        defaultMessage="members"
                      />)
                    </span>
                  </h3>

                  <div className="space-y-2">
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
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedMember(
                                expandedMember === member.address ? null : member.address
                              )}
                              className="text-xs text-secondary-400 hover:text-secondary-300 px-2 h-7"
                            >
                              {expandedMember === member.address ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                              <span className="ml-1">
                                <FormattedMessage 
                                  id="projectCard.manageMembers.permissions" 
                                  defaultMessage="Permissions"
                                />
                              </span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemovingMember(member.address)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 w-7 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {expandedMember === member.address && (
                          <div className="px-3 pb-3 border-t border-secondary-500/10 pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-secondary-400">
                                <FormattedMessage 
                                  id="projectCard.manageMembers.memberPermissions" 
                                  defaultMessage="Member Permissions"
                                />
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSelectAllPermissions(member.address, true)}
                                className="text-xs text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/10 px-3 h-7 rounded-md border border-secondary-500/20 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                              >
                                <ListChecks className="h-4 w-4" />
                                <FormattedMessage 
                                  id="projectCard.manageMembers.selectAll" 
                                  defaultMessage="Select All"
                                />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                              <label className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={member.permissions.update}
                                  onChange={(e) =>
                                    handleUpdatePermissions(member.address, {
                                      ...member.permissions,
                                      update: e.target.checked,
                                    })
                                  }
                                  className="rounded border-secondary-500/20 bg-primary-900 h-3.5 w-3.5"
                                />
                                <span className="text-white/80">
                                  <FormattedMessage id="projectCard.manageMembers.permissionUpdate" />
                                </span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={member.permissions.delete}
                                  onChange={(e) =>
                                    handleUpdatePermissions(member.address, {
                                      ...member.permissions,
                                      delete: e.target.checked,
                                    })
                                  }
                                  className="rounded border-secondary-500/20 bg-primary-900 h-3.5 w-3.5"
                                />
                                <span className="text-white/80">
                                  <FormattedMessage id="projectCard.manageMembers.permissionDelete" />
                                </span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={member.permissions.generateSite}
                                  onChange={(e) =>
                                    handleUpdatePermissions(member.address, {
                                      ...member.permissions,
                                      generateSite: e.target.checked,
                                    })
                                  }
                                  className="rounded border-secondary-500/20 bg-primary-900 h-3.5 w-3.5"
                                />
                                <span className="text-white/80">
                                  <FormattedMessage id="projectCard.manageMembers.permissionGenerateSite" />
                                </span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={member.permissions.setSuins}
                                  onChange={(e) =>
                                    handleUpdatePermissions(member.address, {
                                      ...member.permissions,
                                      setSuins: e.target.checked,
                                    })
                                  }
                                  className="rounded border-secondary-500/20 bg-primary-900 h-3.5 w-3.5"
                                />
                                <span className="text-white/80">
                                  <FormattedMessage id="projectCard.manageMembers.permissionSetSuins" />
                                </span>
                              </label>
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

      {/* Remove Member Confirmation Dialog */}
      <Dialog
        open={!!removingMember}
        onOpenChange={() => setRemovingMember(null)}
      >
        <DialogContent className="bg-primary-900 border-red-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400">
              <FormattedMessage 
                id="projectCard.manageMembers.removeMember" 
                defaultMessage="Remove Member"
              />
            </DialogTitle>
            <DialogDescription className="text-white/60">
              <FormattedMessage 
                id="projectCard.manageMembers.removeConfirm" 
                defaultMessage="Are you sure you want to remove this member?"
              />
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setRemovingMember(null)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <FormattedMessage 
                id="projectCard.cancel" 
                defaultMessage="Cancel"
              />
            </Button>
            <Button
              onClick={() =>
                removingMember && handleRemoveMember(removingMember)
              }
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isRemovingMember}
            >
              {isRemovingMember ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              <FormattedMessage 
                id="projectCard.manageMembers.removeMember" 
                defaultMessage="Remove Member"
              />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
