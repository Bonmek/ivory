import { Separator } from "../ui/separator";
import { motion } from "framer-motion"
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

// Type for GithubRepoInput props
interface GithubRepoInputProps {
  githubUrl: string;
  handleGithubUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchRepository: string;
  handleSearchRepository: (e: React.ChangeEvent<HTMLInputElement>) => void;
  user: string | null;
  handleGithubSignIn: () => void;
  repositories: Array<{ id: number; name: string }>;
  filteredRepositories: Array<{ id: number; name: string }>;
  handleSelectRepository: (id: number) => void;
  selectedRepo: number | null;
  handleShowMore: () => void;
  visibleRepos: number;
  selectedFramework: string | null;
  frameworks: Array<{ id: string; name: string; icon: React.ReactNode }>;
  handleSelectFramework: (id: string) => void;
  selectedFile: File | null;
  error: string | null;
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  handleFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBrowseClick: () => void;
  handleRemoveFile: () => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  setSelectedFile: (file: File | null) => void;
  setError: (error: string | null) => void;
}

// GithubRepoInput extracted from left column
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
  selectedFramework,
  frameworks,
  handleSelectFramework,
  selectedFile,
  error,
  fileInputRef,
  handleFileInput,
  handleBrowseClick,
  handleRemoveFile,
  isDragging,
  setIsDragging,
  setSelectedFile,
  setError,
}: GithubRepoInputProps) {
  return (
    <div className="space-y-4">
      {user ? (
        <div className='flex max-lg:flex-col items-center gap-2'>
          <Button
            className="max-lg:w-full w-fit bg-[#e94057] hover:bg-[#d13046] text-white border border-gray-700 rounded-md h-10 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Github className="h-5 w-5" />
            {user}
          </Button>
          <div className="relative w-full">
            <Input
              placeholder="Search repositories..."
              value={searchRepository}
              onChange={handleSearchRepository}
              className="w-full bg-[#2a2a2a] border-gray-700 rounded-md h-10 pl-10 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={handleGithubSignIn}
          className="w-full bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white border border-gray-700 rounded-md h-10 transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Github className="h-5 w-5" />
          Sign in with GitHub
        </Button>
      )}
      {repositories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='flex flex-col gap-2 border border-gray-700 rounded-md p-2 bg-[#1a1a1a]'
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
                    "p-1 px-4 rounded-md hover:bg-[#3a3a3a] transition-all flex items-center justify-between group",
                    selectedRepo === repository.id ? "bg-[#2a2a2a] border border-[#e94057]" : "border border-transparent"
                  )}
                >
                  <span className="truncate text-sm">{repository.name}</span>
                  <Button
                    onClick={() => handleSelectRepository(repository.id)}
                    size="sm"
                    className={cn(
                      "opacity-0 group-hover:opacity-100 text-sm transition-opacity",
                      selectedRepo === repository.id ? "bg-[#e94057] hover:bg-[#d13046]" : "bg-[#2a2a2a] hover:bg-[#1a1a1a]"
                    )}
                  >
                    {selectedRepo === repository.id ? 'Selected' : 'Import'}
                  </Button>
                </motion.div>
              ))}
              {filteredRepositories.length < repositories.filter(repo =>
                repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim())
              ).length && (
                  <motion.div
                    layout
                    className="mt-4 pt-4 border-t border-gray-800"
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
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <p className="text-center text-gray-400 px-4">or</p>
        <Separator className="flex-1" />
      </div>
      <Input
        placeholder="Enter GitHub repository URL"
        value={githubUrl}
        onChange={handleGithubUrlChange}
        className="bg-[#2a2a2a] border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]"
      />
      <p className="text-sm text-gray-400">
        Example: https://github.com/username/repository
      </p>
    </div>
  );
}