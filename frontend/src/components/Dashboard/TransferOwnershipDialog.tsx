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
import { UserCog, Loader2, ArrowRight, ShieldAlert } from 'lucide-react'
import { motion } from 'framer-motion'

interface TransferOwnershipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  currentOwner: string
  onRefetch: () => Promise<void>
}

export function TransferOwnershipDialog({
  open,
  onOpenChange,
  projectId,
  currentOwner,
  onRefetch,
}: TransferOwnershipDialogProps) {
  const intl = useIntl()
  const [newOwnerAddress, setNewOwnerAddress] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const handleTransferOwnership = async () => {
    if (!newOwnerAddress) {
      toast.error(
        intl.formatMessage({ id: 'projectCard.transferOwnership.enterAddress' }),
      )
      return
    }

    if (!newOwnerAddress.startsWith('0x') || newOwnerAddress.length !== 66) {
      toast.error(
        intl.formatMessage({ id: 'projectCard.transferOwnership.invalidAddress' }),
      )
      return
    }

    try {
      setIsTransferring(true)
      // TODO: Add API call to transfer ownership
      toast.success(
        intl.formatMessage({ id: 'projectCard.transferOwnership.success' }),
      )
      setNewOwnerAddress('')
      onOpenChange(false)
      onRefetch()
    } catch (error: any) {
      console.error('Error transferring ownership:', error)
      toast.error(
        error?.message || intl.formatMessage({ id: 'common.error.unknown' }),
      )
    } finally {
      setIsTransferring(false)
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
          <div className="relative flex items-center justify-center py-6">
            <div 
              className="w-12 h-12 rounded-full bg-secondary-500/20 border-2 border-secondary-500 flex items-center justify-center relative"
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary-500/10"
                animate={{ 
                  opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <UserCog className="h-6 w-6 text-secondary-400 relative z-10" />
            </div>
            <motion.div 
              className="mx-4"
              animate={{ 
                opacity: [0.6, 1, 0.6],
                x: [0, 2, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowRight className="h-6 w-6 text-secondary-400" />
            </motion.div>
            <div className="relative w-12 h-12">
              <motion.div 
                className="absolute inset-0 rounded-full border-2 border-dashed border-secondary-500/50"
                animate={{ 
                  rotate: 360,
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-primary-800/50 flex items-center justify-center"
                animate={{ 
                  opacity: [0.5, 0.7, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <UserCog className="h-6 w-6 text-secondary-400/50" />
              </motion.div>
            </div>
          </div>

          {/* Current Owner */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center gap-2">
              <FormattedMessage 
                id="projectCard.transferOwnership.currentOwner" 
                defaultMessage="Current Owner"
              />
            </label>
            <div className="relative">
              <Input
                value={currentOwner}
                disabled
                className="bg-primary-800/50 border-secondary-500/20 text-white/60 pr-24"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <span className="px-2 py-1 rounded-full bg-secondary-500/10 text-secondary-400 text-xs">Current</span>
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
            <div className="relative mt-2">
              <Input
                placeholder={intl.formatMessage({
                  id: 'projectCard.transferOwnership.enterAddress',
                  defaultMessage: 'Enter wallet address',
                })}
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                className="bg-primary-800 border-secondary-500/20 focus:border-secondary-400 transition-colors duration-200"
              />
              <motion.div 
                className="absolute right-3 top-1/2 -translate-y-1/2"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="px-2 py-1 rounded-full bg-secondary-500/10 text-secondary-400 text-xs">New</span>
              </motion.div>
            </div>
          </div>

          {/* Warning Message */}
          <motion.div 
            className="rounded-lg bg-red-500/10 p-4 text-sm text-red-400 flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Important Notice:</p>
              <p className="text-red-400/80 leading-relaxed">
                <FormattedMessage 
                  id="projectCard.transferOwnership.warning" 
                  defaultMessage="This action cannot be undone. The new owner will have full control over the project, including the ability to manage members and delete the site."
                />
              </p>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <FormattedMessage 
              id="common.cancel" 
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            onClick={handleTransferOwnership}
            className="bg-secondary-500 hover:bg-secondary-600 text-black font-medium relative overflow-hidden group"
            disabled={isTransferring}
          >
            <motion.div 
              className="absolute inset-0 bg-secondary-400"
              initial={false}
              animate={{ 
                x: isTransferring ? '100%' : '-100%'
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="relative flex items-center">
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
                  <UserCog className="h-4 w-4 mr-2" />
                  <FormattedMessage 
                    id="projectCard.transferOwnership.transfer" 
                    defaultMessage="Transfer Ownership"
                  />
                </>
              )}
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 