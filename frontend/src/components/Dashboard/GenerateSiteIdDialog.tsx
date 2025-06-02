import { FormattedMessage } from 'react-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Key, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { PixelLoading } from '@/components/ui/loading-pixel'

interface GenerateSiteIdDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isGenerating: boolean
  onConfirm: () => Promise<void>
}

export function GenerateSiteIdDialog({
  open,
  onOpenChange,
  isGenerating,
  onConfirm
}: GenerateSiteIdDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isGenerating) return
      onOpenChange(newOpen)
    }}>
      <DialogContent className="bg-primary-900 border-secondary-500/20 text-white max-w-lg">
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary-900/95 z-50 flex flex-col items-center justify-center gap-4"
            >
              <PixelLoading />
              <div className="text-center space-y-2">
                <p className="text-secondary-400 font-medium">
                  <FormattedMessage id="projectCard.generatingSiteId" />
                </p>
                <p className="text-sm text-white/60">
                  <FormattedMessage id="dialog.pleaseWait" defaultMessage="Please don't close this window" />
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10 cursor-pointer"
            disabled={isGenerating}
          >
            <FormattedMessage id="projectCard.cancel" />
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-secondary-500 hover:bg-secondary-600 text-white cursor-pointer"
            disabled={isGenerating}
          >
            <Key className="h-4 w-4 mr-2" />
            <FormattedMessage id="projectCard.generate" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 