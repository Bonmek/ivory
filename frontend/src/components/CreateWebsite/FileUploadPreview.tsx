import { Button } from "@/components/ui/button";
import {
  X,
  Folder,
  File as FileIcon,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertTriangle,
  PackageOpen
} from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import JSZip from "jszip";

interface FileUploadPreviewProps {
  file: File;
  onRemove: () => void;
  setPlaceHolderName: (name: string) => void;
}

export interface FileItem {
  name: string;
  isFolder: boolean;
  path: string;
  children?: FileItem[];
}

const FileList: React.FC<{ files: string[] }> = ({ files, }) => {
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

const FileUploadPreview: React.FC<FileUploadPreviewProps> = ({ file, onRemove, setPlaceHolderName }) => {
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
          if (fileList.length === 0) {
            setError('ZIP file is empty');
            return;
          }
          setFiles(fileList);
        } catch (e) {
          console.error('Error processing ZIP:', e);
          setError('Error processing ZIP file');
        }
        setPlaceHolderName(file.name.replace('.zip', ''));
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-full"
    >
      <div className="bg-primary-900/80 backdrop-blur-sm border border-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-gray-800/50 bg-gradient-to-r from-primary-900/80 to-primary-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary-500/10 rounded-lg">
                <Folder className="w-5 h-5 text-secondary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-100 text-sm truncate max-w-[200px]">
                  {file.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Uploaded file'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="text-xs px-3 py-1.5 text-red-400 hover:bg-red-900/30 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4 mr-1.5" />
              Remove
            </Button>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center p-4 bg-cyan-950/20 rounded-lg border border-cyan-900/30"
            >
              <Loader2 className="w-5 h-5 mr-2 text-cyan-400 animate-spin" />
              <span className="text-cyan-300 text-sm">
                Loading ZIP contents...
              </span>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center p-3 text-center bg-red-900/10 border border-red-900/20 rounded-lg"
            >
              <AlertTriangle className="w-5 h-5 text-red-400 mb-1.5" />
              <p className="text-red-300 text-sm">
                {error}
              </p>
            </motion.div>
          ) : files.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden"
            >
              <div className="text-cyan-100 text-xs max-h-[300px] overflow-auto p-3 repo-scrollbar">
                <FileList files={files} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-gray-800 rounded-lg bg-gray-900/30"
            >
              <PackageOpen className="w-8 h-8 text-gray-500 mb-2" />
              <p className="text-gray-400 text-sm">
                The ZIP file is empty
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FileUploadPreview;