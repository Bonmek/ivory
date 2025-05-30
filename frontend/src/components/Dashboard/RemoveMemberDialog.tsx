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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <FormattedMessage id="projectCard.cancel" />
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <X className="h-4 w-4 mr-2" />
            )}
            <FormattedMessage id="projectCard.manageMembers.removeMember" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 