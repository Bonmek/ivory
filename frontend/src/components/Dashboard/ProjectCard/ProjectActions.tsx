import { MoreHorizontal, Users, CalendarIcon, RefreshCw, Trash, Link, Loader2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface ProjectActionsProps {
  project: {
    status: number
    suins?: string
    parentId?: string
  }
  colors: {
    dropdown: string
  }
  open: boolean
  setOpen: (open: boolean) => void
  selectedSuins: string
  setSelectedSuins: (value: string) => void
  otherSuins: string
  setOtherSuins: (value: string) => void
  isLoadingSuins: boolean
  isRefreshing: boolean
  isLinking: boolean
  suins: any[]
  handleRefreshSuins: () => Promise<void>
  handleLinkSuins: () => Promise<void>
  handleDeleteSite: () => Promise<void>
}

export const ProjectActions = ({
  project,
  colors,
  open,
  setOpen,
  selectedSuins,
  setSelectedSuins,
  otherSuins,
  setOtherSuins,
  isLoadingSuins,
  isRefreshing,
  isLinking,
  suins,
  handleRefreshSuins,
  handleLinkSuins,
  handleDeleteSite,
}: ProjectActionsProps) => {
  return (
    <div className="absolute top-2 right-2 z-10 opacity-80 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-2">
      {!project.suins && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button
              className={`h-8 px-3 flex items-center justify-center rounded-full ${colors.dropdown} transition-all duration-200 hover:scale-110 active:scale-95`}
            >
              <Link className="h-4 w-4 mr-1.5" />
              <span className="text-sm">Link SUINS</span>
              <span className="text-[10px] opacity-60 ml-1">(initial setup)</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bg-primary-900 border-secondary-500/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-secondary-400">Link SUINS</DialogTitle>
              <DialogDescription className="text-white/60">
                Select your SUINS name to link it with this project
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                {isLoadingSuins ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-secondary-400" />
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 items-center">
                      <Select value={selectedSuins} onValueChange={setSelectedSuins}>
                        <SelectTrigger className="bg-primary-800 border-secondary-500/20 text-white w-full flex-1">
                          <SelectValue placeholder="Select SUINS domain" />
                        </SelectTrigger>
                        <SelectContent className="bg-primary-800 border-secondary-500/20 text-white">
                          {suins.map((sui) => (
                            <SelectItem
                              key={sui.data?.objectId}
                              value={sui.data?.content?.fields?.domain_name}
                              className="hover:bg-primary-700"
                            >
                              {sui.data?.content?.fields?.domain_name}
                            </SelectItem>
                          ))}
                          <SelectItem value="other" className="hover:bg-primary-700">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleRefreshSuins}
                        variant="outline"
                        className="border-secondary-500/20 text-white hover:bg-primary-800"
                        disabled={isLoadingSuins || isRefreshing}
                      >
                        {isRefreshing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {selectedSuins === 'other' && (
                      <Input
                        placeholder="Enter custom SUINS name"
                        value={otherSuins}
                        onChange={(e) => setOtherSuins(e.target.value)}
                        className="bg-primary-800 border-secondary-500/20 text-white mt-2"
                      />
                    )}
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleLinkSuins}
                  className="bg-secondary-500 hover:bg-secondary-600 text-white flex-1 relative"
                  disabled={isLinking || isLoadingSuins || !selectedSuins || (selectedSuins === 'other' && !otherSuins)}
                >
                  {isLinking ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span>Linking SUINS...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Link className="h-4 w-4 mr-2" />
                      <span>Link SUINS</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`h-8 w-8 flex items-center justify-center rounded-full ${colors.dropdown} transition-all duration-200 hover:scale-110 active:scale-95`}
            disabled={project.status === 0}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 bg-primary-900 border-secondary-500/20 text-white backdrop-blur-sm"
        >
          {project.status === 2 ? (
            <>
              <DropdownMenuItem className="focus:bg-primary-800">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Re-deploy</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-secondary-500/20" />
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400 focus:bg-primary-800"
                onClick={handleDeleteSite}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete site</span>
              </DropdownMenuItem>
            </>
          ) : project.status === 0 ? (
            <>
              <div className="px-4 py-2 text-yellow-400 flex items-center gap-2 text-sm">
                <Loader2 className="ml-1 h-3 w-3 text-yellow-300 animate-spin" />
                Deploying...
              </div>
            </>
          ) : (
            <>
              <DropdownMenuItem className="focus:bg-primary-800">
                <Users className="mr-2 h-4 w-4" />
                <span>Transfer ownership</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-primary-800">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Extend site</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-primary-800">
                <RefreshCw className="mr-2 h-4 w-4" />
                <span>Update site</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-secondary-500/20" />
              <DropdownMenuItem
                className="text-red-400 focus:text-red-400 focus:bg-primary-800"
                onClick={handleDeleteSite}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Delete site</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 