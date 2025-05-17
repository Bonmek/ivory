import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Basic file icons from lucide
import {
  FolderOpen,
  Github,
  GitBranch,
  Loader2,
  X,
} from 'lucide-react';
import { getLanguageIcon } from './languageIcons';
import { useRef, useState, useLayoutEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useIntl } from 'react-intl'
import { CircleAlert, ChevronDown, ChevronRight, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface Repository {
  id: number;
  name: string;
  default_branch: string;
  visibility: string;
  language?: string | null;
  [key: string]: any;
}

interface GithubRepoInputProps {
  githubUrl: string;
  handleGithubUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchRepository: string;
  handleSearchRepository: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: string | null;
  handleGithubSignIn: () => void;
  repositories: Repository[];
  filteredRepositories: Repository[];
  handleSelectRepository: (id: number | null, name: string) => void;
  selectedRepo: number | null;
  repoContents: any[] | null;
  repoContentsLoading: boolean;
  repoContentsError: string | null;
  handleLogout: () => void;
  setSelectedRepoFile: (file: File | null) => void;
  fileErrors: string[];
  branches: { name: string; commit: string; protected: boolean }[];
  selectedBranch: string | undefined;
  setSelectedBranch: (branch: string | undefined) => void;
}

function buildTree(items: any[]) {
  const root: any = {};
  for (const item of items) {
    const parts = item.path.split('/');
    let current = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {
          __info: i === parts.length - 1 ? item : null,
          __children: {},
        };
      }
      current = current[part].__children;
    }
  }
  return root;
}

interface TreeNodeProps {
  name: string;
  node: any;
  language?: string | null;
}

