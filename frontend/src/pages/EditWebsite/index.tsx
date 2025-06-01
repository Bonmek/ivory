import React, { useState, useEffect, useRef } from 'react'
import { useSuiData } from '@/hooks/useSuiData'
import { useAuth } from '@/context/AuthContext'
import { useParams } from 'react-router-dom'
import Loading from '@/components/Loading'
import { SuiParsedData } from '@mysten/sui/client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ExternalLink, Globe, Copy, Check, Eye, EyeOff, Layout, XCircle, CheckCircle, X, Edit3, Upload, Archive, CircleAlert, HelpCircle, Github, CirclePlus } from 'lucide-react'
import ProjectCard from '@/components/EditWebsite/ProjectCard'
import { handleUpdateSite } from '@/api/editWebsiteApi'
import { EditAllFieldsDialog } from '@/components/EditWebsite/EditAllFieldsDialog'
import FileUploadPreview, { FileItem } from '@/components/CreateWebsite/FileUploadPreview'
import { FormattedMessage, useIntl } from 'react-intl'
import { Separator } from '@radix-ui/react-dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GithubRepoInput from '@/components/CreateWebsite/GitHubRepoInput'
import { Label } from '@/components/ui/label'
import FrameworkPresetSelector from '@/components/CreateWebsite/FrameworkPresetSelector'
import BuildOutputSetting from '@/components/CreateWebsite/BuildOutputSetting'
import AdvancedOptions from '@/components/CreateWebsite/AdvancedOptions'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { BuildingState, CacheControl, DeployingState, UploadMethod } from '@/types/CreateWebstie/enums'
import apiClient from '@/lib/axiosConfig'
import { transformMetadataToProject } from '@/utils/metadataUtils'
import { Project } from '@/types/project'
import { advancedOptionsType, ApiResponse, buildOutputSettingsType, GitHubApiError, GitHubApiResponse, Repository } from '@/types/CreateWebstie/types'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import JSZip from 'jszip'
import { frameworks } from '@/constants/frameworks'

type WithFields = { fields: Record<string, unknown> };

const hasFields = (data: unknown): data is WithFields => {
    return !!data && typeof data === 'object' && 'fields' in data;
}

type ProjectContents = Record<string, string>

