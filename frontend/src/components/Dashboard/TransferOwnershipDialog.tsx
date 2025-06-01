import { useState } from 'react'
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
import {
  UserCog,
  Loader2,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { isValidSuiAddress } from '@mysten/sui.js/utils'

interface TransferOwnershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  currentOwner: string
  onRefetch: () => Promise<void>
  onTransferOwnership: (
    objectId: string,
    newOwnerAddress: string,
  ) => Promise<void>
}

export function TransferOwnershipDialog({
  open,
  onOpenChange,
  projectId,
  currentOwner,
  onRefetch,
  onTransferOwnership,
}: TransferOwnershipDialogProps) {
  const intl = useIntl()
  const [newOwnerAddress, setNewOwnerAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)
  const [addressError, setAddressError] = useState<string | null>(null)
  const [isValidAddress, setIsValidAddress] = useState(false)

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value
    setNewOwnerAddress(address)

    if (address) {
      if (isValidSuiAddress(address)) {
        setAddressError(null)
        setIsValidAddress(true)
      } else {
        setAddressError(
          intl.formatMessage({
            id: 'projectCard.transferOwnership.invalidAddress',
          }),
        )
        setIsValidAddress(false)
      }
    } else {
      setAddressError(null)
      setIsValidAddress(false)
    }
  }

  const [showConfirm, setShowConfirm] = useState(false)

  const handleTransferClick = () => {
    if (!newOwnerAddress || !isValidAddress) {
      return
    }
    setShowConfirm(true)
  }

  const handleConfirmTransfer = async () => {
    if (!projectId || !newOwnerAddress) return

    try {
      setIsTransferring(true)
      await onTransferOwnership(projectId, newOwnerAddress)
      setNewOwnerAddress('')
      onOpenChange(false)
    } catch (error) {
      // Error is already handled in ProjectCard
      console.error('Error in transfer:', error)
    } finally {
      setIsTransferring(false)
      setShowConfirm(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-primary-900 border-secondary-500/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-secondary-400 flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            <FormattedMessage
              id="projectCard.transferOwnership.title"
              defaultMessage="Transfer Ownership"
            />
          </DialogTitle>
          <DialogDescription className="text-white/60">
            <FormattedMessage
              id="projectCard.transferOwnership.description"
              defaultMessage="Transfer project ownership to another wallet address"
            />
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Transfer Animation */}
          <div className="relative flex items-center justify-center py-4">
            <div className="w-10 h-10 rounded-lg bg-primary-800 border border-secondary-500/20 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-secondary-400" />
            </div>
            <motion.div
              className="mx-4"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="h-5 w-5 text-secondary-400/60" />
            </motion.div>
            <motion.div
              className="w-10 h-10 rounded-lg bg-primary-800 border border-secondary-500/20 flex items-center justify-center"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <UserCog className="h-5 w-5 text-secondary-400/60" />
            </motion.div>
          </div>

          {/* Current Owner */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              <FormattedMessage
                id="projectCard.transferOwnership.currentOwner"
                defaultMessage="Current Owner"
              />
            </label>
            <div className="relative">
              <Input
                value={currentOwner}
                disabled
                className="bg-primary-800 border-secondary-500/20 text-white/60 pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <span className="px-2 py-1 text-xs text-secondary-400">
                  Current
                </span>
              </div>
            </div>
          </div>

          {/* New Owner */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">
              <FormattedMessage
                id="projectCard.transferOwnership.newOwner"
                defaultMessage="New Owner"
              />
            </label>
            <div className="relative">
              <Input
                placeholder={intl.formatMessage({
                  id: 'projectCard.transferOwnership.enterAddress',
                  defaultMessage: 'Enter wallet address',
                })}
                value={newOwnerAddress}
                onChange={handleAddressChange}
                className={`bg-primary-800 border-secondary-500/20 focus:border-secondary-400 pr-10 ${
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
            {addressError && (
              <p className="text-xs text-red-400 mt-1">{addressError}</p>
            )}
          </div>

          {/* Warning Message */}
          <div className="rounded-lg bg-gradient-to-r from-red-500/5 to-transparent p-4 text-sm border border-red-500/10">
            <div className="flex items-center gap-2 mb-2 text-red-400">
              <ShieldAlert className="h-4 w-4" />
              <span className="font-medium">Important Notice</span>
            </div>
            <p className="text-white/70 leading-relaxed pl-6">
              <FormattedMessage
                id="projectCard.transferOwnership.warning"
                defaultMessage="This action cannot be undone. The new owner will have full control over the project, including the ability to manage members and delete the site."
              />
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirm(false)
              onOpenChange(false)
            }}
            className="border-white/10 text-white/80 hover:bg-white/5"
          >
            <FormattedMessage id="common.cancel" defaultMessage="Cancel" />
          </Button>
          {!showConfirm ? (
            <Button
              onClick={handleTransferClick}
              disabled={!isValidAddress || isTransferring}
              className="bg-secondary-500 hover:bg-secondary-600 text-black font-medium"
            >
              <UserCog className="h-4 w-4 mr-2" />
              <FormattedMessage
                id="projectCard.transferOwnership.transfer"
                defaultMessage="Transfer Ownership"
              />
            </Button>
          ) : (
            <Button
              onClick={handleConfirmTransfer}
              disabled={isTransferring}
              className="bg-red-500 hover:bg-red-600 text-white font-medium"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <FormattedMessage
                    id="projectCard.transferOwnership.transferring"
                    defaultMessage="Transferring..."
                  />
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  <FormattedMessage
                    id="common.confirm"
                    defaultMessage="Confirm"
                  />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