function TreeNode({ name, node, language }: TreeNodeProps) {
  const [open, setOpen] = useState(false);
  const isFolder = node.__info?.type === "tree" || node.__info?.type === "dir" || Object.keys(node.__children).length > 0;
  const fileExtension = name.split('.').pop()?.toLowerCase();
  const Icon = isFolder ? Folder : getLanguageIcon(language || fileExtension);

  if (isFolder) {
    return (
      <div key={node.__info?.path || name} className="space-y-1">
        <div
          className="flex items-center text-cyan-100 hover:bg-cyan-900/30 rounded px-2 py-1 cursor-pointer"
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        >
          {open ? (
            <ChevronDown className="w-4 h-4 mr-2 text-secondary-500" />
          ) : (
            <ChevronRight className="w-4 h-4 mr-2 text-secondary-500" />
          )}
          <Icon className="w-4 h-4 mr-2 text-secondary-500" />
          <span className="truncate flex-1" title={name}>{name}</span>
          {node.__info?.sha && (
            <span className="ml-2 text-xs text-gray-500 bg-gray-800 rounded px-1 py-0.5 select-all">
              {node.__info.sha.slice(0, 7)}
            </span>
          )}
        </div>
        {open && (
          <div className="ml-4">
            {Object.entries(node.__children).map(([childName, childNode]) => (
              <TreeNode key={childName} name={childName} node={childNode} language={language} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File
  return (
    <div key={node.__info?.path || name} className="flex items-center text-cyan-100 hover:bg-cyan-900/30 rounded px-2 py-1 ml-4">
      <Icon className="w-4 h-4 mr-2 text-cyan-200" />
      <span className="truncate flex-1" title={name}>{name}</span>
      {node.__info?.sha && (
        <span className="ml-2 text-xs text-gray-500 bg-gray-800 rounded px-1 py-0.5 select-all">
          {node.__info.sha.slice(0, 7)}
        </span>
      )}
    </div>
  );
}

export default function GithubRepoInput({
  githubUrl,
  handleGithubUrlChange,
  searchRepository,
  handleSearchRepository,
  user,
  selectedBranch,
  setSelectedBranch,
  handleGithubSignIn,
  repositories,
  handleSelectRepository,
  selectedRepo,
  repoContents,
  fileErrors,
  repoContentsLoading,
  repoContentsError,
  branches,
  handleLogout,
  setSelectedRepoFile,
}: GithubRepoInputProps) {
  const [userHover, setUserHover] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const [userBtnWidth, setUserBtnWidth] = useState<number | undefined>(undefined);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const intl = useIntl();

  // Set default branch when branches change
  useLayoutEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      const defaultBranch = branches.find(b => b.name === 'main') ||
        branches.find(b => b.name === 'master') ||
        branches[0];
      if (defaultBranch) {
        setSelectedBranch(defaultBranch.name);
      }
    }
  }, [branches, selectedBranch]);


  useLayoutEffect(() => {
    if (userBtnRef.current) {
      setUserBtnWidth(userBtnRef.current.offsetWidth);
    }
  }, [user, userHover]);

  return (
    <div className="space-y-4 overflow-y-auto">
      {(user && !selectedRepo) && (
        <div className='flex max-lg:flex-col w-full items-center gap-2'>
          <div
            className="relative w-full lg:w-auto"
            onMouseEnter={() => setUserHover(true)}
            onMouseLeave={() => setUserHover(false)}
          >
            {userHover ? (
              <Button
                size="sm"
                variant="destructive"
                className="w-full lg:w-auto bg-red-500 text-red-100 border-red-400 hover:bg-red-600 hover:text-white h-10 px-4 py-1 text-sm lg:text-xs shadow-lg transition-colors duration-200"
                style={userBtnWidth ? { minWidth: userBtnWidth } : undefined}
                onClick={() => setLogoutDialogOpen(true)}
              >
                <FormattedMessage id="createWebsite.githubLogout" />
              </Button>
            ) : (
              <Button
                ref={userBtnRef}
                className="w-full lg:w-auto bg-secondary-500 text-black hover:bg-secondary-600 border border-gray-700 rounded-md h-10 px-4 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis"
                title={user}
              >
                <Github className="h-5 w-5 flex-shrink-0" />
                <span className="truncate max-w-[180px] lg:max-w-[200px] md:max-w-xs">{user}</span>
              </Button>
            )}
          </div>
          {!selectedRepo && (
            <div className="relative w-full">
              <Input
                placeholder={intl.formatMessage({ id: 'createWebsite.githubSearch' })}
                value={searchRepository}
                onChange={handleSearchRepository}
                className="w-full bg-primary-500 border-gray-700 rounded-md h-10 pl-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
      {(!user) && (
        <section
          className="w-full bg-primary-900 hover:bg-primary-900 p-4 text-white border border-gray-700  rounded-md h-full transition-all duration-300 flex flex-col items-center justify-center gap-2"
        >
          <img src="/images/github-mark-white.png" alt="github" className="h-12 w-12" />
          <p className="text-center text-gray-400 text-sm max-w-md mx-auto px-4 py-1">
            <FormattedMessage id="createWebsite.githubDescription" />
          </p>
          <Button
            onClick={handleGithubSignIn}
            className="px-6 py-2 bg-secondary-500 m-1 text-black cursor-pointer hover:bg-secondary-300 border border-gray-700 rounded-md h-full transition-all duration-300 flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_10px_3px_rgba(255,255,255,0.3)]"
          >
            <FormattedMessage id="createWebsite.githubSignIn" />
          </Button>
        </section>
      )}
      {(!selectedRepo && repositories.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='flex flex-col border border-gray-700 rounded-lg overflow-hidden bg-primary-900 shadow-lg'
        >
          <div className='p-3 border-b border-gray-800 bg-primary-950/30'>
            <p className='text-sm text-gray-300 font-medium'>
              <FormattedMessage id='createWebsite.selectRepository' defaultMessage='Select a repository' />
            </p>
          </div>

          {repositories.filter(repo =>
            repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim())
          ).length > 0 ? (
            <motion.div
              layout
              className="flex flex-col divide-y divide-gray-800 max-h-[400px] overflow-y-auto custom-scrollbar"
            >
              {repositories.filter(repo =>
                repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim())
              ).map((repository, index) => (
                <motion.div
                  layout
                  key={repository.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{
                    duration: 0.15,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "group relative px-4 py-3 transition-colors duration-200",
                    selectedRepo === repository.id
                      ? "bg-secondary-500/10 border-l-4 border-secondary-500"
                      : "hover:bg-primary-800/50"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectRepository(repository.id, repository.name);
                    }
                  }}
                  aria-label={`Select repository ${repository.name}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-800 flex items-center justify-center">
                          {(() => {
                            const Icon = getLanguageIcon(repository.language);
                            return <Icon className="h-4 w-4 text-gray-300" />;
                          })()}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-100 truncate">
                          {repository.name}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-gray-400 bg-gray-800/60 px-2 py-0.5 rounded-full border border-gray-700">
                            {repository.default_branch}
                          </span>
                          <span className="text-xs text-gray-500">
                            {repository.visibility}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedRepo === repository.id ? (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRepository(repository.id, repository.name);
                        }}
                        size="sm"
                        className="bg-secondary-500 hover:bg-secondary-600 text-black transition-all duration-200"
                        aria-label="Selected repository"
                      >
                        <motion.span
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.15, ease: "easeInOut" }}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-sm">
                            <FormattedMessage id="createWebsite.githubSelected" />
                          </span>
                        </motion.span>
                      </Button>
                    ) : (
                      <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRepository(repository.id, repository.name);
                          }}
                          size="sm"
                          className="bg-primary-600/50 text-white hover:bg-primary-500/70 transition-all duration-200"
                          aria-label="Import repository"
                        >
                          <span className="flex items-center space-x-1.5 px-3 py-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              />
                            </svg>
                            <span className="text-sm">
                              <FormattedMessage id="createWebsite.githubImport" />
                            </span>
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-8 px-4 text-center"
            >
              <div className="bg-primary-800/50 rounded-full p-3 mb-3">
                <svg className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 font-medium">
                <FormattedMessage id="createWebsite.githubNoResults" />
              </p>
              <p className="text-sm text-gray-500 mt-1">
                <FormattedMessage id="createWebsite.tryDifferentSearch" defaultMessage="Try a different search term" />
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
      {selectedRepo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-primary-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-primary-900/80 to-primary-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary-500/10 rounded-lg">
                  <Github className="w-5 h-5 text-secondary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-100 text-xs sm:text-sm">
                    {repositories.find(repo => repo.id === selectedRepo)?.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                    <FormattedMessage id="createWebsite.selectedRepository" defaultMessage="Selected repository" />
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-[10px] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors border border-red-900/30"
                onClick={() => {
                  handleSelectRepository(null, 'Enter Project Name');
                  setSelectedRepoFile(null);
                  setSelectedBranch(undefined)
                }}
              >
                <X className="w-4 h-4 mr-1.5" />
                <FormattedMessage id="createWebsite.githubCancel" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {branches.length > 0 && !repoContentsLoading && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  <FormattedMessage id="createWebsite.selectBranch" />
                </label>
                <Select
                  value={selectedBranch}
                  onValueChange={(value) => setSelectedBranch(value)}
                >
                  <SelectTrigger className="w-full bg-primary-800 border-gray-700 hover:bg-primary-700/50 focus:ring-1 focus:ring-secondary-500 focus:ring-offset-1 focus:ring-offset-transparent">
                    <div className="flex items-center">
                      <GitBranch className="w-3.5 h-3.5 mr-2 text-secondary-400" />
                      <SelectValue placeholder="Select a branch" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-primary-900 border border-gray-700 shadow-lg">
                    {branches.map((branch) => (
                      <SelectItem
                        key={branch.name}
                        value={branch.name}
                        className="text-sm text-gray-200 hover:bg-primary-800 focus:bg-primary-800 focus:text-white"
                      >
                        <div className="flex items-center">
                          <span className="truncate">{branch.name}</span>
                          {branch.protected && (
                            <span className="ml-2 text-xs bg-yellow-900/30 text-yellow-400 px-1.5 py-0.5 rounded">
                              <FormattedMessage id="createWebsite.branchProtected" />
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {repoContentsLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center p-4 bg-cyan-950/20 rounded-lg border border-cyan-900/30"
              >
                <Loader2 className="w-5 h-5 mr-2 text-cyan-400 animate-spin" />
                <span className="text-cyan-300 text-xs sm:text-sm">
                  <FormattedMessage id="createWebsite.githubLoading" />
                </span>
              </motion.div>
            ) : repoContentsError ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center p-4 text-center bg-red-900/10 border border-red-900/20 rounded-lg"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 mb-2" />
                <p className="text-red-300 text-sm">
                  <FormattedMessage id="createWebsite.githubError" />
                </p>
                <p className="text-red-400/80 text-xs mt-1">
                  <FormattedMessage id="createWebsite.tryAgainLater" defaultMessage="Please try again later" />
                </p>
              </motion.div>
            ) : repoContents && Array.isArray(repoContents) ? (
              repoContents.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden"
                >
                  <div className="text-cyan-100 text-xs max-h-64 overflow-auto p-3 repo-scrollbar">
                    {Object.entries(buildTree(repoContents)).map(([name, node]) => {
                      const selectedRepoData = repositories.find(repo => repo.id === selectedRepo);
                      return (
                        <TreeNode
                          key={name}
                          name={name}
                          node={node}
                          language={selectedRepoData?.language}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-800 rounded-lg bg-gray-900/30"
                >
                  <FolderOpen className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-gray-400 text-sm">
                    <FormattedMessage id="createWebsite.githubEmpty" />
                  </p>
                </motion.div>
              )
            ) : null}
          </div>
        </motion.div>
      )
      }
      {
        !selectedRepo && (
          <section >
            <div className="flex items-center gap-4 mb-4 mt-1">
              <Separator className="flex-1" />
              <p className="text-center text-gray-400 px-4">
                <FormattedMessage id="createWebsite.or" />
              </p>
              <Separator className="flex-1" />
            </div>
            <Input
              placeholder={intl.formatMessage({ id: 'createWebsite.githubUrlPlaceholder' })}
              value={githubUrl}
              onChange={handleGithubUrlChange}
              className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
            />
            <p className="text-sm text-gray-400 mt-2">
              <FormattedMessage id="createWebsite.githubUrlExample" />
            </p>
          </section>
        )
      }
      {
        fileErrors.length > 0 && (
          <section className="mt-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
              {fileErrors.map((error, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CircleAlert className="w-4 h-4 text-red-400" />
                  <p className="text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )
      }
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="bg-primary-900 border-secondary-700 shadow-xl">
          <DialogHeader className="items-center">
            <div className="flex flex-col items-center gap-2">
              <AlertTriangle className="w-10 h-10 text-secondary-500 mb-1" />
              <DialogTitle className="text-secondary-500 font-pixel text-xl font-bold">Are you sure you want to logout?</DialogTitle>
            </div>
          </DialogHeader>
          <div className="text-center text-gray-300 mb-2">You will need to sign in again to access your repositories.</div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLogoutDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setLogoutDialogOpen(false);
                handleLogout();
              }}
              className="bg-secondary-500 hover:bg-secondary-700 text-white shadow"
            >
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
