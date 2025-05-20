import { useState, useEffect } from "react"
import WebsitePreview from "../WebsitePreview"
import NextjsPreview from "../NextjsPreview"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import JSZip from 'jszip'

// Extend the File type to include our custom path property
interface FileWithPath extends File {
    path: string;
}

type PreviewType = "react" | "nextjs"

export default function PreviewWebsite({ selectedFile, selectedRepoFile, uploadMethod }: { selectedFile: File | null, selectedRepoFile: File | null, uploadMethod: string }) {
    const previewFile = uploadMethod === "github" ? selectedRepoFile : selectedFile
    const [files, setFiles] = useState<FileWithPath[]>([])
    const [indexHtmlContent, setIndexHtmlContent] = useState<string | null>(null)
    const [assetMap, setAssetMap] = useState<Record<string, string>>({})
    const [nextjsPages, setNextjsPages] = useState<string[]>([])
    const [selectedNextjsPage, setSelectedNextjsPage] = useState<string>("")
    const [previewType, setPreviewType] = useState<PreviewType>("react")

    // Helper function to create a FileWithPath
    const createFileWithPath = (fileData: Blob, name: string, path: string, type: string = 'application/octet-stream'): FileWithPath => {
        const file = new File([fileData], name, { type }) as FileWithPath;
        file.path = path;
        return file;
    };

    const handleClearPreview = () => {
        setFiles([]);
        setIndexHtmlContent(null);
        setAssetMap({});
        setNextjsPages([]);
        setSelectedNextjsPage("");
        setPreviewType("react");
    }

    const processFile = async (file: File | FileWithPath) => {
        // Reset previous state
        handleClearPreview();

        if (file.name.endsWith('.zip')) {
            try {
                const zip = await JSZip.loadAsync(file);
                const files: File[] = [];

                // Process each file in the zip
                // Process files in sequence to maintain order
                for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
                    if (!zipEntry.dir) {
                        const fileData = await zipEntry.async('blob');
                        const fileName = relativePath.split('/').pop() || 'file';

                        // Create a file with path information and proper MIME type
                        const mimeType = getMimeType(fileName);
                        const fileWithPath = createFileWithPath(
                            fileData,
                            fileName,
                            relativePath,
                            mimeType
                        );

                        files.push(fileWithPath);
                    }
                }

                // Create a FileList-like object
                const dataTransfer = new DataTransfer();
                files.forEach(file => {
                    const filePath = 'path' in file ? file.path : file.name;
                    dataTransfer.items.add(file);
                });

                handleFilesSelected(dataTransfer.files);
            } catch (error) {
                console.error('Error processing ZIP file:', error);
                // Handle error appropriately
            }
        } else {
            // Handle single file
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            handleFilesSelected(dataTransfer.files);
        }
    };

    useEffect(() => {
        if (previewFile) {
            processFile(previewFile);
        } else {
            handleClearPreview();
        }
    }, [previewFile])

    const handleFilesSelected = (selectedFiles: FileList) => {
        const fileArray = Array.from(selectedFiles).map(file => {
            // Convert regular File to FileWithPath if needed
            if ('path' in file) {
                return file as FileWithPath;
            }
            // Create a FileWithPath for regular files
            return createFileWithPath(
                file,
                file.name,
                file.name, // Use filename as path for non-zip files
                file.type
            );
        });

        setFiles(fileArray);

        fileArray.slice(0, 3).forEach((file, i) => {
            if (file.size < 10000) {
                const reader = new FileReader();
                reader.onload = () => {
                    console.log(`Content start of ${file.name}:`,
                        String(reader.result).substring(0, 200) +
                        (file.size > 200 ? '...' : ''));
                };
                reader.readAsText(file);
            }
        });

        // Create asset map for all files
        const newAssetMap: Record<string, string> = {}

        // Check if this is a Next.js build
        const isNextjsBuild = fileArray.some((file) => file.webkitRelativePath?.includes(".next/") || file.name === ".next")

        if (isNextjsBuild) {
            setPreviewType("nextjs")
            processNextjsBuild(fileArray)
        } else {
            setPreviewType("react")
            processReactBuild(fileArray)
        }
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
        // Find index.html file
        const indexHtml = fileArray.find((file) => file.name === "index.html");

        if (indexHtml) {
            const reader = new FileReader()
            reader.onload = (e) => {
                if (e.target?.result) {
                    // Process HTML content to fix script tags
                    let htmlContent = e.target.result as string;

                    // Fix script tags to have proper type="module"
                    htmlContent = htmlContent.replace(
                        /<script\s+([^>]*)src=(["'])(.*?)\2([^>]*)>/gi,
                        (match, before, quote, src, after) => {
                            // Check if it's a module script
                            const isModule = match.includes('type="module"') ||
                                match.includes('type=module') ||
                                src.endsWith('.mjs');
                            return `<script ${before}src=${quote}${src}${quote} ${isModule ? 'type="module"' : ''}${after}>`;
                        }
                    );

                    setIndexHtmlContent(htmlContent);

                    // Create asset map for all other files
                    const newAssetMap: Record<string, string> = {}
                    fileArray.forEach((file) => {
                        if (file.name !== "index.html") {
                            const mimeType = getMimeType(file.name);
                            const blob = new Blob([file], { type: mimeType });
                            const url = URL.createObjectURL(blob);
                            newAssetMap[file.name] = url;

                            // Handle static folder structure using path property
                            if ('path' in file) {
                                const relativePath = file.path.replace(/^[^/]+\//, "");
                                newAssetMap[relativePath] = url;
                            }
                        }
                    })

                    setAssetMap(newAssetMap)
                }
            }
            reader.readAsText(indexHtml)
        }
    }

    const processNextjsBuild = (fileArray: FileWithPath[]) => {
        const newAssetMap: Record<string, string> = {}
        const htmlPages: string[] = []

        // Process all files and create object URLs
        fileArray.forEach((file) => {
            if (file.webkitRelativePath) {
                const relativePath = file.webkitRelativePath.replace(/^[^/]+\//, "")
                newAssetMap[relativePath] = URL.createObjectURL(file)

                // Collect HTML pages from server/pages or server/app directories
                if (
                    (relativePath.startsWith("server/pages/") || relativePath.startsWith("server/app/")) &&
                    relativePath.endsWith(".html")
                ) {
                    // Extract route path
                    let routePath = relativePath.replace("server/pages/", "/").replace("server/app/", "/").replace(".html", "")

                    // Handle index pages
                    if (routePath.endsWith("/index")) {
                        routePath = routePath.replace("/index", "/")
                    }
                    if (routePath === "") {
                        routePath = "/"
                    }

                    htmlPages.push(routePath)
                }
            } else {
                newAssetMap[file.name] = URL.createObjectURL(file)
            }
        })

        setAssetMap(newAssetMap)
        setNextjsPages(htmlPages)

        // Select the homepage by default
        if (htmlPages.includes("/")) {
            setSelectedNextjsPage("/")
        } else if (htmlPages.length > 0) {
            setSelectedNextjsPage(htmlPages[0])
        }
    }

    // Determine if we have content to show
    const hasContent = (previewType === "react" && indexHtmlContent) ||
        (previewType === "nextjs" && nextjsPages.length > 0);

    if (!hasContent) {
        return null; // Don't render anything if there's no content
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-between">
            <div className="w-full max-w-7xl">
                <div className="grid grid-cols-1 gap-8">
                    {previewType === "nextjs" && nextjsPages.length > 0 && (
                        <Card className="mb-4">
                            <CardHeader>
                                <CardTitle>Select Page to Preview</CardTitle>
                                <CardDescription>Choose a route from your Next.js build</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {nextjsPages.map((page) => (
                                        <Button
                                            key={page}
                                            variant={selectedNextjsPage === page ? "default" : "outline"}
                                            onClick={() => setSelectedNextjsPage(page)}
                                            className="justify-start overflow-hidden text-ellipsis"
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <Card className="overflow-hidden bg-background/0 border-0 py-0 pb-8">
                        <CardContent className="p-0">
                            {previewType === "react" ? (
                                <WebsitePreview htmlContent={indexHtmlContent!} assetMap={assetMap} />
                            ) : (
                                <NextjsPreview selectedPage={selectedNextjsPage} assetMap={assetMap} />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    )
}
