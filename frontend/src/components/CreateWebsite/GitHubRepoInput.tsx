import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Github, Loader2, X } from 'lucide-react'
import { useRef, useState, useLayoutEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useIntl } from 'react-intl'
import { CircleAlert, ChevronDown, ChevronRight, Folder, File as FileIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";



interface GithubRepoInputProps {
  githubUrl: string;
  handleGithubUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchRepository: string;
  handleSearchRepository: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: string | null;
  handleGithubSignIn: () => void;
  repositories: Array<{ id: number; name: string; default_branch: string, visibility: string }>;
  filteredRepositories: Array<{ id: number; name: string; default_branch: string, visibility: string }>;
  handleSelectRepository: (id: number | null) => void;
  selectedRepo: number | null;
  repoContents: any[] | null;
  repoContentsLoading: boolean;
  repoContentsError: string | null;
  handleLogout: () => void;
  setSelectedRepoFile: (file: File | null) => void;
  downloadRepositoryZip: (owner: string, repo: string) => Promise<void>;
  fileErrors: string[];
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

function TreeNode({ name, node }: { name: string; node: any }) {
  const [open, setOpen] = useState(false);
  const isFolder = node.__info?.type === "tree" || node.__info?.type === "dir" || Object.keys(node.__children).length > 0;

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
          <Folder className="w-4 h-4 mr-2 text-secondary-500" />
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
              <TreeNode key={childName} name={childName} node={childNode} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File
  return (
    <div key={node.__info?.path || name} className="flex items-center text-cyan-100 hover:bg-cyan-900/30 rounded px-2 py-1 ml-4">
      <FileIcon className="w-4 h-4 mr-2 text-cyan-200" />
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
  handleGithubSignIn,
  repositories,
  handleSelectRepository,
  selectedRepo,
  repoContents,
  fileErrors,
  downloadRepositoryZip,
  repoContentsLoading,
  repoContentsError,
  handleLogout,
  setSelectedRepoFile,
}: GithubRepoInputProps) {
  const [userHover, setUserHover] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const [userBtnWidth, setUserBtnWidth] = useState<number | undefined>(undefined);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const intl = useIntl();

  useLayoutEffect(() => {
    if (userBtnRef.current) {
      setUserBtnWidth(userBtnRef.current.offsetWidth);
    }
  }, [user, userHover]);

  return (
    <div className="space-y-4 overflow-y-auto">
      {(user && !selectedRepo) && (
        <div className='flex max-lg:flex-col items-center gap-2'>
          <div
            className="relative"
            onMouseEnter={() => setUserHover(true)}
            onMouseLeave={() => setUserHover(false)}
          >
            {userHover ? (
              <Button
                size="sm"
                variant="destructive"
                className="max-lg:w-full w-fit bg-red-500 text-red-400 border-red-400 hover:bg-red-700 hover:text-white h-10 px-4 py-1 text-xs shadow-lg"
                style={userBtnWidth ? { width: userBtnWidth } : undefined}
                onClick={() => setLogoutDialogOpen(true)}
              >
                <FormattedMessage id="createWebsite.githubLogout" />
              </Button>
            ) : (
              <Button
                ref={userBtnRef}
                className="max-lg:w-full w-fit bg-secondary-500 text-black hover:bg-secondary-700 border border-gray-700 rounded-md h-10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Github className="h-5 w-5" />
                {user}
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
        <Button
          onClick={handleGithubSignIn}
          className="w-full bg-secondary-500 hover:bg-secondary-700 text-black border border-gray-700 rounded-md h-10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Github className="h-5 w-5" />
          <FormattedMessage id="createWebsite.githubSignIn" />
        </Button>
      )}
      {(!selectedRepo && repositories.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='flex flex-col gap-2 border border-gray-700 rounded-sm p-2 bg-primary-900'
        >
          {repositories.filter(repo =>
            repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim())
          ).length > 0 ? (
            <motion.div
              layout
              className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2"
            >
              {repositories.filter(repo =>
                repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim())
              ).map((repository, index) => (
                <motion.div
                  layout
                  key={repository.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.2,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className={cn(
                    "p-2 px-4 rounded-lg bg-primary-900 hover:bg-primary-700/80 transition-all duration-300 flex items-center justify-between group shadow-sm hover:shadow-md",
                    selectedRepo === repository.id
                      ? "bg-primary-600/90 border border-secondary-400 ring-1 ring-secondary-300/50"
                      : "border border-gray-700/50"
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleSelectRepository(repository.id);
                      downloadRepositoryZip(user!, repository.name);
                    }
                  }}
                  aria-label={`Select repository ${repository.name}`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="text-sm font-medium text-gray-100 truncate">
                      {repository.name}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded-full">
                      {repository.default_branch}
                    </span>
                    <span className="text-xs text-gray-400 italic">
                      {repository.visibility}
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      handleSelectRepository(repository.id);
                      downloadRepositoryZip(user!, repository.name);
                    }}
                    size="sm"
                    className={cn(
                      "opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-semibold",
                      selectedRepo === repository.id
                        ? "bg-secondary-500 hover:bg-secondary-600 text-black"
                        : "bg-primary-500 text-white hover:bg-primary-600"
                    )}
                    aria-label={selectedRepo === repository.id ? "Selected repository" : "Import repository"}
                  >
                    {selectedRepo === repository.id ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-secondary-400 text-black text-xs font-semibold"
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
                        <FormattedMessage id="createWebsite.githubSelected" />
                      </motion.span>
                    ) : (
                      <span className="flex items-center space-x-1">
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
                        <FormattedMessage id="createWebsite.githubImport" />
                      </span>
                    )}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center py-4 text-gray-400"
            >
              <FormattedMessage id="createWebsite.githubNoResults" />
            </motion.div>
          )}
        </motion.div>
      )}
      {selectedRepo && (
        <div className=" p-2 bg-primary-900 rounded-xl">
          <div className="flex items-center justify-between mb-2 rounded px-3 ">
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-secondary-500" />
              <span className="font-semibold text-secondary-500 text-md">{repositories.find(repo => repo.id === selectedRepo)?.name}</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-3 py-1 border-red-400 text-red-400 hover:bg-red-700 hover:text-white"
              onClick={() => { handleSelectRepository(null); setSelectedRepoFile(null); }}
            >
              <X className="w-4 h-4 mr-1 inline-block" />
              <FormattedMessage id="createWebsite.githubCancel" />
            </Button>
          </div>
          <Separator className="my-2 bg-secondary-700" />
          {repoContentsLoading && (
            <div className="flex flex-row items-center justify-center gap-2 h-10 text-cyan-300 text-sm animate-pulse  bg-cyan-950/80 rounded-md px-4 py-2 my-2 w-full mx-auto">
              <Loader2 className="w-4 h-4 animate-spin" />
              <FormattedMessage id="createWebsite.githubLoading" />
            </div>
          )}
          {repoContentsError && (
            <div className="flex flex-col items-center justify-center text-center border border-red-500 bg-red-950/80 text-red-300 text-sm rounded-md px-4 py-3 my-2 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
              <FormattedMessage id="createWebsite.githubError" />
            </div>
          )}
          {repoContents && !repoContentsLoading && Array.isArray(repoContents) && repoContents.length > 0 && (
            <div className="text-cyan-100 text-xs max-h-64 overflow-auto bg-gray-900 rounded-lg p-2 py-4 repo-scrollbar">
              {Object.entries(buildTree(repoContents)).map(([name, node]) => (
                <TreeNode key={name} name={name} node={node} />
              ))}
            </div>
          )}
          {repoContents && !repoContentsLoading && Array.isArray(repoContents) && repoContents.length === 0 && !repoContentsError && (
            <div className="text-cyan-200 text-xs">
              <FormattedMessage id="createWebsite.githubEmpty" />
            </div>
          )}
        </div>
      )}
      {!selectedRepo && (
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
      )}
      {fileErrors.length > 0 && (
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
      )}
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
    </div>
  );
}
