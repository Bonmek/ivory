import React, { useState, useEffect } from 'react'
import { useSuiData } from '@/hooks/useSuiData'
import { useAuth } from '@/context/AuthContext'
import { useParams } from 'react-router-dom'
import Loading from '@/components/Loading'
import { SuiParsedData } from '@mysten/sui/client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pencil, ExternalLink, Globe, Copy, Check, Eye, EyeOff, Layout, XCircle, CheckCircle, X, Edit3 } from 'lucide-react'
import ProjectCard from '@/components/EditWebsite/ProjectCard'
import { handleUpdateSite, UpdateSiteAttributes } from '@/api/editWebsiteApi'

type WithFields = { fields: Record<string, unknown> };

const hasFields = (data: unknown): data is WithFields => {
    return !!data && typeof data === 'object' && 'fields' in data;
}

type ProjectContents = Record<string, string>



interface EditAllFieldsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fields: Record<string, string>;
    isSaving?: boolean;
    onSave: (fields: Record<string, string>) => void | Promise<void>;
}

const EditAllFieldsDialog: React.FC<EditAllFieldsDialogProps> = ({
    open,
    onOpenChange,
    fields,
    isSaving = false,
    onSave,
}) => {
    const [editedFields, setEditedFields] = useState<Record<string, string>>({});
    const [isInternalSaving, setIsInternalSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setEditedFields({ ...fields });
        }
    }, [open, fields]);

    const handleFieldChange = (key: string, value: string) => {
        setEditedFields(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = async () => {
        setIsInternalSaving(true);
        try {
            await onSave(editedFields);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsInternalSaving(false);
        }
    };

    const isLoading = isSaving || isInternalSaving;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-primary-900 border border-secondary-500/30 shadow-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white text-xl font-pixel font-semibold flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-secondary-400" />
                        Edit All Fields
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2 pr-1">
                    {Object.entries(editedFields).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                            <label
                                htmlFor={`field-${key}`}
                                className="block text-sm font-medium text-secondary-300"
                            >
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </label>
                            <Input
                                id={`field-${key}`}
                                value={value}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                className="bg-primary-800 border-secondary-500/30 text-white placeholder-secondary-500 focus:border-secondary-400 focus:ring-secondary-400/20 w-full"
                            />
                        </div>
                    ))}
                </div>
                <DialogFooter className="gap-2 bg-primary-900">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-secondary-500/30 text-secondary-300 hover:bg-primary-800 hover:text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={isLoading}
                        className="bg-secondary-700 hover:bg-secondary-800 text-white shadow-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : 'Save All Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function EditWebsitePage() {
    const { address } = useAuth()
    const { metadata, isLoading, refetch } = useSuiData(address || '')
    const params = useParams()
    const project = metadata?.find((meta) => meta.parentId === params.id)
    const [projectContents, setProjectContents] = useState<ProjectContents | null>(null)
    const [copiedUrl, setCopiedUrl] = useState(false)
    const [showPreview, setShowPreview] = useState(true)
    const [isContentLoading, setIsContentLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [updateError, setUpdateError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [isEditAllDialogOpen, setIsEditAllDialogOpen] = useState(false)

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
                            <Button
                                onClick={() => setIsEditAllDialogOpen(true)}
                                variant="outline"
                                className="bg-secondary-700/50 hover:bg-secondary-600/70 border-secondary-500/30 text-white hover:text-white flex items-center gap-2"
                            >
                                <Edit3 className="w-4 h-4" />
                                Edit All Fields
                            </Button>
                        </div>

                    </div>
                </motion.div>

                {/* Website Preview Section */}
                {
                    fullShowcaseUrl && (
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
                {
                    projectContents ? (
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
                    ) : (
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
                    )
                }



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