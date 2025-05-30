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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-primary-900 border-red-500/20 text-white">
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
            className="border-white/20 text-white hover:bg-white/10"
          >
            <FormattedMessage id="projectCard.cancel" />
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>
                  <FormattedMessage id="projectCard.deleting" />
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <Trash className="h-4 w-4 mr-2" />
                <span>
                  <FormattedMessage id="projectCard.deleteSite" />
                </span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 