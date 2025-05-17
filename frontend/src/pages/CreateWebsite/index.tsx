import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CirclePlus, Github, HelpCircle, Upload, Archive, BadgeCheck, SlidersHorizontal, Package, Settings2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useTheme } from '@/context/ThemeContext'
import { toast } from 'sonner'
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

import GithubRepoInput from '@/components/CreateWebsite/GitHubRepoInput'
import FileUploadPreview from '@/components/CreateWebsite/FileUploadPreview'
import FrameworkPresetSelector from '@/components/CreateWebsite/FrameworkPresetSelector'
import {
  BuildingState,
  CacheControl,
  DeployingState,
  UploadMethod,
} from '@/types/CreateWebstie/enums'
import BuildOutputSetting from '@/components/CreateWebsite/BuildOutputSetting'
import AdvancedOptions from '@/components/CreateWebsite/AdvancedOptions'
import {
  advancedOptionsType,
  ApiResponse,
  ApiResponseError,
  ApiResponseSuccess,
  buildOutputSettingsType,
  GitHubApiError,
  GitHubApiResponse,
  Repository,
} from '@/types/CreateWebstie/types'
import { frameworks } from '@/constants/frameworks'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Helmet } from 'react-helmet'
import { WebsiteAttributes, writeBlobAndRunJob } from '@/api/createWebsiteApi'
import { useWalletKit } from '@mysten/wallet-kit'
import { addDays } from 'date-fns'
import apiClient from '@/lib/axiosConfig'
import { useQuery } from 'wagmi/query'
import { PreviewSummary } from '@/components/CreateWebsite/PreviewSummary'
import CreateWebsiteDialog from '@/components/CreateWebsiteDialog'
import { FormattedMessage, useIntl } from 'react-intl'
import { useEffect, useRef, useState } from 'react'
import HelpCenter from '@/components/CreateWebsite/HelpCenter'
import { FileItem } from '@/components/CreateWebsite/FileUploadPreview'
import JSZip from 'jszip'
import { useSuiData } from '@/hooks/useSuiData'
import { transformMetadataToProject } from '@/utils/metadataUtils'
import { Project } from '@/types/project'


