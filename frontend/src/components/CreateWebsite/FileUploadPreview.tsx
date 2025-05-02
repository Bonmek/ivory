import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import React from "react";

interface FileUploadPreviewProps {
  fileName: string;
  onRemove: () => void;
}

const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ fileName, onRemove }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-green-500">{fileName}</span>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-6 w-6 rounded-full hover:bg-red-500/20"
      >
        <X className="h-4 w-4 text-red-500" />
      </Button>
    </div>
    <p className="text-sm text-gray-400">File ready for upload</p>
  </div>
);

export default FileUploadPreview; 