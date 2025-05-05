import { Button } from "@/components/ui/button";
import { X, Folder, File as FileIcon, ChevronDown, ChevronRight } from "lucide-react";
import React, { useEffect, useState } from "react";
import JSZip from "jszip";

interface FileUploadPreviewProps {
  file: File;
  onRemove: () => void;
}

interface FileItem {
  name: string;
  isFolder: boolean;
  path: string;
  children?: FileItem[];
}

const FileList: React.FC<{ files: string[] }> = ({ files }) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [fileStructure, setFileStructure] = useState<FileItem[]>([]);

  useEffect(() => {
    const structure: FileItem[] = [];
    const folderMap = new Map<string, FileItem>();

    files.forEach(file => {
      const parts = file.split('/').filter(Boolean);
      if (parts.length === 0) return;
      let currentPath = '';
      let currentParent = structure;

      parts.forEach((part, index) => {
        if (!part) return;
        currentPath += (currentPath ? '/' : '') + part;
        const isLastPart = index === parts.length - 1;
        const isFolder = !isLastPart || file.endsWith('/');

        if (isFolder) {
          let folder = folderMap.get(currentPath);
          if (!folder) {
            folder = {
              name: part,
              isFolder: true,
              path: currentPath,
              children: []
            };
            folderMap.set(currentPath, folder);
            currentParent.push(folder);
          }
          currentParent = folder.children!;
        } else {
          if (part) {
            currentParent.push({
              name: part,
              isFolder: false,
              path: currentPath
            });
          }
        }
      });
    });

    setFileStructure(structure);
  }, [files]);

  const toggleFolder = (path: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const renderFileItem = (item: FileItem) => {
    if (item.isFolder) {
      return (
        <div key={item.path} className="space-y-1">
          <div
            className="flex items-center text-cyan-100 hover:bg-cyan-900/30 rounded px-2 py-1 cursor-pointer"
            onClick={e => toggleFolder(item.path, e)}
          >
            {expandedFolders.has(item.path) ? (
              <ChevronDown className="w-4 h-4 mr-2 text-secondary-500" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-secondary-500" />
            )}
            <Folder className="w-4 h-4 mr-2 text-secondary-500" />
            <span>{item.name}</span>
          </div>
          {expandedFolders.has(item.path) && item.children && (
            <div className="ml-4">
              {item.children.map(child => renderFileItem(child))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={item.path} className="flex items-center text-cyan-100 hover:bg-cyan-900/30 rounded px-2 py-1 ml-4">
        <FileIcon className="w-4 h-4 mr-2 text-cyan-200" />
        <span>{item.name}</span>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {fileStructure.map(item => renderFileItem(item))}
    </div>
  );
};

const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ file, onRemove }) => {
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setFiles([]);

    if (!file.name.endsWith('.zip')) {
      setError('Please upload a ZIP file');
      setLoading(false);
      return;
    }

    JSZip.loadAsync(file)
      .then((zip) => {
        if (cancelled) return;
        try {
          const fileList = Object.keys(zip.files);
          console.log('ZIP files:', fileList);
          if (fileList.length === 0) {
            setError('ZIP file is empty');
            return;
          }
          setFiles(fileList);
        } catch (e) {
          console.error('Error processing ZIP:', e);
          setError('Error processing ZIP file');
        }
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        console.error('Error loading ZIP:', e);
        setError(`Failed to read ZIP file: ${e.message}`);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-full bg-gradient-to-br from-cyan-900/40 to-cyan-900/30 backdrop-blur-md rounded-xl shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-secondary-500" />
            <span className="text-cyan-100 font-semibold truncate max-w-[200px]">{file.name}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-6 w-6 rounded-full hover:bg-red-500/20"
          >
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mb-4" />
        <div className="w-full bg-[#10151c]/70 rounded-lg shadow-inner p-3 max-h-[300px] overflow-y-auto custom-scrollbar">
          {loading && <div className="text-cyan-300 text-sm">Loading ZIP contents...</div>}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {files.length > 0 && <FileList files={files} />}
          {files.length === 0 && !loading && !error && (
            <div className="text-cyan-200 text-xs">(Empty ZIP file)</div>
          )}
        </div>
        {/* Custom scrollbar style */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(16, 21, 28, 0.3);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(120deg, rgba(34,211,238,0.5), rgba(59,130,246,0.4));
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(120deg, rgba(34,211,238,0.8), rgba(59,130,246,0.7));
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(34,211,238,0.5) rgba(16,21,28,0.3);
          }
        `}</style>
      </div>
    </div>
  );
};

export default FileUploadPreview; 