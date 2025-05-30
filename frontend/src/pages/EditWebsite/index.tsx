import React, { useState } from 'react'
import { useSuiData } from '@/hooks/useSuiData'
import { useAuth } from '@/context/AuthContext'
import { Navigate, useParams } from 'react-router-dom'
import Loading from '@/components/Loading'
import { SuiParsedData } from '@mysten/sui/client'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Pencil } from 'lucide-react'

type WithFields = { fields: Record<string, unknown> };

const hasFields = (data: unknown): data is WithFields => {
    return !!data && typeof data === 'object' && 'fields' in data;
}

type ProjectContents = Record<string, string>

interface EditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fieldName: string;
    fieldValue: string;
    onSave: (value: string) => void;
}

const EditDialog: React.FC<EditDialogProps> = ({
    open,
    onOpenChange,
    fieldName,
    fieldValue,
    onSave,
}) => {
    const [value, setValue] = useState(fieldValue);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        try {
            onSave(value);
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-primary-900 border-secondary-500/20">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit {fieldName.replace(/_/g, ' ')}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="field-value" className="text-right text-white">
                            Value
                        </Label>
                        <Input
                            id="field-value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="col-span-3 bg-primary-800 border-secondary-500/30 text-white"
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-secondary-500/30 text-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isSaving ? 'Saving...' : 'Save changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

function EditWebsitePage() {
    const { address } = useAuth()
    const { metadata, isLoading } = useSuiData(address || '')
    const params = useParams()
    const project = metadata?.find((meta) => meta.parentId === params.id)
    const [editingField, setEditingField] = useState<{ key: string; value: string } | null>(null)
    const [projectContents, setProjectContents] = useState<ProjectContents | null>(null)

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
    }, [project])

    console.log('Mapped project contents:', projectContents)

    if (isLoading) {
        return <Loading />
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="bg-primary-900/50 border border-secondary-500/20 rounded-xl p-8 max-w-md w-full">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
                        <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Project Not Found</h2>
                    <p className="text-secondary-300 mb-6">The project you're looking for doesn't exist or you don't have permission to view it.</p>
                    <Button
                        variant="outline"
                        className="w-full bg-primary-800 hover:bg-primary-700 border-secondary-500/30 text-white hover:text-white"
                        onClick={() => window.history.back()}
                    >
                        Go Back
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-bold text-white mb-3">
                    {projectContents?.["site-name"]}
                </h1>
            </motion.div>

            {projectContents ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {Object.entries(projectContents).map(([key, value]) => (
                        <motion.div
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            className="group rounded-2xl bg-primary-800 p-6 border border-secondary-500/10 shadow-md transition"
                        >
                            <div className="mb-2 text-xs uppercase text-secondary-400 tracking-wider font-medium">
                                {key.replace(/_/g, ' ')}
                            </div>
                            <div className="flex items-start justify-between gap-2">
                                <p className="text-white text-base font-medium truncate w-full" title={value}>
                                    {value || <em className="text-secondary-500 italic">Not specified</em>}
                                </p>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-secondary-400 hover:text-white rounded-full"
                                    onClick={() => setEditingField({ key, value })}
                                >
                                    <Pencil className="w-4 h-4" />
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-12 border-2 border-dashed border-secondary-500/30 rounded-2xl bg-primary-900/40">
                    <svg className="mx-auto h-12 w-12 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-4 text-xl font-semibold text-white">No project contents available</h3>
                    <p className="text-secondary-400">Add some content to get started</p>
                </div>
            )}

            {editingField && (
                <EditDialog
                    open={!!editingField}
                    onOpenChange={(open) => !open && setEditingField(null)}
                    fieldName={editingField.key}
                    fieldValue={editingField.value}
                    onSave={(newValue) => {
                        if (projectContents) {
                            const updatedContents = { ...projectContents, [editingField.key]: newValue };
                            console.log(`Updating ${editingField.key} to:`, newValue);
                            setProjectContents(updatedContents); // Update local state
                            setEditingField(null);
                        }
                    }}
                />
            )}
        </div>
    );

}

export default EditWebsitePage
