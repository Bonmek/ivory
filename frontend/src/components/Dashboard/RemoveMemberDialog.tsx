import { FormattedMessage } from 'react-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelLoading } from '@/components/ui/loading-pixel'

interface RemoveMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isRemoving: boolean
  onConfirm: () => Promise<void>
}

export function RemoveMemberDialog({
  open,
  onOpenChange,
  isRemoving,
  onConfirm
}: RemoveMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isRemoving) return
      onOpenChange(newOpen)
    }}>
      <DialogContent className="bg-primary-900 border-red-500/20 text-white">
        <AnimatePresence>
          {isRemoving && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary-900/95 z-50 flex flex-col items-center justify-center gap-4"
            >
              <PixelLoading />
              <div className="text-center space-y-2">
                <p className="text-red-400 font-medium">
                  <FormattedMessage 
                    id="dialog.removingMember"
                    defaultMessage="Removing member..."
                  />
                </p>
                <p className="text-sm text-white/60">
                  <FormattedMessage 
                    id="dialog.pleaseWait"
                    defaultMessage="Please don't close this window"
                  />
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
          >
            <FormattedMessage id="projectCard.cancel" />
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            disabled={isRemoving}
          >
            {isRemoving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <FormattedMessage 
                  id="projectCard.manageMembers.removing" 
                  defaultMessage="Removing..."
                />
              </>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                <FormattedMessage id="projectCard.manageMembers.removeMember" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 