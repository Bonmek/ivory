import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion"
import { Github, HelpCircle, Upload } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/context/ThemeContext";
import GithubRepoInput from "@/components/CreateWebsite/GitHubRepoInput";
import FileUploadPreview from "@/components/CreateWebsite/FileUploadPreview";
import FileUploadDrop from "@/components/CreateWebsite/FileUploadDrop";
import FrameworkPresetSelector from "@/components/CreateWebsite/FrameworkPresetSelector";
import OwnershipRadioGroup from "@/components/CreateWebsite/OwnershipRadioGroup";
import { CacheControl, Ownership, UploadMethod } from "@/types/CreateWebstie/enums";
import BuildOutputSetting from "@/components/CreateWebsite/BuildOutputSetting";
import AdvancedOptions from "@/components/CreateWebsite/AdvancedOptions";
import { advancedOptionsType, buildOutputSettingsType } from "@/types/CreateWebstie/types";
import { frameworks } from "@/constants/frameworks";

export default function CreateWebsitePage() {
  useTheme();

  // State for build output settings
  const [buildOutputSettings, setBuildOutputSettings] = useState<buildOutputSettingsType>({
    rootDirectory: '',
    buildCommand: '',
    outputDirectory: '',
  })

  // State for advanced options
  const [advancedOptions, setAdvancedOptions] = useState<advancedOptionsType>({
    cacheControl: CacheControl.NoCache,
    route: [
      {
        name: '',
        path: ''
      }
    ]
  })

  // State for file upload
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>(UploadMethod.Upload)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [user, setUser] = useState<string | null>(null)
  const [showBuildOutputSettings, setShowBuildOutputSettings] = useState(false)

  // GitHub state
  const maxRepoView = 5
  const [githubUrl, setGithubUrl] = useState('')
  const [searchRepository, setSearchRepository] = useState('')
  const [repositories, setRepositories] = useState<Array<{ id: number; name: string }>>([])
  const [visibleRepos, setVisibleRepos] = useState(maxRepoView)
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)

  const [ownership, setOwnership] = useState<Ownership>(Ownership.Leave)

  // File handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file)
      setError(null)
    } else {
      setError('Please upload a ZIP file')
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file)
      setError(null)
    } else {
      setError('Please upload a ZIP file')
    }
  }

  const handleSearchRepository = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchRepository(e.target.value)
    setVisibleRepos(maxRepoView)
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // GitHub handlers
  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value)
  }

  const handleGithubSignIn = () => {
    // !TODO: Implement this with the backend
  }

  const fetchRepositories = async () => {
    try {
      // !TODO: Implement this with the backend
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // !TODO: Implement this with the backend
    fetchRepositories()
  }, []);

  const handleShowMore = () => {
    setVisibleRepos(prev => prev + maxRepoView)
  }

  const filteredRepositories = repositories
    .filter(repo =>
      repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim())
    )
    .slice(0, visibleRepos)

  const handleSelectRepository = (id: number) => {
    setSelectedRepo(id)
    setSelectedFramework(null)
  }

  const handleSelectFramework = (frameworkId: string) => {
    setSelectedFramework(frameworkId)
  }


  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Radial background เหมือนหน้า Home */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#16202a_0%,_#10151c_100%)]" />
      {/* Layer gradient ฟ้าอ่อน */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/30 via-transparent to-cyan-900/20" />
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-cyan-400/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-2xl animate-pulse-slower" />
        <div className="absolute right-1/4 bottom-1/4 w-[400px] h-[400px] bg-cyan-300/10 rounded-full blur-2xl animate-pulse-slower" />
      </div>
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 7s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slow 12s ease-in-out infinite;
        }
        .animated-border {
          position: relative;
          background: #10151c;
          border-radius: 0.75rem;
          padding: 2px;
          overflow: hidden;
        }
        .animated-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          padding: 2px;
          background: linear-gradient(90deg, #22d3ee 0%, #0ea5e9 25%, #22d3ee 50%, #0ea5e9 75%, #22d3ee 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          background-size: 200% 100%;
          animation: shine 3s linear infinite;
        }
        @keyframes shine {
          to {
            background-position: 200% 0;
          }
        }
      `}</style>
      {/* เนื้อหา */}
      <motion.main className="relative z-10 max-w-7xl mx-auto px-6 py-12 pt-28">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-semibold font-pixel mb-8 bg-gradient-to-r"
        >
          Create new project
        </motion.h1>

        <article className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-8 rounded-2xl bg-[#10151c]/80 border border-cyan-900/40 shadow-2xl backdrop-blur-xl self-start w-full"
          >
            <section className="mb-6 flex items-center">
              <h2 className="text-lg font-semibold">Project files</h2>
              <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
            </section>

            <RadioGroup
              defaultValue="upload"
              className="mb-6"
              value={uploadMethod}
              onValueChange={(value) => setUploadMethod(value as UploadMethod)}
            >
              <section className="flex items-center space-x-8">
                <div className="flex items-center space-x-2 hover:text-secondary-500 transition-colors">
                  <RadioGroupItem value="upload" id="upload" />
                  <Label htmlFor="upload" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Label>
                </div>
                <div className="flex items-center space-x-2 hover:text-secondary-500 transition-colors">
                  <RadioGroupItem value="github" id="github" />
                  <Label htmlFor="github" className="flex items-center">
                    <Github className="h-4 w-4 mr-2" />
                    Github
                  </Label>
                </div>
              </section>
            </RadioGroup>

            {uploadMethod === UploadMethod.Upload ? (
              <>
                <section
                  className={cn(
                    "relative flex flex-col items-center justify-center w-full min-h-[160px] backdrop-blur-xl transition-all duration-300 cursor-pointer overflow-hidden",
                    isDragging && "ring-4 ring-cyan-400/40",
                    error && "ring-4 ring-red-400/40"
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                  tabIndex={0}
                  role="button"
                  style={{ margin: "0 auto" }}
                >
                  {!selectedFile && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ borderRadius: '0.75rem' }}>
                      <rect
                        x="4" y="4" width="calc(100% - 8px)" height="calc(100% - 8px)"
                        rx="12" ry="12"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="2.5"
                        strokeDasharray="16,10"
                        strokeDashoffset="0"
                        style={{
                          animation: 'dashmove 1.5s linear infinite'
                        }}
                      />
                    </svg>
                  )}
                  <style>{`
                    @keyframes dashmove {
                      to {
                        stroke-dashoffset: -52px;
                      }
                    }
                  `}</style>
                  <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept=".zip"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileInput}
                    />
                    {selectedFile ? (
                      <FileUploadPreview file={selectedFile} onRemove={handleRemoveFile} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 w-full relative z-10">
                        <Upload className="w-14 h-14 text-cyan-400 mb-2 drop-shadow-lg" />
                        <p className="text-base font-bold text-cyan-100 text-center mb-1">
                          Drag & drop <span className="text-cyan-400">ZIP file</span> here
                        </p>
                        <div className="flex items-center gap-3 my-3 w-full max-w-[240px]">
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
                          <div className="relative px-3 py-1 rounded-full bg-cyan-400/5 backdrop-blur-sm">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 animate-[spin_3s_linear_infinite]"></div>
                            <div className="absolute inset-[1px] rounded-full bg-[#10151c]"></div>
                            <span className="relative text-[11px] font-medium bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text text-transparent uppercase tracking-wider">or</span>
                          </div>
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
                        </div>
                        <button
                          type="button"
                          className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold shadow-md hover:from-cyan-300 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200"
                          onClick={e => { e.stopPropagation(); handleBrowseClick(); }}
                        >
                          Browse file
                        </button>
                        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                      </div>
                    )}
                  </div>
                </section>
              </>
            ) : (
              <GithubRepoInput
                githubUrl={githubUrl}
                handleGithubUrlChange={handleGithubUrlChange}
                searchRepository={searchRepository}
                handleSearchRepository={handleSearchRepository}
                user={user}
                handleGithubSignIn={handleGithubSignIn}
                repositories={repositories}
                filteredRepositories={filteredRepositories}
                handleSelectRepository={handleSelectRepository}
                selectedRepo={selectedRepo}
                handleShowMore={handleShowMore}
                visibleRepos={visibleRepos}
                selectedFramework={selectedFramework}
                frameworks={frameworks}
                handleSelectFramework={handleSelectFramework}
                selectedFile={selectedFile}
                error={error}
                fileInputRef={fileInputRef}
                handleFileInput={handleFileInput}
                handleBrowseClick={handleBrowseClick}
                handleRemoveFile={handleRemoveFile}
                isDragging={isDragging}
                setIsDragging={setIsDragging}
                setSelectedFile={setSelectedFile}
                setError={setError}
              />
            )}
          </motion.div>

          {/* Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8 self-start w-full"
          >
            <section>
              <Label htmlFor="name" className="text-lg font-semibold block mb-4 bg-gradient-to-r">
                Name
              </Label>
              <Input id="name" className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500" />
            </section>

            <section>
              <OwnershipRadioGroup value={ownership} onChange={setOwnership} />
            </section>

            {(selectedRepo || selectedFile) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FrameworkPresetSelector
                  frameworks={frameworks}
                  selectedFramework={selectedFramework}
                  handleSelectFramework={handleSelectFramework}
                />
              </motion.div>
            )}

            <article className="flex flex-col gap-4">
              {(selectedRepo || selectedFile) && (
                <BuildOutputSetting
                  showBuildOutputSettings={showBuildOutputSettings}
                  setShowBuildOutputSettings={setShowBuildOutputSettings}
                  buildOutputSettings={buildOutputSettings}
                  setBuildOutputSettings={setBuildOutputSettings}
                />
              )}
              <AdvancedOptions
                advancedOptions={advancedOptions}
                setAdvancedOptions={setAdvancedOptions}
              />
            </article>

            <Separator className="mb-4" />
            <section className="pt-4 flex justify-end">
              <Button className="bg-secondary-500 hover:bg-secondary-700 text-black p-6 rounded-md text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/20">
                Create project
              </Button>
            </section>
          </motion.div>
        </article>
      </motion.main>
    </main>
  )
}
