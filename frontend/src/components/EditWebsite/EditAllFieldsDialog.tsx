import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Edit3 } from 'lucide-react';

export interface EditAllFieldsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fields: Record<string, string>;
    isSaving?: boolean;
    onSave: (fields: Record<string, string>) => void | Promise<void>;
}

export const EditAllFieldsDialog: React.FC<EditAllFieldsDialogProps> = ({
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
                    {Object.entries(editedFields).filter(([key]) => !['uuid', 'blobId', 'status', 'type', 'site-name', 'owner', 'ownership', 'send_to', 'epochs', 'start_date', 'showcase_url', 'client_error_description', 'end_date'].includes(key)).map(([key, value]) => (
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

export default EditAllFieldsDialog;
