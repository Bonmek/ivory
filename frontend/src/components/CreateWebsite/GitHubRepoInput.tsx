import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Folder, File as FileIcon } from "lucide-react";
import { useState, useRef, useLayoutEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface GithubRepoInputProps {
  githubUrl: string;
  handleGithubUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchRepository: string;
  handleSearchRepository: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: string | null;
  handleGithubSignIn: () => void;
  repositories: Array<{ id: number; name: string }>;
  filteredRepositories: Array<{ id: number; name: string }>;
  handleSelectRepository: (id: number | null) => void;
  selectedRepo: number | null;
  handleShowMore: () => void;
  visibleRepos: number;
  repoContents: any[] | null;
  repoContentsLoading: boolean;
  repoContentsError: string | null;
  handleLogout: () => void;
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
  filteredRepositories,
  handleSelectRepository,
  selectedRepo,
  handleShowMore,
  visibleRepos,
  repoContents,
  repoContentsLoading,
  repoContentsError,
  handleLogout,
}: GithubRepoInputProps) {
  const [userHover, setUserHover] = useState(false);
  const userBtnRef = useRef<HTMLButtonElement>(null);
  const [userBtnWidth, setUserBtnWidth] = useState<number | undefined>(undefined);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useLayoutEffect(() => {
    if (userBtnRef.current) {
      setUserBtnWidth(userBtnRef.current.offsetWidth);
    }
  }, [user, userHover]);

  return (
    <div className="space-y-4">
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
                Logout
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
                placeholder="Search repositories..."
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
      {(!user && !selectedRepo) && (
        <Button
          onClick={handleGithubSignIn}
          className="w-full bg-secondary-500 hover:bg-secondary-700 text-black border border-gray-700 rounded-md h-10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Github className="h-5 w-5" />
          Sign in with GitHub
        </Button>
      )}
      {(!selectedRepo && repositories.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='flex flex-col gap-2 border border-gray-700 rounded-md p-2 bg-primary-900'
        >
          {filteredRepositories.length > 0 ? (
            <motion.div
              layout
              className="flex flex-col gap-2"
            >
              {filteredRepositories.map((repository, index) => (
                <motion.div
                  layout
                  key={repository.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: index * 0.03
                  }}
                  className={cn(
                    "p-1 px-4 rounded-md hover:bg-primary-700 transition-all flex items-center justify-between group",
                    selectedRepo === repository.id ? "bg-primary-500 border border-secondary-500" : "border border-transparent"
                  )}
                >
                  <span className="truncate text-sm">{repository.name}</span>
                  <Button
                    onClick={() => handleSelectRepository(repository.id)}
                    size="sm"
                    className={cn(
                      "opacity-0 group-hover:opacity-100 text-sm transition-opacity",
                      selectedRepo === repository.id ? "bg-secondary-500 hover:bg-secondary-700" : "bg-primary-500 text-white hover:bg-primary-600"
                    )}
                  >
                    {selectedRepo === repository.id ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="ml-2 px-2 py-0.5 rounded-full bg-secondary-500 text-black text-xs font-semibold align-middle"
                      >
                        Selected
                      </motion.span>
                    ) : 'Import'}
                  </Button>
                </motion.div>
              ))}
              {filteredRepositories.length < repositories.filter(repo =>
                repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim())
              ).length && (
                  <motion.div
                    layout
                    className="mt-2 pt-2 border-t border-gray-700"
                  >
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleShowMore}
                      className="w-full group flex flex-col items-center gap-1 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
                    >
                      <span className="text-sm">
                        Show {Math.min(5, repositories.length - visibleRepos)} more repositories
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500 group-hover:text-gray-400">
                        <span>
                          {visibleRepos} of {repositories.length} shown
                        </span>
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </motion.div>
                  </motion.div>
                )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-center py-4 text-gray-400"
            >
              No repositories found matching "{searchRepository}"
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
              onClick={() => handleSelectRepository(null)}
            >
              <X className="w-4 h-4 mr-1 inline-block" />
              Cancel
            </Button>
          </div>
          <Separator className="my-2 bg-secondary-700" />
          {repoContentsLoading && (
            <div className="flex flex-row items-center justify-center gap-2 h-10 text-cyan-300 text-sm animate-pulse  bg-cyan-950/80 rounded-md px-4 py-2 my-2 w-full mx-auto">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p className="font-pixel">Loading repository contents...</p>
            </div>
          )}
          {repoContentsError && (
            <div className="flex flex-col items-center justify-center text-center border border-red-500 bg-red-950/80 text-red-300 text-sm rounded-md px-4 py-3 my-2 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
              </svg>
              <span>{repoContentsError}</span>
            </div>
          )}
          {repoContents && Array.isArray(repoContents) && repoContents.length > 0 && (
            <div className="text-cyan-100 text-xs max-h-64 overflow-auto bg-gray-900 rounded-lg p-2 py-4 repo-scrollbar">
              {Object.entries(buildTree(repoContents)).map(([name, node]) => (
                <TreeNode key={name} name={name} node={node} />
              ))}
            </div>
          )}
          {repoContents && Array.isArray(repoContents) && repoContents.length === 0 && !repoContentsLoading && !repoContentsError && (
            <div className="text-cyan-200 text-xs">(Empty directory)</div>
          )}
        </div>
      )}
      {!selectedRepo && (
        <section >
          <div className="flex items-center gap-4 mb-4 mt-1">
            <Separator className="flex-1" />
            <p className="text-center text-gray-400 px-4">or</p>
            <Separator className="flex-1" />
          </div>
          <Input
            placeholder="Enter GitHub repository URL"
            value={githubUrl}
            onChange={handleGithubUrlChange}
            className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
          />
          <p className="text-sm text-gray-400 mt-2">
            Example: https://github.com/username/repository
          </p>
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
