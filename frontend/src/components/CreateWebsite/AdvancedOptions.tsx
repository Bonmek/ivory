import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronRight, Folder, File as FileIcon, HelpCircle, HelpCircleIcon, Plus, X, FolderOpen } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { advancedOptionsType } from '@/types/CreateWebstie/types'
import { CacheControl } from '@/types/CreateWebstie/enums'
import { useState } from 'react'
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { FormattedMessage } from 'react-intl'
import { useIntl } from 'react-intl'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface FileItem {
  name: string;
  isFolder: boolean;
  path: string;
  children?: FileItem[];
}

interface AdvancedOptionsProps {
  advancedOptions: advancedOptionsType
  setAdvancedOptions: (options: advancedOptionsType) => void
  fileStructure?: FileItem[]
  githubContents?: any[] | null
}

interface GitHubTreeItem {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  children: Record<string, GitHubTreeItem>;
}

function buildDirectoryTree(items: any[]): GitHubTreeItem[] {
  const root: Record<string, GitHubTreeItem> = {};

  items.forEach(item => {
    if (!item.path) return;

    const pathParts = item.path.split('/');
    let currentLevel = root;

    pathParts.forEach((part: string, index: number) => {
      if (!part) return; // Skip empty parts (e.g., from leading/trailing slashes)

      if (!currentLevel[part]) {
        const isDirectory = index < pathParts.length - 1 || item.type === 'tree';
        currentLevel[part] = {
          name: part,
          path: pathParts.slice(0, index + 1).join('/'),
          type: isDirectory ? 'tree' : 'blob',
          children: {}
        };
      }

      if (index < pathParts.length - 1) {
        currentLevel = currentLevel[part].children;
      }
    });
  });

  return Object.values(root);
}

