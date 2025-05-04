import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion"
import { ChevronDown, Github, HelpCircle, Plus, Upload, X } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/context/ThemeContext";
import GithubRepoInput from "@/components/CreateWebsite/GitHubRepoInput";
import FileUploadPreview from "@/components/CreateWebsite/FileUploadPreview";
import FileUploadDrop from "@/components/CreateWebsite/FileUploadDrop";
import FrameworkPresetSelector from "@/components/CreateWebsite/FrameworkPresetSelector";
import OwnershipRadioGroup from "@/components/CreateWebsite/OwnershipRadioGroup";
import { Ownership, UploadMethod } from "@/types/enums";

export default function CreateWebsitePage() {
  useTheme();

  // State for file upload
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>(UploadMethod.Upload)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [user, setUser] = useState<string | null>(null)

  // GitHub state
  const maxRepoView = 5
  const [githubUrl, setGithubUrl] = useState('')
  const [searchRepository, setSearchRepository] = useState('')
  const [repositories, setRepositories] = useState<Array<{ id: number; name: string }>>([])
  const [visibleRepos, setVisibleRepos] = useState(maxRepoView)
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)

  const [ownership, setOwnership] = useState<Ownership>(Ownership.Leave)

  const frameworks = [
    {
      id: 'next',
      name: 'Next.js',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path fill="currentColor" d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 1-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.5-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" />
        </svg>
      )
    },
    {
      id: 'react',
      name: 'React',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path fill="currentColor" d="M12 9.861a2.139 2.139 0 1 0 0 4.278 2.139 2.139 0 1 0 0-4.278zm-5.992 6.394l-.472-.12C2.018 15.246 0 13.737 0 11.996s2.018-3.25 5.536-4.139l.472-.119.133.468a23.53 23.53 0 0 0 1.363 3.578l.101.213-.101.213a23.307 23.307 0 0 0-1.363 3.578l-.133.467zM5.317 8.95c-2.674.751-4.315 1.9-4.315 3.046 0 1.145 1.641 2.294 4.315 3.046a24.95 24.95 0 0 1 1.182-3.046A24.752 24.752 0 0 1 5.317 8.95zm12.675 7.305l-.133-.469a23.357 23.357 0 0 0-1.364-3.577l-.101-.213.101-.213a23.42 23.42 0 0 0 1.364-3.578l.133-.468.473.119c3.517.889 5.535 2.398 5.535 4.14s-2.018 3.25-5.535 4.139l-.473.12zm-.491-4.259c.48 1.039.877 2.06 1.182 3.046 2.675-.752 4.315-1.901 4.315-3.046 0-1.146-1.641-2.294-4.315-3.046a24.788 24.788 0 0 1-1.182 3.046zM5.31 8.945l-.133-.467C4.188 4.992 4.488 2.494 6 1.622c1.483-.856 3.864.155 6.359 2.716l.34.349-.34.349a23.552 23.552 0 0 0-2.422 2.967l-.135.193-.235.02a23.657 23.657 0 0 0-3.785.61l-.472.119zm1.896-6.63c-.268 0-.505.058-.705.173-.994.573-1.17 2.565-.485 5.253a25.122 25.122 0 0 1 3.233-.501 24.847 24.847 0 0 1 2.052-2.544c-1.56-1.519-3.037-2.381-4.095-2.381zm9.589 20.362c-.001 0-.001 0 0 0-1.425 0-3.255-1.073-5.154-3.023l-.34-.349.34-.349a23.53 23.53 0 0 0 2.421-2.968l.135-.193.234-.02a23.63 23.63 0 0 0 3.787-.609l.472-.119.134.468c.987 3.484.688 5.983-.824 6.854a2.38 2.38 0 0 1-1.205.308zm-4.096-3.381c1.56 1.519 3.037 2.381 4.095 2.381h.001c.267 0 .505-.058.704-.173.994-.573 1.171-2.566.485-5.254a25.02 25.02 0 0 1-3.234.501 24.674 24.674 0 0 1-2.051 2.545zM18.69 8.945l-.472-.119a23.479 23.479 0 0 0-3.787-.61l-.234-.02-.135-.193a23.414 23.414 0 0 0-2.421-2.967l-.34-.349.34-.349C14.135 1.778 16.515.767 18 1.622c1.512.872 1.812 3.37.824 6.855l-.134.468zM14.75 7.24c1.142.104 2.227.273 3.234.501.686-2.688.509-4.68-.485-5.253-.988-.571-2.845.304-4.8 2.208A24.849 24.849 0 0 1 14.75 7.24zM7.206 22.677A2.38 2.38 0 0 1 6 22.369c-1.512-.871-1.812-3.369-.823-6.854l.132-.468.472.119c1.155.291 2.429.496 3.785.609l.235.02.134.193a23.596 23.596 0 0 0 2.422 2.968l.34.349-.34.349c-1.898 1.95-3.728 3.023-5.151 3.023zm-1.19-6.427c-.686 2.688-.509 4.681.485 5.254.987.563 2.843-.305 4.8-2.208a24.998 24.998 0 0 1-2.052-2.545 24.976 24.976 0 0 1-3.233-.501zM12 16.878c-.823 0-1.669-.036-2.516-.106l-.235-.02-.135-.193a30.388 30.388 0 0 1-1.35-2.122 30.354 30.354 0 0 1-1.166-2.228l-.1-.213.1-.213a30.3 30.3 0 0 1 1.166-2.228c.414-.716.869-1.43 1.35-2.122l.135-.193.235-.02a29.785 29.785 0 0 1 5.033 0l.234.02.134.193a30.006 30.006 0 0 1 2.517 4.35l.101.213-.101.213a29.6 29.6 0 0 1-2.517 4.35l-.134.193-.234.02c-.847.07-1.694.106-2.517.106zm-2.197-1.084c1.48.111 2.914.111 4.395 0a29.006 29.006 0 0 0 2.196-3.798 28.585 28.585 0 0 0-2.197-3.798 29.031 29.031 0 0 0-4.394 0 28.477 28.477 0 0 0-2.197 3.798 29.114 29.114 0 0 0 2.197 3.798z" />
        </svg>
      )
    },
    {
      id: 'angular',
      name: 'Angular',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <path fill="currentColor" d="M9.931 12.645h4.138l-2.07-4.908m0-7.737L.68 3.982l1.726 14.771L12 24l9.596-5.242L23.32 3.984 11.999.001zm7.064 18.31h-2.638l-1.422-3.503H8.996l-1.422 3.504h-2.64L12 2.65z" />
        </svg>
      )
    },
  ]

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_center,_#2a2a2a,_#000000)] relative">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto px-6 py-12 pt-28"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold mb-8 bg-gradient-to-r "
        >
          Create new project
        </motion.h1>

        <article className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-10 rounded-lg bg-[#1a1a1a]/60 border border-gray-800/50 backdrop-blur-lg shadow-lg"
          >
            <section className="mb-6 flex items-center">
              <h2 className="text-lg font-semibold">Project files</h2>
              <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
            </section>

            <RadioGroup
              defaultValue="upload"
              className="mb-6"
              value={uploadMethod}
              onValueChange={(value) => setUploadMethod(value as UploadMethod)}
            >
              <section className="flex items-center space-x-8">
                <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
                  <RadioGroupItem value="upload" id="upload" />
                  <Label htmlFor="upload" className="flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Label>
                </div>
                <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
                  <RadioGroupItem value="github" id="github" />
                  <Label htmlFor="github" className="flex items-center">
                    <Github className="h-4 w-4 mr-2" />
                    Github
                  </Label>
                </div>
              </section>
            </RadioGroup>

            {uploadMethod === UploadMethod.Upload ? (
              <section
                className={cn(
                  "border-2 border-dashed border-gray-700 rounded-lg p-12 flex flex-col items-center justify-center transition-all duration-300",
                  isDragging && "border-[#e94057] bg-[#2a2a2a]/50",
                  selectedFile && "border-green-500",
                  error && "border-red-500"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".zip"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                />

                {selectedFile ? (
                  <FileUploadPreview fileName={selectedFile.name} onRemove={handleRemoveFile} />
                ) : (
                  <FileUploadDrop error={error} handleBrowseClick={handleBrowseClick} />
                )}
              </section>
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
            className="space-y-8"
          >

            <section>
              <Label htmlFor="name" className="text-lg font-semibold block mb-4 bg-gradient-to-r ">
                Name
              </Label>
              <Input id="name" className="bg-[#2a2a2a] border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]" />
            </section>

            <section>
              <div className="flex items-center mb-4">
                <h2 className="text-sm text-gray-300 font-semibold bg-gradient-to-r ">Ownership</h2>
                <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
              </div>
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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <Collapsible className="w-full bg-[#1a1a1a]/70  backdrop-blur-3xl shadow-lg p-2 px-4 rounded-xl">
                    <div className="flex items-center justify-between px-2 ">
                      <h2 className="font-semibold bg-gradient-to-r text-base text-white ">Build and Output settings</h2>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="ml-2 hover:text-[#e94057] transition-colors">
                          <ChevronDown className="h-5 w-5" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>


                    <CollapsibleContent className="space-y-6">
                      <div className='px-2 mt-4 border-t border-gray-800'>
                        <div className="flex items-center mt-4 mb-2">
                          <h3 className="text-sm text-gray-300 font-semibold">Root Directory</h3>
                          <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
                        </div>
                        <Input
                          placeholder="/"
                          className="bg-[#2a2a2a] border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]"
                        />
                      </div>

                      <div className='px-2'>
                        <div className="flex items-center mb-2">
                          <h3 className="text-sm text-gray-300 font-semibold">Build Command</h3>
                          <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
                        </div>
                        <Input
                          placeholder="npm run build"
                          className="bg-[#2a2a2a] border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]"
                        />
                      </div>

                      <div className='px-2 mb-4'>
                        <div className="flex items-center mb-2">
                          <h3 className="text-sm text-gray-300 font-semibold">Output Directory</h3>
                          <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
                        </div>
                        <Input
                          placeholder="dist"
                          className="bg-[#2a2a2a] border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]"
                        />
                      </div>

                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Collapsible className="w-full bg-[#1a1a1a]/70  backdrop-blur-3xl shadow-lg p-2 px-4 rounded-xl">
                  <div className="flex items-center justify-between px-2 ">
                    <h2 className="font-semibold bg-gradient-to-r text-base text-white ">Advanced options</h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="ml-2 hover:text-[#e94057] transition-colors">
                        <ChevronDown className="h-5 w-5" />
                      </Button>
                    </CollapsibleTrigger>
                  </div>


                  <CollapsibleContent className="space-y-6">
                    <section className='px-2 mt-4 border-t border-gray-800'>
                      <div className="flex items-center mt-4 mb-2">
                        <h3 className="text-sm text-gray-300  font-semibold">Cache Control</h3>
                        <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
                      </div>
                      <Select>
                        <SelectTrigger className="bg-[#2a2a2a] border-gray-700 rounded-md h-12 transition-all duration-300 hover:border-[#e94057]">
                          <SelectValue placeholder="Select cache control" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-cache">No Cache</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </section>

                    <section className='px-4'>
                      <div className="flex items-center mb-2 ">
                        <h3 className="text-sm text-gray-300 font-semibold">Permissions</h3>
                        <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 px-2">
                        <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
                          <Checkbox id="camera" className="border-gray-700" />
                          <Label htmlFor="camera">Camera</Label>
                        </div>
                        <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
                          <Checkbox id="microphone" className="border-gray-700" />
                          <Label htmlFor="microphone">Microphone</Label>
                        </div>
                        <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
                          <Checkbox id="location" className="border-gray-700" />
                          <Label htmlFor="location">Location</Label>
                        </div>
                        <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
                          <Checkbox id="notifications" className="border-gray-700" />
                          <Label htmlFor="notifications">Notifications</Label>
                        </div>
                      </div>
                    </section>

                    <section className='px-2'>
                      <div className="flex items-center mb-2">
                        <h3 className="text-sm text-gray-300 font-semibold">Route</h3>
                        <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Input className="bg-[#2a2a2a] border-gray-700 rounded-md h-8 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]" />
                        <span>to</span>
                        <Input className="bg-[#2a2a2a] border-gray-700 rounded-md h-8 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]" />
                        <Button variant="ghost" size="icon" className="rounded-full bg-[#e94057] hover:bg-[#d13046] transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#e94057]/20">
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                    </section>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>
            </article>

            <Separator className="mb-4" />
            <div className="pt-4 flex justify-end">
              <Button className="bg-[#e94057] hover:bg-[#d13046] text-white p-6 rounded-md text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#e94057]/20">
                Create project
              </Button>
            </div>
          </motion.div>
        </article>
      </motion.main >
    </main >
  )
}