export default function CreateWebsitePage() {
  useTheme()
  const { currentAccount } = useWalletKit()
  const { metadata, isLoading, refetch } = useSuiData(currentAccount?.address || '')

  const intl = useIntl()

  // State to control preview visibility
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (showPreview) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showPreview]);

  // State for project name
  const [name, setName] = useState('')
  const [nameErrors, setNameErrors] = useState<string[]>([])
  const [placeHolderName, setPlaceHolderName] = useState('Enter Project Name')

  // State for build output settings
  const [buildOutputSettings, setBuildOutputSettings] =
    useState<buildOutputSettingsType>({
      buildCommand: '',
      installCommand: '',
      outputDirectory: '',
    })

  // State for advanced options
  const [advancedOptions, setAdvancedOptions] = useState<advancedOptionsType>({
    cacheControl: CacheControl.NoCache,
    defaultPath: '/index.html',
    rootDirectory: '/',
  })

  // State for create website dialog
  const [open, setOpen] = useState(false)

  // State for deploying
  const [deployingState, setDeployingState] = useState<DeployingState>(DeployingState.None)
  const [deployingResponse, setDeployingResponse] = useState<ApiResponse | null>(null)
  const [buildingState, setBuildingState] = useState<BuildingState>(BuildingState.None)
  const [deployedObjectId, setDeployedObjectId] = useState<string | null>(null)

  // State for file upload
  const [uploadMethod, setUploadMethod] = useState<UploadMethod>(
    UploadMethod.Upload,
  )
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileErrors, setFileErrors] = useState<string[]>([])
  const [fileStructure, setFileStructure] = useState<FileItem[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [user, setUser] = useState<string | null>(null)
  const [showBuildOutputSettings, setShowBuildOutputSettings] = useState(false)
  const MAX_FILE_SIZE = 300 * 1024 * 1024 // 300MB in bytes

  // Validate name field
  const validateName = (value: string) => {
    const errors: string[] = []
    if (!value.trim()) {
      errors.push(intl.formatMessage({ id: 'createWebsite.error.required' }))
    }
    setNameErrors(errors)
    return errors.length === 0
  }

  // Validate file
  const validateFile = () => {
    const errors: string[] = []
    if (!selectedFile && uploadMethod === UploadMethod.Upload) {
      errors.push(intl.formatMessage({ id: 'createWebsite.error.zipFile' }))
    }
    if (!selectedRepoFile && uploadMethod === UploadMethod.GitHub) {
      errors.push(intl.formatMessage({ id: 'createWebsite.error.githubRepo' }))
    }
    setFileErrors(errors)
    return errors.length === 0
  }

  // Handle name change with validation
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    validateName(value)
  }

  // GitHub state
  const maxRepoView = 5
  const [githubUrl, setGithubUrl] = useState('')
  const [selectedRepoFile, setSelectedRepoFile] = useState<File | null>(null)
  const [searchRepository, setSearchRepository] = useState('')
  const [visibleRepos, setVisibleRepos] = useState(maxRepoView)
  const [selectedRepo, setSelectedRepo] = useState<number | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [repoContents, setRepoContents] = useState<any[] | null>(null)
  const [repoContentsLoading, setRepoContentsLoading] = useState(false)
  const [repoContentsError, setRepoContentsError] = useState<string | null>(null)
  const [branches, setBranches] = useState<{ name: string; commit: string; protected: boolean }[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>('main')

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

    if (file) {
      if (!file.name.endsWith('.zip')) {
        setFileErrors([intl.formatMessage({ id: 'createWebsite.error.invalidFileType' })])
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileErrors([intl.formatMessage({ id: 'createWebsite.error.fileTooLarge' }, { maxSize: '300MB' })])
        return
      }

      setSelectedFile(file)
      setFileErrors([])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const MAX_FILE_SIZE = 300 * 1024 * 1024 // 500MB in bytes

    if (file) {
      if (!file.name.endsWith('.zip')) {
        setFileErrors([intl.formatMessage({ id: 'createWebsite.error.invalidFileType' })])
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        setFileErrors([intl.formatMessage({ id: 'createWebsite.error.fileTooLarge' }, { maxSize: '300MB' })])
        return
      }

      setSelectedFile(file)
      setFileErrors([])
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
    setAdvancedOptions({ ...advancedOptions, rootDirectory: '/' })
    setFileErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // GitHub handlers
  const handleGithubUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGithubUrl(e.target.value)
  }

  const handleGithubSignIn = () => {
    window.location.href = `${process.env.REACT_APP_SERVER_URL}${process.env.REACT_APP_API_GITHUB_AUTH}`
  }

  const fetchRepositories = async () => {
    try {
      const res: GitHubApiResponse<Repository[]> = await apiClient.get(
        process.env.REACT_APP_API_REPOSITORIES || '',
      )
      if (res.status === 401) {
        throw new Error('Unauthorized')
      }
      return Array.isArray(res.data) ? res.data : []
    } catch (error) {
      const apiError = error as GitHubApiError
      if (apiError.response?.status === 401) {
        setUser(null)
        throw new Error('Unauthorized')
      }
      throw error
    }
  }

  // Function to download repository zip, set as selected file, and download to local
  const downloadRepositoryZip = async (owner: string, repo: string, branch?: string) => {
    try {
      const branch = selectedBranch || 'main';
      const response = await apiClient.get(`/api/repositories/${owner}/${repo}/download`, {
        responseType: 'blob',
        params: { branch }
      });

      const zipBlob = new Blob([response.data], { type: 'application/zip' });
      const fileName = `${repo}-${branch}.zip`;

      // Create a File object for internal app use
      const file = new File([zipBlob], fileName, { type: 'application/zip' });
      setSelectedRepoFile(file);
      setFileErrors([]);
      setUploadMethod(UploadMethod.GitHub);

      // Trigger download to local
      const url = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up

      toast.success('Repository downloaded successfully');
    } catch (error) {
      console.error('Error downloading repository:', error);
      toast.error('Failed to download repository. Please try again.');
    }
  };

  useEffect(() => {
    apiClient
      .get(process.env.REACT_APP_API_USER || '')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
    setDeployingState(DeployingState.None)
  }, [])

  const { data } = useQuery({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
    enabled: !!user,
  })
  const repositories = (data ?? []) as Repository[]

  const filteredRepositories = repositories
    .filter((repo: Repository) =>
      repo.name.toLowerCase().includes(searchRepository.toLowerCase().trim()),
    )
    .slice(0, visibleRepos)

  const handleSelectRepository = (id: number | null, name: string) => {
    setSelectedRepo(id)
    setPlaceHolderName(name)
    setAdvancedOptions({ ...advancedOptions, rootDirectory: '/' })
  }

  const fetchBranches = async () => {
    try {
      const repo = repositories.find((r) => r.id === selectedRepo)
      if (!repo) return
      const response = await apiClient.get(`/api/repositories/${repo.owner}/${repo.name}/branches`)
      const branches = response.data as { name: string; commit: string; protected: boolean }[]
      setBranches(branches)
    } catch (error) {
      console.error('Error fetching branches:', error)
    }
  }

  const handleSelectFramework = (frameworkId: string) => {
    setSelectedFramework(frameworkId)
  }

  const handleClickDeploy = async () => {
    setOpen(false)
    try {
      const attributes: WebsiteAttributes = {
        'site-name': name,
        owner: currentAccount?.address!,
        ownership: '0',
        send_to: currentAccount?.address!,
        epochs: '1',
        start_date: new Date().toISOString(),
        end_date: addDays(new Date(), 14).toISOString(),
        status: '0',
        cache: advancedOptions.cacheControl,
        root: advancedOptions.rootDirectory || '/',
        install_command: buildOutputSettings.installCommand || 'npm install',
        build_command: buildOutputSettings.buildCommand || 'npm run build',
        default_route: advancedOptions.defaultPath || '/index.html',
        is_build: showBuildOutputSettings ? '0' : '1',
      }

      setDeployingState(DeployingState.Deploying)

      const response = await writeBlobAndRunJob({
        file: uploadMethod === "upload" ? selectedFile! : selectedRepoFile!,
        attributes,
      })
      setDeployingState(DeployingState.Deployed)
      setDeployingResponse(response as unknown as ApiResponseSuccess)
      setDeployedObjectId((response as unknown as ApiResponseSuccess).objectId)
      return response
    } catch (error) {
      console.error('Error:', error)
      setDeployingState(DeployingState.Failed)
      setDeployingResponse(error as ApiResponseError)
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      const response = await apiClient.get('/auth/github/logout');
      if (response.status !== 200) {
        throw new Error('Logout failed');
      }

      setUser(null)
      setSelectedRepo(null)
      setGithubUrl('')
      setSearchRepository('')
      setRepoContents(null)
      setRepoContentsError(null)
      setRepoContentsLoading(false)

      toast.success('Successfully logged out');

      window.location.href = '/create-website';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');

      setUser(null)
      setSelectedRepo(null)
      setGithubUrl('')
      setSearchRepository('')
      setRepoContents(null)
      setRepoContentsError(null)
      setRepoContentsLoading(false)
      window.location.href = '/create-website';
    }
  }

  useEffect(() => {
    if (selectedRepo == null) {
      setRepoContents(null)
      setRepoContentsError(null)
      setRepoContentsLoading(false)
      return
    }
    const repo = repositories.find((r) => r.id === selectedRepo)
    if (!repo) return
    setRepoContentsLoading(true)
    setRepoContentsError(null)
    fetchBranches()
    downloadRepositoryZip(repo.owner, repo.name, selectedBranch)

    apiClient
      .get(
        `${process.env.REACT_APP_API_REPOSITORIES}/${repo.owner}/${repo.name}/contents`,
        {
          params: {
            branch: selectedBranch || 'main'
          }
        }
      )
      .then((res) => {
        setRepoContents(res.data)
        setRepoContentsLoading(false)
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setUser(null)
          setRepoContents(null)
          setRepoContentsError(
            'Unauthorized. Please sign in to GitHub to access repository contents.',
          )
        } else {
          setRepoContentsError('Failed to fetch repository contents')
        }
        setRepoContentsLoading(false)
      })
  }, [selectedRepo, repositories, selectedBranch])

  useEffect(() => {
    if (selectedFile) {
      const fileReader = new FileReader()
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const zip = await JSZip.loadAsync(arrayBuffer)
          const files: string[] = []

          zip.forEach((relativePath: string, file: any) => {
            if (!file.dir) {
              files.push(relativePath)
            }
          })

          // Convert flat file list to hierarchical structure
          const structure: FileItem[] = []
          const pathMap = new Map<string, FileItem>()

          files.forEach(filePath => {
            const parts = filePath.split('/')
            let currentPath = ''
            let currentParent = structure

            parts.forEach((part, index) => {
              if (!part) return
              currentPath = currentPath ? `${currentPath}/${part}` : part
              const isLastPart = index === parts.length - 1

              if (!pathMap.has(currentPath)) {
                const isFolder = !isLastPart
                const newItem: FileItem = {
                  name: part,
                  isFolder,
                  path: currentPath,
                  children: []
                }

                currentParent.push(newItem)
                pathMap.set(currentPath, newItem)

                if (isFolder) {
                  currentParent = newItem.children!
                }
              } else if (pathMap.get(currentPath)?.isFolder) {
                currentParent = pathMap.get(currentPath)!.children!
              }
            })
          })

          setFileStructure(structure)
        } catch (error) {
          console.error('Error processing ZIP file:', error)
          setFileErrors([intl.formatMessage({ id: 'createWebsite.invalidZipFile' })])
        }
      }

      fileReader.readAsArrayBuffer(selectedFile)
    } else {
      setFileStructure([])
    }
  }, [selectedFile, intl])

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkStatus = () => {
      if (metadata && deployedObjectId) {
        const filteredProjects = metadata
          .map((meta, index) => transformMetadataToProject(meta, index))
          .filter((project: Project) => project.parentId === deployedObjectId);

        if (filteredProjects.length > 0) {
          if (filteredProjects[0].status === 1) {
            setBuildingState(BuildingState.Built);
            return true;
          } else if (filteredProjects[0].status === 2) {
            setBuildingState(BuildingState.Failed);
            return true;
          }
        }
      }
      return false;
    };

    if (deployingState === DeployingState.Deployed &&
      buildingState !== BuildingState.Built &&
      buildingState !== BuildingState.Failed) {

      refetch().then(() => {
        checkStatus();
      });

      interval = setInterval(() => {
        refetch().then(() => {
          const shouldStop = checkStatus();
          if (shouldStop && interval) {
            clearInterval(interval);
          }
        });
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [deployingState, refetch, metadata, name, transformMetadataToProject, buildingState]);

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>Create new project | Ivory</title>
        <link rel="canonical" href="http://mysite.com/example" />
      </Helmet>
      <main>
        <motion.main className="relative z-10 mx-auto">
          {!showPreview && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center mb-8"
              >
                <CirclePlus className="h-6 w-6 lg:h-10 lg:w-10 text-sky-500 mr-4" />
                <h1 className="text-3xl font-semibold font-pixel">
                  <FormattedMessage id="createWebsite.title" />
                </h1>
              </motion.div>

              <article className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                {/* Left Column */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-8 rounded-2xl bg-[#10151c]/50 border border-cyan-900/40 shadow-2xl backdrop-blur-xl self-start w-full"
                >
                  <section className="mb-6 flex items-center">
                    <h2 className="text-lg font-semibold">
                      <FormattedMessage id="createWebsite.projectFiles" />
                    </h2>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle
                          className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help"
                          onClick={() => {
                            const helpCenter = document.getElementById('help-center')
                            if (helpCenter) {
                              helpCenter.scrollIntoView({ behavior: 'smooth' })
                            }
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent className='w-[360px]' side="right">
                        <FormattedMessage
                          id="createWebsite.projectFilesTooltip"
                          values={{
                            zip: <span className="text-secondary-500">ZIP file</span>
                          }}
                        />
                      </TooltipContent>
                    </Tooltip>
                  </section>

                  <Tabs
                    value={uploadMethod}
                    onValueChange={(value) =>
                      setUploadMethod(value as UploadMethod)
                    }
                    className="mb-6 w-full"
                  >
                    <TabsList className="w-full mb-2 bg-primary-700 h-10">
                      <TabsTrigger value={UploadMethod.Upload}>
                        <Upload className="h-4 w-4 mr-2" />
                        <FormattedMessage id="createWebsite.upload" />
                      </TabsTrigger>
                      <TabsTrigger value={UploadMethod.GitHub}>
                        <Github className="h-4 w-4 mr-2" />
                        <FormattedMessage id="createWebsite.github" />
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value={UploadMethod.Upload}>
                      <section
                        className={cn(
                          'relative flex flex-col items-center justify-center w-full min-h-[160px] backdrop-blur-xl transition-all duration-300 overflow-hidden',
                          isDragging && 'ring-4 ring-cyan-400/40',
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        tabIndex={0}
                      >
                        {!selectedFile && (
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none z-10"
                            style={{
                              borderRadius: '0.75rem',
                              width: 'calc(100% - 8px)',
                              height: 'calc(100% - 8px)',
                              left: 4,
                              top: 4,
                            }}
                          >
                            <rect
                              x="0"
                              y="0"
                              width="100%"
                              height="100%"
                              rx="12"
                              ry="12"
                              fill="none"
                              stroke="#8c8c8c"
                              strokeWidth="2.5"
                              strokeDasharray="16,10"
                              strokeDashoffset="0"
                              vectorEffect="non-scaling-stroke"
                            />
                          </svg>
                        )}
                        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept=".zip,application/zip,application/x-zip,application/x-zip-compressed"
                            title="ZIP files only (max 500MB)"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileInput}
                          />
                          {selectedFile ? (
                            <FileUploadPreview
                              file={selectedFile}
                              onRemove={handleRemoveFile}
                              setPlaceHolderName={setPlaceHolderName}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center py-10 w-full relative z-10">
                              <div className="w-full flex flex-col items-center">
                                <div
                                  className="flex flex-col items-center justify-center w-full"
                                  style={{ pointerEvents: 'auto' }}
                                  onDragOver={handleDragOver}
                                  onDragLeave={handleDragLeave}
                                  onDrop={handleDrop}
                                  tabIndex={0}
                                  role="button"
                                >
                                  <div className="relative group">
                                    <Upload className="w-16 h-16 mb-3 text-gray-900 drop-shadow-lg bg-secondary-500 p-3.5 rounded-full flex items-center justify-center" />
                                  </div>
                                  <p className="text-base font-semibold text-center text-gray-100">
                                    <FormattedMessage
                                      id="createWebsite.dragDrop"
                                      values={{
                                        zip: <span className="font-bold text-secondary-500">ZIP file</span>
                                      }}
                                    />
                                  </p>
                                  <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                    <Archive className="w-3 h-3" />
                                    <FormattedMessage id="createWebsite.zipOnly" defaultMessage="ZIP files only • Max size: 10MB" />
                                  </p>
                                </div>
                                <div className="flex items-center justify-center w-5/6 my-4">
                                  <Separator className="flex-1" />
                                  <span className="mx-4 text-sm text-gray-400 font-semibold select-none">
                                    <FormattedMessage id="createWebsite.or" />
                                  </span>
                                  <Separator className="flex-1" />
                                </div>
                                <Button
                                  className="bg-secondary-500 hover:bg-secondary-700 text-black font-semibold py-2 px-6 rounded-lg shadow-md"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBrowseClick()
                                  }}
                                >
                                  <FormattedMessage id="createWebsite.browseFile" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                      {fileErrors.length > 0 && (
                        <div className="mt-4">
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
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value={UploadMethod.GitHub}>
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
                        repoContents={repoContents}
                        repoContentsLoading={repoContentsLoading}
                        repoContentsError={repoContentsError}
                        handleLogout={handleLogout}
                        setSelectedRepoFile={setSelectedRepoFile}
                        fileErrors={fileErrors}
                        branches={branches}
                        selectedBranch={selectedBranch}
                        setSelectedBranch={setSelectedBranch}
                      />
                    </TabsContent>
                  </Tabs>
                </motion.div>

                {/* Right Column */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-8 self-start w-full"
                >
                  <section>
                    <Label
                      htmlFor="name"
                      className="text-lg font-semibold block mb-4 bg-gradient-to-r"
                    >
                      <FormattedMessage id="createWebsite.name" />
                    </Label>
                    <Input
                      id="name"
                      className={cn(
                        'bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500',
                        nameErrors.length > 0 && 'border-red-500',
                      )}
                      placeholder={placeHolderName}
                      onChange={handleNameChange}
                      value={name}
                    />
                    {nameErrors.length > 0 && (
                      <div className="mt-2">
                        {nameErrors.map((error, index) => (
                          <p key={index} className="text-red-400 text-sm">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </section>

                  <FrameworkPresetSelector
                    frameworks={frameworks}
                    selectedFramework={selectedFramework}
                    handleSelectFramework={handleSelectFramework}
                    setShowBuildOutputSettings={setShowBuildOutputSettings}
                    setBuildOutputSettings={setBuildOutputSettings}
                  />

                  <article className="flex flex-col gap-4">
                    <BuildOutputSetting
                      showBuildOutputSettings={showBuildOutputSettings}
                      setShowBuildOutputSettings={setShowBuildOutputSettings}
                      buildOutputSettings={buildOutputSettings}
                      setBuildOutputSettings={setBuildOutputSettings}
                    />

                    <AdvancedOptions
                      advancedOptions={advancedOptions}
                      setAdvancedOptions={setAdvancedOptions}
                      fileStructure={fileStructure}
                      githubContents={uploadMethod === UploadMethod.GitHub ? repoContents : []}
                    />
                  </article>

                  <Separator className="mb-4" />
                  <section className="pt-4 flex justify-end">
                    <Button
                      onClick={() => {
                        if (!validateName(name) || !validateFile()) return
                        setShowPreview(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-secondary-500 hover:bg-secondary-700 text-black p-6 rounded-md text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/20"
                    >
                      <FormattedMessage id="createWebsite.createWebsite" />
                    </Button>
                  </section>
                </motion.div>
              </article>
              <HelpCenter />
            </>
          )}
        </motion.main>
      </main>
      <AnimatePresence mode="wait">
        {showPreview && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PreviewSummary
                name={name}
                selectedFramework={selectedFramework}
                buildOutputSettings={buildOutputSettings}
                advancedOptions={advancedOptions}
                uploadMethod={uploadMethod}
                selectedFile={selectedFile}
                setOpen={setOpen}
                setShowPreview={setShowPreview}
                selectedRepoFile={selectedRepoFile}
                showBuildOutputSettings={showBuildOutputSettings}
                deployingState={deployingState}
                deployingResponse={deployingResponse}
                buildingState={buildingState}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CreateWebsiteDialog
        open={open}
        setOpen={setOpen}
        handleClickDeploy={handleClickDeploy}
      />
    </>
  )
}