function EditWebsitePage() {
    const { address } = useAuth()
    const { metadata, isLoading, refetch } = useSuiData(address || '')

    const intl = useIntl()

    // State to control preview visibility
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (showPreview) {
                e.preventDefault()
                e.returnValue = ''
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [showPreview])

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
            rootDirectory: '/',
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
    const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false)
    const [deployingState, setDeployingState] = useState<DeployingState>(
        DeployingState.None,
    )
    const [deployingResponse, setDeployingResponse] =
        useState<ApiResponse | null>(null)
    const [buildingState, setBuildingState] = useState<BuildingState>(
        BuildingState.None,
    )
    const [deployedObjectId, setDeployedObjectId] = useState<string | null>(null)
    const [projectShowcaseUrl, setProjectShowcaseUrl] = useState<string | null>(
        null,
    )
    const [projectPreview, setProjectPreview] = useState<File>()

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
        const filteredProjects = metadata
            .map((meta, index) => transformMetadataToProject(meta, index) as Project)
            .filter(
                (project: Project) =>
                    project.name.toLowerCase() === value.trim().toLowerCase(),
            )

        const errors: string[] = []
        // Check for required name
        if (!value.trim()) {
            errors.push(intl.formatMessage({ id: 'createWebsite.error.required' }))
            setNameErrors(errors)
            return false
        }

        // Check for duplicate project name
        if (filteredProjects.length > 0) {
            errors.push(
                intl.formatMessage({ id: 'createWebsite.error.duplicateName' }),
            )
            setNameErrors(errors)
            return false
        }

        // Check for maximum length
        if (value.trim().length > 40) {
            errors.push(
                intl.formatMessage(
                    { id: 'createWebsite.error.maxLength' },
                    { max: 40 },
                ),
            )
        }

        // Allow English letters (both cases), numbers, hyphens, and underscores (no spaces)
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
            errors.push(intl.formatMessage({ id: 'createWebsite.error.englishOnly' }))
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
    const [selectedFramework, setSelectedFramework] = useState<string | null>(
        null,
    )
    const [repoContents, setRepoContents] = useState<any[] | null>(null)
    const [repoContentsLoading, setRepoContentsLoading] = useState(false)
    const [repoContentsError, setRepoContentsError] = useState<string | null>(
        null,
    )
    const [branches, setBranches] = useState<
        { name: string; commit: string; protected: boolean }[]
    >([])
    const [selectedBranch, setSelectedBranch] = useState<string | undefined>(
        'main',
    )

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
                setFileErrors([
                    intl.formatMessage({ id: 'createWebsite.error.invalidFileType' }),
                ])
                return
            }

            if (file.size > MAX_FILE_SIZE) {
                setFileErrors([
                    intl.formatMessage(
                        { id: 'createWebsite.error.fileTooLarge' },
                        { maxSize: '300MB' },
                    ),
                ])
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
                setFileErrors([
                    intl.formatMessage({ id: 'createWebsite.error.invalidFileType' }),
                ])
                return
            }

            if (file.size > MAX_FILE_SIZE) {
                setFileErrors([
                    intl.formatMessage(
                        { id: 'createWebsite.error.fileTooLarge' },
                        { maxSize: '300MB' },
                    ),
                ])
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
    const downloadRepositoryZip = async (
        owner: string,
        repo: string,
        branch?: string,
    ) => {
        try {
            const branch = selectedBranch || 'main'
            const response = await apiClient.get(
                `/api/repositories/${owner}/${repo}/download`,
                {
                    responseType: 'blob',
                    params: { branch },
                },
            )

            const zipBlob = new Blob([response.data], { type: 'application/zip' })
            const fileName = `${repo}.zip`

            // Create a File object for internal app use
            const file = new File([zipBlob], fileName, { type: 'application/zip' })
            setSelectedRepoFile(file)
            setFileErrors([])
            setUploadMethod(UploadMethod.GitHub)

        } catch (error) {
            console.error('Error downloading repository:', error)
        }
    }

    useEffect(() => {
        if (!process.env.REACT_APP_SERVER_URL) {
            console.error('REACT_APP_SERVER_URL environment variable is not set')
            setUser(null)
            setDeployingState(DeployingState.None)
            return
        }

        const userEndpoint = `${process.env.REACT_APP_SERVER_URL}/api/user`

        apiClient
            .get(userEndpoint)
            .then((res) => {
                setUser(res.data.user)
                setDeployingState(DeployingState.None)
            })
            .catch((error) => {
                console.error('Error fetching user data:', error)
                setUser(null)
                setDeployingState(DeployingState.None)
            })
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
            const response = await apiClient.get(
                `/api/repositories/${repo.owner}/${repo.name}/branches`,
            )
            const branches = response.data as {
                name: string
                commit: string
                protected: boolean
            }[]
            setBranches(branches)
        } catch (error) {
            console.error('Error fetching branches:', error)
        }
    }

    const handleSelectFramework = (frameworkId: string) => {
        setSelectedFramework(frameworkId)
    }
    const params = useParams()
    const project = metadata?.find((meta) => meta.parentId === params.id)
    const [projectContents, setProjectContents] = useState<ProjectContents | null>(null)
    const [copiedUrl, setCopiedUrl] = useState(false)
    const [isContentLoading, setIsContentLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateError, setUpdateError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [isEditAllDialogOpen, setIsEditAllDialogOpen] = useState(false)
    const [isUpdateState, setIsUpdateState] = useState(false)

    // Auto-hide toast after 5 seconds
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    React.useEffect(() => {
        if (!project?.content) {
            setProjectContents(null)
            return
        }

        const content = project.content as SuiParsedData
        if (content.dataType !== 'moveObject') {
            setProjectContents(null)
            return
        }

        const value = hasFields(content) ? content.fields.value : null
        const valueFields = value && hasFields(value) ? value.fields : null
        const metadataFields = valueFields && hasFields(valueFields.metadata) ? valueFields.metadata.fields : null

        const entries = metadataFields?.contents
        if (!Array.isArray(entries)) {
            setProjectContents(null)
            return
        }

        const mapped: ProjectContents = {}
        for (const entry of entries) {
            if (hasFields(entry)) {
                const key = entry.fields?.key
                const value = entry.fields?.value
                if (typeof key === 'string' && typeof value === 'string') {
                    mapped[key] = value
                }
            }
        }
        setProjectContents(mapped)
        setIsContentLoading(false)
    }, [project])

    const handleLogout = async () => {
        try {
            const response = await apiClient.get('/auth/github/logout')
            if (response.status !== 200) {
                throw new Error('Logout failed')
            }

            setUser(null)
            setSelectedRepo(null)
            setGithubUrl('')
            setSearchRepository('')
            setRepoContents(null)
            setRepoContentsError(null)
            setRepoContentsLoading(false)
            window.location.href = '/create-website'
        } catch (error) {
            console.error('Logout error:', error)

            setUser(null)
            setSelectedRepo(null)
            setGithubUrl('')
            setSearchRepository('')
            setRepoContents(null)
            setRepoContentsError(null)
            setRepoContentsLoading(false)
            window.location.href = '/create-website'
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
                        branch: selectedBranch || 'main',
                    },
                },
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

                    files.forEach((filePath) => {
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
                                    children: [],
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
                    setFileErrors([
                        intl.formatMessage({ id: 'createWebsite.invalidZipFile' }),
                    ])
                }
            }

            fileReader.readAsArrayBuffer(selectedFile)
        } else {
            setFileStructure([])
        }
    }, [selectedFile, intl])

    useEffect(() => {
        let interval: NodeJS.Timeout

        const checkStatus = () => {
            if (metadata && deployedObjectId) {
                const filteredProjects = metadata
                    .map(
                        (meta, index) => transformMetadataToProject(meta, index) as Project,
                    )
                    .filter((project: Project) => project.parentId === deployedObjectId)

                if (filteredProjects.length > 0) {
                    const firstProject = filteredProjects[0]
                    if (firstProject.status === 1) {
                        const project = firstProject as Project
                        if (project.showcase_url) {
                            setBuildingState(BuildingState.Built)
                            setProjectShowcaseUrl(project.showcase_url)
                            return true
                        }
                    } else if (firstProject.status === 2) {
                        setBuildingState(BuildingState.Failed)
                        return true
                    }
                }
                return false
            }
            return false
        }

        if (
            deployingState === DeployingState.Deployed &&
            buildingState !== BuildingState.Built &&
            buildingState !== BuildingState.Failed
        ) {
            refetch().then(() => {
                checkStatus()
            })

            interval = setInterval(() => {
                refetch().then(() => {
                    const shouldStop = checkStatus()
                    if (shouldStop && interval) {
                        clearInterval(interval)
                    }
                })
            }, 30000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [
        deployingState,
        refetch,
        metadata,
        name,
        transformMetadataToProject,
        buildingState,
    ])

    // ---------------------------------------------------------------------------

    const showcaseUrl = projectContents?.["showcase_url"]
    const fullShowcaseUrl = showcaseUrl ? `https://kursui.wal.app/${showcaseUrl}/index.html` : null

    console.log(projectContents)



    const handleSaveAllFields = async (updatedFields: Record<string, string>) => {
        if (!project?.parentId) return;

        setIsUpdating(true);
        setUpdateError(null);

        try {
            const result = await handleUpdateSite({
                attributes: updatedFields
            });

            if (result.success) {
                // Update local state immediately for better UX
                setProjectContents(prev => ({
                    ...prev,
                    ...updatedFields
                } as ProjectContents));

                // Show success toast
                setToast({
                    type: 'success',
                    message: 'All fields updated successfully'
                });
            } else {
                const errorMsg = result.message || 'Failed to update fields';
                setUpdateError(errorMsg);
                setToast({
                    type: 'error',
                    message: `Failed to update fields: ${errorMsg}`
                });
            }
        } catch (error) {
            console.error('Error updating fields:', error);
            const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred';
            setUpdateError(errorMsg);
            setToast({
                type: 'error',
                message: `Failed to update fields: ${errorMsg}`
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCopyUrl = async () => {
        if (fullShowcaseUrl) {
            try {
                await navigator.clipboard.writeText(fullShowcaseUrl)
                setCopiedUrl(true)
                setTimeout(() => setCopiedUrl(false), 2000)
            } catch (err) {
                console.error('Failed to copy URL:', err)
            }
        }
    }

    if (isLoading || isContentLoading) {
        return (
            <div className="bg-primary-950 flex items-center justify-center">
                <div className="text-center">
                    <Loading />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8"
                    >
                        <h2 className="text-xl font-pixel text-white">Loading Website Data</h2>
                        <p className="text-secondary-400 mt-2">Please wait while we load your content...</p>
                    </motion.div>
                </div>
            </div>
        )
    }

    if (!projectContents) {
        return (
            <div className="min-h-screen bg-primary-950 flex items-center justify-center p-4">
                <motion.div
                    className="text-center max-w-md"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="w-20 h-20 bg-secondary-900/50 rounded-full flex items-center justify-center mx-auto mb-6 p-4">
                        <Layout className="w-10 h-10 text-secondary-400" />
                    </div>
                    <h2 className="text-2xl font-pixel text-white mb-2">No Website Data Found</h2>
                    <p className="text-secondary-400">We couldn't find any content for this website.</p>
                    <Button
                        variant="outline"
                        className="mt-6 bg-secondary-800/50 border-secondary-700 text-white hover:bg-secondary-700/70"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </Button>
                </motion.div>
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary-900/80 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
                >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
                        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Project Not Found</h2>
                    <p className="text-secondary-400 mb-8 leading-relaxed">The project you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Button
                        variant="outline"
                        className="w-full bg-primary-800 hover:bg-primary-700 border-secondary-500/30 text-white hover:text-white"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-primary-950">
            <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                >
                    <div className="text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className=" flex-col sm:flex-row items-center gap-3">
                                <div className='flex flex-row gap-3 mb-1'>
                                    <Layout className="w-8 h-8 text-secondary-400" />
                                    <h1 className="text-2xl font-pixel sm:text-3xl md:text-4xl font-bold text-white">
                                        {projectContents?.["site-name"] || "Website Editor"}
                                    </h1>
                                </div>
                                <p className="text-secondary-400 text-sm sm:text-base">
                                    Manage your website's content and configuration
                                </p>
                            </div>
                            <div className="flex lg:flex-row flex-col gap-2 ">
                                {!isUpdateState ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="flex lg:flex-row flex-col gap-3"
                                    >
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative group"
                                        >
                                            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500 group-hover:duration-300" />
                                            <Button
                                                onClick={() => setIsEditAllDialogOpen(true)}
                                                variant="outline"
                                                className="relative bg-emerald-900/50 hover:bg-emerald-800/60 border-emerald-500/60 text-emerald-100 hover:text-white flex items-center gap-2 transition-all duration-300 group-hover:border-emerald-400/70 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-400/40 cursor-pointer"
                                            >
                                                <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-emerald-200 via-teal-200 to-cyan-200 group-hover:via-emerald-200 group-hover:to-teal-200 transition-all duration-300">Edit Fields</span>
                                            </Button>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ y: -2 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="relative group"
                                        >
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500 group-hover:duration-300" />
                                            <Button
                                                onClick={() => setIsUpdateState(true)}
                                                variant="outline"
                                                className="relative bg-blue-900/50 hover:bg-blue-800/60 border-blue-500/60 text-blue-100 hover:text-white flex items-center gap-2 transition-all duration-300 group-hover:border-blue-400/70 shadow-lg shadow-blue-500/20 hover:shadow-blue-400/40 cursor-pointer"
                                            >
                                                <Upload className="w-4 h-4 group-hover:translate-y-[-2px] transition-transform" />
                                                <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">Update Site</span>
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        className="relative group"
                                    >
                                        <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-pink-400 to-rose-400 rounded-lg blur opacity-0 group-hover:opacity-30 transition-all duration-500 group-hover:duration-300" />
                                        <Button
                                            onClick={() => setIsUpdateState(false)}
                                            variant="outline"
                                            className="relative bg-red-900/50 hover:bg-red-800/60 border-red-500/60 text-red-100 hover:text-white flex items-center gap-2 transition-all duration-300 group-hover:border-red-400/70 shadow-lg shadow-red-500/20 hover:shadow-red-400/40 cursor-pointer"
                                        >
                                            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                                            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-red-200 via-pink-200 to-rose-200 group-hover:from-red-100 group-hover:to-pink-100 transition-all duration-300">Discard Changes</span>
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                    </div>
                </motion.div>

                {/* Website Preview Section */}
                {
                    fullShowcaseUrl && !isUpdateState && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="mb-12"
                        >
                            <div className="bg-primary-900/50 border border-secondary-500/20 rounded-2xl overflow-hidden shadow-2xl">
                                {/* Preview Header */}
                                <div className="bg-primary-800/80 border-b border-secondary-500/20 p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-secondary-500/20 rounded-lg">
                                                <Globe className="w-5 h-5 text-secondary-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-semibold">Live Website Preview</h3>
                                                <p className="text-secondary-400 text-sm">{fullShowcaseUrl}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowPreview(!showPreview)}
                                                className="border-secondary-500/30 text-secondary-300 hover:bg-primary-700"
                                            >
                                                {showPreview ? (
                                                    <>
                                                        <EyeOff className="w-4 h-4 mr-2" />
                                                        Hide
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Show
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopyUrl}
                                                className="border-secondary-500/30 text-secondary-300 hover:bg-primary-700"
                                            >
                                                {copiedUrl ? (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4 mr-2" />
                                                        Copy URL
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(fullShowcaseUrl, '_blank')}
                                                className="border-secondary-500/30 text-secondary-300 hover:bg-primary-700"
                                            >
                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                Open
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview iFrame */}
                                {showPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="relative"
                                    >
                                        <div className="aspect-video bg-primary-800 relative overflow-hidden w-full">
                                            <iframe
                                                src={fullShowcaseUrl}
                                                className="w-full h-full border-0"
                                                title="Website Preview"
                                                loading="lazy"
                                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                            />
                                            <div className="absolute inset-0 pointer-events-none border border-secondary-500/10 rounded-b-2xl" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )
                }

                {/* Content Grid */}
                {projectContents && !isUpdateState ? (
                    <div className="space-y-10">
                        {/* Basic Information Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className="space-y-5"
                        >
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-secondary-500 rounded-full"></span>
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
                                {Object.entries(projectContents)
                                    .filter(([key]) => ['site-name', 'type', 'blobId', 'status'].includes(key))
                                    .map(([key, value], index) => (
                                        <ProjectCard
                                            key={key}
                                            fieldKey={key}
                                            value={value}
                                            index={index}
                                        />
                                    ))}
                            </div>
                        </motion.section>

                        {/* Config Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="space-y-5"
                        >
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Config
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-7">
                                {Object.entries(projectContents)
                                    .filter(([key]) => ['cache', 'root'].includes(key))
                                    .map(([key, value], index) => (
                                        <ProjectCard
                                            key={key}
                                            fieldKey={key}
                                            value={value}
                                            index={index}
                                        />
                                    ))}
                            </div>
                        </motion.section>

                        {/* Owner Detail Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            className="space-y-5"
                        >
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                Owner Detail
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
                                {Object.entries(projectContents)
                                    .filter(([key]) => ['ownership', 'owner', 'send_to'].includes(key))
                                    .map(([key, value], index) => (
                                        <ProjectCard
                                            key={key}
                                            fieldKey={key}
                                            value={value}
                                            index={index}
                                        />
                                    ))}
                            </div>
                        </motion.section>

                        {/* Epochs Detail Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            className="space-y-5"
                        >
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Epochs Detail
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-7">
                                {Object.entries(projectContents)
                                    .filter(([key]) => ['epochs', 'start_date', 'end_date'].includes(key))
                                    .map(([key, value], index) => (
                                        <ProjectCard
                                            key={key}
                                            fieldKey={key}
                                            value={value}
                                            index={index}
                                        />
                                    ))}
                            </div>
                        </motion.section>

                        {/* Other Fields Section */}
                        {Object.entries(projectContents).some(([key]) =>
                            !['showcase_url', 'client_error_description', 'uuid',
                                'site-name', 'type', 'blobId', 'status',
                                'cache', 'root', 'ownership', 'owner', 'send_to',
                                'epochs', 'start_date', 'end_date'].includes(key)
                        ) && (
                                <motion.section
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4 }}
                                    className="space-y-5"
                                >
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <span className="w-1 h-6 bg-gray-500 rounded-full"></span>
                                        Additional Information
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
                                        {Object.entries(projectContents)
                                            .filter(([key]) => ![
                                                'showcase_url', 'client_error_description', 'uuid',
                                                'site-name', 'type', 'blobId', 'status',
                                                'cache', 'root', 'ownership', 'owner', 'send_to',
                                                'epochs', 'start_date', 'end_date'
                                            ].includes(key))
                                            .map(([key, value], index) => (
                                                <ProjectCard
                                                    key={key}
                                                    fieldKey={key}
                                                    value={value}
                                                    index={index}
                                                />
                                            ))}
                                    </div>
                                </motion.section>
                            )}
                    </div>
                ) : !isUpdateState && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        className="text-center py-16 border-2 border-dashed border-secondary-500/30 rounded-2xl bg-primary-800/30"
                    >
                        <div className="mx-auto w-16 h-16 bg-primary-700/50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-semibold text-white mb-2">No Content Available</h3>
                        <p className="text-secondary-400 text-lg">Add some content to get started with your website</p>
                    </motion.div>
                )}

                {/* Update Website Form */}
                {isUpdateState && (
                    <>
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
                                                    const helpCenter =
                                                        document.getElementById('help-center')
                                                    if (helpCenter) {
                                                        helpCenter.scrollIntoView({ behavior: 'smooth' })
                                                    }
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent className="w-[360px]" side="right">
                                            <FormattedMessage
                                                id="createWebsite.projectFilesTooltip"
                                                values={{
                                                    zip: (
                                                        <span className="text-secondary-500">
                                                            ZIP file
                                                        </span>
                                                    ),
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
                                                                            zip: (
                                                                                <span className="font-bold text-secondary-500">
                                                                                    ZIP file
                                                                                </span>
                                                                            ),
                                                                        }}
                                                                    />
                                                                </p>
                                                                <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                                                                    <Archive className="w-3 h-3" />
                                                                    <FormattedMessage
                                                                        id="createWebsite.zipOnly"
                                                                        defaultMessage="ZIP files only • Max size: 10MB"
                                                                    />
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
                                                        <div
                                                            key={index}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <CircleAlert className="w-4 h-4 text-red-400" />
                                                            <p className="text-red-400 text-sm">{error}</p>
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
                                <FrameworkPresetSelector
                                    frameworks={frameworks}
                                    selectedFramework={selectedFramework}
                                    handleSelectFramework={handleSelectFramework}
                                    setShowBuildOutputSettings={setShowBuildOutputSettings}
                                    setBuildOutputSettings={setBuildOutputSettings}
                                />

                                <article className="flex flex-col gap-4">
                                    {
                                        <BuildOutputSetting
                                            showBuildOutputSettings={showBuildOutputSettings}
                                            setShowBuildOutputSettings={setShowBuildOutputSettings}
                                            buildOutputSettings={buildOutputSettings}
                                            setBuildOutputSettings={setBuildOutputSettings}
                                            fileStructure={fileStructure}
                                            githubContents={
                                                uploadMethod === UploadMethod.GitHub
                                                    ? repoContents
                                                    : []
                                            }
                                        />
                                    }

                                    <AdvancedOptions
                                        advancedOptions={advancedOptions}
                                        setAdvancedOptions={setAdvancedOptions}
                                        fileStructure={fileStructure}
                                        githubContents={
                                            uploadMethod === UploadMethod.GitHub ? repoContents : []
                                        }
                                        showBuildOutputSettings={showBuildOutputSettings}
                                    />
                                </article>

                                <Separator className="mb-4" />
                                <section className="pt-2 flex justify-end">
                                    <Button
                                        // onClick={handlePreview}
                                        className="bg-secondary-500 hover:bg-secondary-700 text-black p-6 rounded-md text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/20"
                                    >
                                        <FormattedMessage id="createWebsite.createWebsite" />
                                    </Button>
                                </section>
                            </motion.div>
                        </article>
                    </>
                )}

                <EditAllFieldsDialog
                    open={isEditAllDialogOpen}
                    onOpenChange={setIsEditAllDialogOpen}
                    fields={projectContents || {}}
                    isSaving={isUpdating}
                    onSave={handleSaveAllFields}
                />
            </div >

            {/* Toast Notification */}
            {
                toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-6 right-6 z-50 flex items-center p-4 rounded-lg shadow-lg ${toast.type === 'success'
                            ? 'bg-green-600/90 border border-green-500/30'
                            : 'bg-red-600/90 border border-red-500/30'
                            }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        ) : (
                            <XCircle className="w-5 h-5 text-white mr-3 flex-shrink-0" />
                        )}
                        <p className="text-white text-sm">{toast.message}</p>
                        <button
                            onClick={() => setToast(null)}
                            className="ml-4 text-white/70 hover:text-white focus:outline-none"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )
            }
        </div >
    )
}

export default EditWebsitePage