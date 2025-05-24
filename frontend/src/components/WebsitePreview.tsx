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
    console.log('assetMap', assetMap)
    console.log('htmlContent', htmlContent)
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

        {/* ส่วน preview */}
        <section className="flex-1 min-w-0">
            <div
                className="relative w-full"
                style={{ paddingTop: `${(9 / 16) * 100}%` }} // 56.25% for 16:9
            >
                <iframe
                    ref={iframeRef}
                    className="absolute top-0 left-0 w-full h-full border-0 pointer-events-none [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50 [scrollbar-width:thin] [scrollbar-color:oklch(var(--muted-foreground)/0.3)_transparent]"
                    title="Website Preview"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        </section>
    </div>
)}
