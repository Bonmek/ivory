import { FormattedMessage } from 'react-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Trash } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelLoading } from '@/components/ui/loading-pixel'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isDeleting: boolean
  onConfirm: () => Promise<void>
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  isDeleting,
  onConfirm
}: DeleteConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isDeleting) return
      onOpenChange(newOpen)
    }}>
      <DialogContent className="bg-primary-900 border-red-500/20 text-white max-w-lg">
        <AnimatePresence>
          {isDeleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary-900/95 z-50 flex flex-col items-center justify-center gap-4"
            >
              <PixelLoading />
              <div className="text-center space-y-2">
                <p className="text-secondary-400 font-medium">
                  <FormattedMessage id="projectCard.deleting" />
                </p>
                <p className="text-sm text-white/60">
                  <FormattedMessage id="dialog.pleaseWait" defaultMessage="Please don't close this window" />
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogHeader>
          <DialogTitle className="text-red-400">
            <FormattedMessage id="projectCard.deleteTitle" />
          </DialogTitle>
          <DialogDescription className="text-white/60">
            <FormattedMessage id="projectCard.deleteConfirm" />
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
            disabled={isDeleting}
          >
            <FormattedMessage id="projectCard.cancel" />
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4 mr-2" />
            <FormattedMessage id="projectCard.deleteSite" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 