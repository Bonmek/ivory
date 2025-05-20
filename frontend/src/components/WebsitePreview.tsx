import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Laptop, Smartphone, Tablet } from "lucide-react"

interface WebsitePreviewProps {
    htmlContent: string
    assetMap: Record<string, string>
}

export default function WebsitePreview({ htmlContent, assetMap }: WebsitePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [width, setWidth] = useState(100) // percentage

    useEffect(() => {
        if (!iframeRef.current || !htmlContent) return

        // Process HTML content to replace asset paths
        let processedHtml = htmlContent

        // Replace static asset paths
        Object.entries(assetMap).forEach(([path, url]) => {
            // Handle various path formats
            const patterns = [
                new RegExp(`(src|href)=["'](\\./)?${path}["']`, "g"),
                new RegExp(`(src|href)=["']/static/${path}["']`, "g"),
                new RegExp(`(src|href)=["']/assets/${path}["']`, "g"),
                new RegExp(`(src|href)=["']/images/${path}["']`, "g"),
                new RegExp(`(src|href)=["']/css/${path}["']`, "g"),
                new RegExp(`(src|href)=["']/js/${path}["']`, "g"),
                new RegExp(`(src|href)=["']/media/${path}["']`, "g"),
            ]

            patterns.forEach((pattern) => {
                processedHtml = processedHtml.replace(pattern, `$1="${url}"`)
            })
        })

            // Handle common static folder paths
            ;["static", "assets", "js", "css", "media", "images"].forEach((folder) => {
                const folderRegex = new RegExp(`(src|href)=["']/${folder}/([^"']+)["']`, "g")
                processedHtml = processedHtml.replace(folderRegex, (match, attr, file) => {
                    const assetPath = `${folder}/${file}`
                    return assetMap[assetPath] ? `${attr}="${assetMap[assetPath]}"` : match
                })
            })

        // Handle relative paths
        processedHtml = processedHtml.replace(/(src|href)=["']\.\/([^"']+)["']/g, (match, attr, file) => {
            return assetMap[file] ? `${attr}="${assetMap[file]}"` : match
        })

        // Write to iframe
        const iframe = iframeRef.current
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document

        if (iframeDoc) {
            iframeDoc.open()
            iframeDoc.write(processedHtml)
            iframeDoc.close()
        }

        return () => {
            // Clean up any resources
        }
    }, [htmlContent, assetMap])



    const setDeviceSize = (device: "mobile" | "tablet" | "desktop") => {
        switch (device) {
            case "mobile":
                setWidth(30)
                break
            case "tablet":
                setWidth(60)
                break
            case "desktop":
                setWidth(100)
                break
        }
    }

    return (
        <div>
            {/* <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full p-4 bg-primary-800 backdrop-blur-sm rounded-t-lg">
                    <div className="mb-2 sm:mb-0">
                        <h3 className="text-sm font-medium text-foreground/80">Preview Size</h3>
                        <p className="text-xs text-muted-foreground">Choose a device view</p>
                    </div>
                    <div className="flex gap-2 bg-background/80 p-1 rounded-md border">
                        <Button
                            size="sm"
                            variant={width === 30 ? "default" : "ghost"}
                            onClick={() => setDeviceSize("mobile")}
                            className={`h-8 w-12 px-2 transition-all ${width === 30 ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`}
                            title="Mobile view"
                        >
                            <Smartphone className="h-4 w-4" />
                            <span className="sr-only">Mobile</span>
                        </Button>
                        <Button
                            size="sm"
                            variant={width === 60 ? "default" : "ghost"}
                            onClick={() => setDeviceSize("tablet")}
                            className={`h-8 w-12 px-2 transition-all ${width === 60 ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`}
                            title="Tablet view"
                        >
                            <Tablet className="h-4 w-4" />
                            <span className="sr-only">Tablet</span>
                        </Button>
                        <Button
                            size="sm"
                            variant={width === 100 ? "default" : "ghost"}
                            onClick={() => setDeviceSize("desktop")}
                            className={`h-8 w-12 px-2 transition-all ${width === 100 ? 'shadow-sm' : 'opacity-70 hover:opacity-100'}`}
                            title="Desktop view"
                        >
                            <Laptop className="h-4 w-4" />
                            <span className="sr-only">Desktop</span>
                        </Button>
                    </div>
                </div>
            </div> */}
            <div className="flex justify-center rounded-lg overflow-hidden">
                <div style={{ width: `${width}%` }} className="transition-all duration-300 ease-in-out">
                    <iframe
                        ref={iframeRef}
                        style={{ height: "800px" }}
                        className="w-full border-0 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50 [scrollbar-width:thin] [scrollbar-color:oklch(var(--muted-foreground)/0.3)_transparent]"
                        title="Website Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>
        </div>
    )
}
