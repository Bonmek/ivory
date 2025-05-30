import { FormattedMessage } from 'react-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
            disabled={isGenerating}
          >
            <FormattedMessage id="projectCard.cancel" />
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-secondary-500 hover:bg-secondary-600 text-white"
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
  )
} 