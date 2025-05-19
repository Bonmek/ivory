import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button";
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronRight, Folder, File as FileIcon, HelpCircle, FolderOpen } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { buildOutputSettingsType } from '@/types/CreateWebstie/types'
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useState } from 'react'
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

interface GitHubTreeItem {
  name: string;
  path: string;
  type: 'tree' | 'blob';
  children: Record<string, GitHubTreeItem>;
}

interface BuildOutputSettingProps {
  showBuildOutputSettings: boolean
  setShowBuildOutputSettings: (show: boolean) => void
  buildOutputSettings: buildOutputSettingsType
  setBuildOutputSettings: (settings: buildOutputSettingsType) => void
  fileStructure?: FileItem[]
  githubContents?: any[] | null
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

const BuildOutputSetting: React.FC<BuildOutputSettingProps> = ({ 
  showBuildOutputSettings, 
  setShowBuildOutputSettings, 
  buildOutputSettings, 
  setBuildOutputSettings,
  fileStructure = [],
  githubContents = []
}) => {
  const intl = useIntl();
  const [showFileSelector, setShowFileSelector] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  
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

  const renderGitHubTreeItem = (item: GitHubTreeItem, level = 0) => {
    const hasChildren = Object.keys(item.children).length > 0;
    const isExpanded = expandedFolders.has(item.path);
    const hasSubdirectories = hasChildren && Object.values(item.children).some(child => child.type === 'tree');

    if (item.type !== 'tree') return null;

    return (
      <div key={item.path} className="space-y-1">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: level * 0.05 }}
          className="group flex items-center hover:bg-gray-800/50 rounded px-2 py-1.5 cursor-pointer transition-colors"
          style={{ marginLeft: `${level * 8}px` }}
          onClick={() => {
            if (!hasSubdirectories) {
              setBuildOutputSettings({ ...buildOutputSettings, rootDirectory: `/${item.path}` });
              setShowFileSelector(false);
            }
          }}
        >
          {hasSubdirectories ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(item.path);
              }}
              className="text-gray-400 hover:text-secondary-400 transition-colors mr-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-4 h-4 mr-1" />
          )}
          <Folder className="w-4 h-4 mr-2 text-cyan-400/80 group-hover:text-cyan-300 transition-colors" />
          <span className="text-sm text-gray-200 group-hover:text-white transition-colors">
            {item.name}
          </span>
          <span
            className="ml-auto text-xs text-gray-500 group-hover:text-cyan-300 transition-colors hidden sm:inline"
            onClick={(e) => {
              e.stopPropagation();
              setBuildOutputSettings({ ...buildOutputSettings, rootDirectory: `/${item.path}` });
              setShowFileSelector(false);
            }}
          >
            Select
          </span>
        </motion.div>
        {isExpanded && hasChildren && (
          <div className="border-l border-gray-800/50 ml-2 pl-2">
            {Object.values(item.children).map(child =>
              renderGitHubTreeItem(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFileItem = (item: FileItem, level = 0) => {
    if (item.isFolder) {
      const isExpanded = expandedFolders.has(item.path);
      const hasSubFolders = item.children?.some(child => child.isFolder) || false;

      return (
        <div key={item.path} className="space-y-1">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: level * 0.05 }}
            className="group flex items-center hover:bg-gray-800/50 rounded px-2 py-1.5 cursor-pointer transition-colors"
            style={{ marginLeft: `${level * 8}px` }}
            onClick={(e) => {
              e.stopPropagation();
              if (hasSubFolders) {
                toggleFolder(item.path);
              } else {
                setBuildOutputSettings({ ...buildOutputSettings, rootDirectory: `/${item.path}` });
                setShowFileSelector(false);
              }
            }}
          >
            {hasSubFolders ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(item.path);
                }}
                className="text-gray-400 hover:text-secondary-400 transition-colors mr-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="w-4 h-4 mr-1" />
            )}
            <Folder className="w-4 h-4 mr-2 text-cyan-400/80 group-hover:text-cyan-300 transition-colors" />
            <span className="text-sm text-gray-200 group-hover:text-white transition-colors truncate">
              {item.name}
            </span>
            <span
              className="ml-auto text-xs text-gray-500 group-hover:text-cyan-300 transition-colors hidden sm:inline"
              onClick={(e) => {
                e.stopPropagation();
                setBuildOutputSettings({ ...buildOutputSettings, rootDirectory: `/${item.path}` });
                setShowFileSelector(false);
              }}
            >
              Select
            </span>
          </motion.div>
          {isExpanded && item.children && (
            <div className="border-l border-gray-800/50 ml-2 pl-2">
              {item.children.map(child => renderFileItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }
    return null; // Only show folders in the selector
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <article className="w-full bg-primary-700/70  backdrop-blur-3xl shadow-lg p-4 rounded-xl">
        <div className="flex items-center px-2 ">

          <Checkbox
            id="showBuildOutputSettings"
            checked={showBuildOutputSettings}
            onCheckedChange={(checked: boolean) => setShowBuildOutputSettings(checked)}
            className="mr-4 border-white/60 cursor-pointer"
          />
          <Label htmlFor="showBuildOutputSettings" className="font-semibold text-base text-white cursor-pointer select-none">
            <FormattedMessage id="createWebsite.buildAndOutputSettings" />
          </Label>
        </div>
        <AnimatePresence initial={false}>
          {showBuildOutputSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className='space-y-6'
            >

              <section className='px-2 mt-6'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.installCommand" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                        onClick={() => {
                          const helpCenter = document.getElementById('build-output-setting')
                          if (helpCenter) {
                            helpCenter.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.installCommandTooltip" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={buildOutputSettings.installCommand}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, installCommand: e.target.value })}
                  placeholder={intl.formatMessage({ id: 'createWebsite.installCommandPlaceholder' })}
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.buildCommand" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                        onClick={() => {
                          const helpCenter = document.getElementById('build-output-setting')
                          if (helpCenter) {
                            helpCenter.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.buildCommandTooltip" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={buildOutputSettings.buildCommand}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, buildCommand: e.target.value })}
                  placeholder={intl.formatMessage({ id: 'createWebsite.buildCommandPlaceholder' })}
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.outputDirectory" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                        onClick={() => {
                          const helpCenter = document.getElementById('build-output-setting')
                          if (helpCenter) {
                            helpCenter.scrollIntoView({ behavior: 'smooth' })
                          }
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.outputDirectoryTooltip" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={buildOutputSettings.outputDirectory}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, outputDirectory: e.target.value })}
                  placeholder={intl.formatMessage({ id: 'createWebsite.outputDirectoryPlaceholder' })}
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2 mb-4'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.rootDirectory" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                        onClick={() => {
                          const helpCenter = document.getElementById('build-output-setting')
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
                      value={buildOutputSettings.rootDirectory || '/'}
                      onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, rootDirectory: e.target.value })}
                      placeholder="/"
                      className="w-full bg-primary-500/80 border-gray-600 rounded-md h-10 transition-all cursor-pointer duration-300 focus:border-secondary-500 focus:ring-1 focus:ring-secondary-500/50 pr-10 backdrop-blur-sm group-hover:bg-primary-500/90 text-sm sm:text-base"
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
                  <DialogContent className="w-[calc(100%-2rem)] sm:w-[90%] md:w-[80%] lg:w-[70%] max-w-[800px] max-h-[90vh] flex flex-col bg-gradient-to-br from-primary-900/95 via-primary-900/90 to-primary-900/95 shadow-2xl shadow-primary-900/30 backdrop-blur-sm overflow-hidden">
                    <DialogHeader className="px-1 sm:px-0 relative z-10">
                      <div className="relative inline-block">
                        <div className="absolute -left-2 -top-2 w-8 h-8 sm:w-10 sm:h-10 bg-secondary-500/20 rounded-full blur-md animate-pulse" />
                        <DialogTitle className="relative text-lg sm:text-xl font-semibold text-white">
                          <FormattedMessage id="createWebsite.selectRootDirectory" />
                        </DialogTitle>
                      </div>
                      <DialogDescription className="text-gray-400/90 mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed">
                        <FormattedMessage id="createWebsite.selectRootDirectoryDescription" />
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 flex flex-col py-2 relative z-10">
                      <div className="space-y-2 flex-1 flex flex-col">
                        {/* Root directory option */}
                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="flex items-center bg-primary-800/30 hover:bg-primary-700/40 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-200 border border-transparent hover:border-cyan-500/20 group"
                          onClick={() => {
                            setBuildOutputSettings({ ...buildOutputSettings, rootDirectory: '/' });
                            setShowFileSelector(false);
                          }}
                        >
                          <div className="relative">
                            <Folder className="w-5 h-5 text-secondary-400 group-hover:text-secondary-300 transition-colors duration-200" />
                            <div className="absolute inset-0 bg-secondary-500/20 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                          </div>
                          <span className="ml-3 text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
                            / (root)
                          </span>
                          <span className="ml-auto text-xs text-gray-500 group-hover:text-cyan-300 transition-colors hidden sm:inline">
                            Select
                          </span>
                        </motion.div>

                        <div className="max-h-[50vh] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto pr-1 sm:pr-2 -mr-2 custom-scrollbar flex-1 bg-primary-900/30 rounded-lg p-2">
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
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-800 rounded-lg bg-gray-900/30"
                            >
                              <FolderOpen className="w-10 h-10 text-gray-500/60 mb-3" />
                              <p className="text-sm text-gray-400">
                                Upload files or connect a repository to see directories
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full -ml-20 -mb-20 blur-3xl pointer-events-none" />
                  </DialogContent>
                </Dialog>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.div >
  )
}

export default BuildOutputSetting
