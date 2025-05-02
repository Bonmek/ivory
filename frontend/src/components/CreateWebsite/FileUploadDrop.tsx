import { Button } from "@/components/ui/button";
import React from "react";

interface FileUploadDropProps {
  error?: string | null;
  handleBrowseClick: () => void;
}

const FileUploadDrop: React.FC<FileUploadDropProps> = ({ error, handleBrowseClick }) => (
  <>
    <Button
      onClick={handleBrowseClick}
      className="bg-[#e94057] hover:bg-[#d13046] transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#e94057]/20"
    >
      Browse
    </Button>
    <p className="mt-4 text-sm text-gray-400 group-hover:text-gray-300">
      Drag and drop ZIP file here or click to browse
    </p>
    {error && (
      <p className="mt-2 text-sm text-red-500">{error}</p>
    )}
  </>
);

export default FileUploadDrop; 