function AdvancedOptions({ advancedOptions, setAdvancedOptions, fileStructure = [], githubContents = [] }: AdvancedOptionsProps) {
  const [showFileSelector, setShowFileSelector] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  const renderGitHubTreeItem = (item: GitHubTreeItem, level = 0) => {
    const hasChildren = Object.keys(item.children).length > 0;
    const isExpanded = expandedFolders.has(item.path);
    const hasSubdirectories = hasChildren && Object.values(item.children).some(child => child.type === 'tree');

    if (item.type !== 'tree') return null;

    return (
      <div key={item.path} className="space-y-1">
        <div
          className="flex items-center text-cyan-100 hover:bg-cyan-900/30 rounded px-2 py-1 cursor-pointer"
          style={{ paddingLeft: `${level * 12}px` }}
          onClick={() => {
            setAdvancedOptions({ ...advancedOptions, rootDirectory: `/${item.path}` });
            setShowFileSelector(false);
          }}
        >
          {hasSubdirectories ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(item.path);
              }}
              className="mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-secondary-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-secondary-500" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 mr-1" />
          )}
          <Folder className="w-4 h-4 mr-2 text-secondary-500" />
          <span className="text-sm">{item.name}</span>
        </div>
        {isExpanded && hasChildren && (
          <div className="ml-4">
            {Object.values(item.children).map(child =>
              renderGitHubTreeItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  console.log("githubContents", githubContents)

  const toggleFolder = (path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const renderFileItem = (item: FileItem) => {
    if (item.isFolder) {
      const isExpanded = expandedFolders.has(item.path)
      return (
        <div key={item.path} className="space-y-1">
          <div
            className="flex items-center text-cyan-100 hover:bg-cyan-900/30 rounded px-2 py-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation()
              toggleFolder(item.path)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-secondary-500" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-secondary-500" />
            )}
            <Folder className="w-4 h-4 mr-2 text-secondary-500" />
            <span
              className="flex-1 truncate"
              onClick={(e) => {
                e.stopPropagation()
                setAdvancedOptions({ ...advancedOptions, rootDirectory: `/${item.path}` })
                setShowFileSelector(false)
              }}
            >
              {item.name}
            </span>
          </div>
          {isExpanded && item.children && (
            <div className="ml-4">
              {item.children.map(child => renderFileItem(child))}
            </div>
          )}
        </div>
      )
    }
    return null // Only show folders in the selector
  }
  const intl = useIntl()
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <section className="w-full bg-primary-700/70  backdrop-blur-3xl shadow-lg p-2 px-4 rounded-xl">
        <div className="flex items-center justify-between px-2 cursor-pointer"
          onClick={() => setIsOpen((prev) => !prev)}>
          <h2 className="font-semibold bg-gradient-to-r text-base text-white ">
            <FormattedMessage id="createWebsite.advancedOptions" />
          </h2>
          <Button
            variant="link"
            size="sm"
            className="ml-2 hover:bg-primary-700/70 cursor-pointer hover:text-secondary-500 transition-colors"
            aria-expanded={isOpen}
            aria-controls="advanced-options-content"
          >
            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id="advanced-options-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className='space-y-6'
            >

              <section className='px-2 mt-4'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.rootDirectory" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                        onClick={() => {
                          const helpCenter = document.getElementById('advanced-options')
                          if (helpCenter) {
                            helpCenter.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.rootDirectoryTooltip" /> <FormattedMessage id="createWebsite.rootDirectoryTooltipDescription" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="relative">
                  <div className="relative group w-full">
                    <Input
                      value={advancedOptions.rootDirectory || '/'}
                      onChange={(e) => setAdvancedOptions({ ...advancedOptions, rootDirectory: e.target.value })}
                      placeholder="/"
                      className="w-full bg-primary-500/80 border-gray-600 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/50 pr-10 backdrop-blur-sm group-hover:bg-primary-500/90 text-sm sm:text-base"
                      readOnly={true}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-primary-400/20 transition-colors duration-200"
                      onClick={() => setShowFileSelector(true)}
                      aria-label="Select directory"
                    >
                      <Folder className="h-4 w-4 text-secondary-500" />
                    </Button>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-700/30 rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                <Dialog open={showFileSelector} onOpenChange={setShowFileSelector}>
                  <DialogContent className="w-[calc(100%-2rem)] sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-[800px] max-h-[90vh] flex flex-col bg-gradient-to-br from-primary-700/90 via-primary-800/95 to-primary-900 border border-primary-600/50 shadow-2xl shadow-primary-900/50 backdrop-blur-sm">
                    <DialogHeader className="px-1 sm:px-0">
                      <div className="relative">
                        <div className="absolute -left-2 -top-2 w-8 h-8 sm:w-10 sm:h-10 bg-secondary-500/20 rounded-full blur-md animate-pulse" />
                        <DialogTitle className="relative text-white text-lg sm:text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                          <FormattedMessage id="createWebsite.selectRootDirectory" />
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-gray-300/90 mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed">
                        <FormattedMessage id="createWebsite.selectRootDirectoryDescription" />
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 flex flex-col py-2">
                      <div className="space-y-1.5 flex-1 flex flex-col">
                        <div
                          className="flex items-center text-cyan-50 hover:bg-gradient-to-r from-cyan-900/20 to-cyan-900/5 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 border border-transparent hover:border-cyan-500/20 group"
                          onClick={() => {
                            setAdvancedOptions({ ...advancedOptions, rootDirectory: '/' })
                            setShowFileSelector(false)
                          }}
                        >
                          <div className="relative">
                            <Folder className="w-5 h-5 mr-3 text-secondary-500 group-hover:scale-110 transition-transform duration-200" />
                            <div className="absolute inset-0 bg-secondary-500/20 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                          </div>
                          <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">/ (root)</span>
                          <span className="ml-auto text-xs text-gray-400 group-hover:text-cyan-300 transition-colors hidden sm:inline">Select</span>
                        </div>

                        <div className="max-h-[50vh] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1 sm:pr-2 -mr-2 custom-scrollbar flex-1">
                          {fileStructure.length > 0 && (
                            <div className="space-y-1">
                              {fileStructure.map(item => renderFileItem(item))}
                            </div>
                          )}

                          {githubContents && githubContents.length > 0 && (
                            <div className="space-y-1">
                              {buildDirectoryTree(githubContents).map(item =>
                                renderGitHubTreeItem(item)
                              )}
                            </div>
                          )}

                          {fileStructure.length === 0 && (!githubContents || githubContents.length === 0) && (
                            <div className="flex flex-col items-center border border-gray-600 rounded-md justify-center py-4 sm:py-6 px-4 text-center">
                              <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500/50 mb-2 sm:mb-3" />
                              <p className="text-xs text-gray-500 mt-1 px-2">Upload files or connect a repository to see directories</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </section>

              <section className='px-2 mt-4'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.defaultPath" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                        onClick={() => {
                          const helpCenter = document.getElementById('advanced-options')
                          if (helpCenter) {
                            helpCenter.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.defaultPathTooltip" /> <FormattedMessage id="createWebsite.defaultPathTooltipDescription" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={advancedOptions.defaultPath}
                  onChange={(e) => setAdvancedOptions({ ...advancedOptions, defaultPath: e.target.value })}
                  placeholder="/index.html"
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2 mt-4 mb-4'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.cacheControl" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                        onClick={() => {
                          const helpCenter = document.getElementById('advanced-options')
                          if (helpCenter) {
                            helpCenter.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.cacheControlTooltip" /> <FormattedMessage id="createWebsite.cacheControlTooltipDescription" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={advancedOptions.cacheControl} onValueChange={(value) => setAdvancedOptions({ ...advancedOptions, cacheControl: value as CacheControl })}>
                  <SelectTrigger className="bg-primary-500 border-gray-700 rounded-md h-12 transition-all duration-300 hover:border-secondary-500 w-full">
                    <SelectValue placeholder="Select cache control" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-500">
                    <SelectItem value={CacheControl.NoCache}>No Cache</SelectItem>
                    <SelectItem value={CacheControl.OneDay}>1 Day</SelectItem>
                    <SelectItem value={CacheControl.OneWeek}>1 Week</SelectItem>
                    <SelectItem value={CacheControl.OneMonth}>1 Month</SelectItem>
                    <SelectItem value={CacheControl.OneYear}>1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  )
}

export default AdvancedOptions
