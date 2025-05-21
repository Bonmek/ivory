import { useState, useEffect } from "react"
import WebsitePreview from "../WebsitePreview"
import { Card, CardContent } from "@/components/ui/card"
import JSZip from 'jszip'

// ...imports as before

interface FileWithPath extends File {
    path: string;
}

export default function PreviewWebsite({ projectPreview }: { projectPreview: File | null }) {
    const [indexHtmlContent, setIndexHtmlContent] = useState<string | null>(null)
    const [assetMap, setAssetMap] = useState<Record<string, string>>({})

    const createFileWithPath = (fileData: Blob, name: string, path: string, type: string = 'application/octet-stream'): FileWithPath => {
        const file = new File([fileData], name, { type }) as FileWithPath;
        file.path = path;
        return file;
    };

    const handleClearPreview = () => {
        setIndexHtmlContent(null);
        setAssetMap({});
    }

    const processFile = async (file: File | FileWithPath) => {
        handleClearPreview();

        if (file.name.endsWith('.zip')) {
            try {
                const zip = await JSZip.loadAsync(file);
                const files: File[] = [];

                for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
                    if (!zipEntry.dir) {
                        const fileData = await zipEntry.async('blob');
                        const fileName = relativePath.split('/').pop() || 'file';
                        const mimeType = getMimeType(fileName);

                        const fileWithPath = createFileWithPath(fileData, fileName, relativePath, mimeType);
                        files.push(fileWithPath);
                    }
                }

                const dataTransfer = new DataTransfer();
                files.forEach(file => dataTransfer.items.add(file));
                handleFilesSelected(dataTransfer.files);
            } catch (error) {
                console.error('Error processing ZIP file:', error);
            }
        } else {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            handleFilesSelected(dataTransfer.files);
        }
    };

    useEffect(() => {
        if (projectPreview) {
            processFile(projectPreview);
        } else {
            handleClearPreview();
        }
    }, [projectPreview])

    const handleFilesSelected = (selectedFiles: FileList) => {
        const fileArray = Array.from(selectedFiles).map(file => {
            if ('path' in file) return file as FileWithPath;
            return createFileWithPath(file, file.name, file.name, file.type);
        });

        processReactBuild(fileArray)
    }

    const getMimeType = (filename: string): string => {
        const extension = filename.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
            'js': 'application/javascript',
            'mjs': 'application/javascript',
            'cjs': 'application/javascript',
            'json': 'application/json',
            'css': 'text/css',
            'html': 'text/html',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'svg': 'image/svg+xml',
            'webp': 'image/webp'
        };
        return mimeTypes[extension || ''] || 'application/octet-stream';
    };

    const processReactBuild = (fileArray: FileWithPath[]) => {
        const indexHtml = fileArray.find((file) => file.path?.endsWith("index.html"))

        if (indexHtml) {
            const reader = new FileReader()
            reader.onload = (e) => {
                if (e.target?.result) {
                    setIndexHtmlContent(e.target.result as string)

                    const newAssetMap: Record<string, string> = {}

                    fileArray.forEach((file) => {
                        const fileURL = URL.createObjectURL(file)
                        newAssetMap[file.name] = fileURL;
                        newAssetMap[file.path] = fileURL;
                    })

                    setAssetMap(newAssetMap)
                }
            }
            reader.readAsText(indexHtml)
        } else {
            console.warn('index.html not found in uploaded files');
        }
    }

    if (!indexHtmlContent) return null;

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full max-w-7xl">
                <div className="grid grid-cols-1 gap-8">
                    <Card className="overflow-hidden bg-background/0 border-0 py-0 pb-8">
                        <CardContent className="p-0">
                            <WebsitePreview htmlContent={indexHtmlContent} assetMap={assetMap} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}

