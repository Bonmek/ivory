import { useEffect, useRef, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Laptop, Smartphone, Tablet } from "lucide-react"

interface NextjsPreviewProps {
    selectedPage: string
    assetMap: Record<string, string>
}

export default function NextjsPreview({ selectedPage, assetMap }: NextjsPreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [height, setHeight] = useState(600)
    const [width, setWidth] = useState(100) // percentage

    useEffect(() => {
        if (!iframeRef.current || !selectedPage) return

        setLoading(true)
        setError(null)

        // Find the HTML file for the selected page
        const pagePath = selectedPage === "/" ? "index" : selectedPage.replace(/^\//, "")

        // Check both app and pages router paths
        const possiblePaths = [
            `server/pages/${pagePath}.html`,
            `server/pages/${pagePath}/index.html`,
            `server/app/${pagePath}.html`,
            `server/app/${pagePath}/index.html`,
        ]

        let htmlContent: string | null = null
        let foundPath: string | null = null

        for (const path of possiblePaths) {
            if (assetMap[path]) {
                foundPath = path
                break
            }
        }

        if (!foundPath) {
            setError(`Could not find HTML file for page: ${selectedPage}`)
            setLoading(false)
            return
        }

        // Fetch the HTML content
        fetch(assetMap[foundPath])
            .then((response) => response.text())
            .then((content) => {
                htmlContent = content
                processAndRenderHtml(htmlContent)
            })
            .catch((err) => {
                setError(`Error loading page: ${err.message}`)
                setLoading(false)
            })

        const processAndRenderHtml = (html: string) => {
            // Process HTML content to replace asset paths
            let processedHtml = html

            // Replace Next.js specific asset paths
            processedHtml = processedHtml.replace(/(src|href)=["'](\/_next\/static\/[^"']+)["']/g, (match, attr, path) => {
                // Look for the asset in the assetMap
                const assetKey = `static/${path.replace("/_next/static/", "")}`
                return assetMap[assetKey] ? `${attr}="${assetMap[assetKey]}"` : match
            })

            // Replace chunk loading paths
            processedHtml = processedHtml.replace(/"\/_next\/static\/chunks\/([^"]+)"/g, (match, path) => {
                const assetKey = `static/chunks/${path}`
                return assetMap[assetKey] ? `"${assetMap[assetKey]}"` : match
            })

            // Replace webpack paths
            processedHtml = processedHtml.replace(/"\/_next\/static\/webpack\/([^"]+)"/g, (match, path) => {
                const assetKey = `static/webpack/${path}`
                return assetMap[assetKey] ? `"${assetMap[assetKey]}"` : match
            })

            // Replace CSS paths
            processedHtml = processedHtml.replace(/"\/_next\/static\/css\/([^"]+)"/g, (match, path) => {
                const assetKey = `static/css/${path}`
                return assetMap[assetKey] ? `"${assetMap[assetKey]}"` : match
            })

            // Write to iframe
            const iframe = iframeRef.current
            const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document

            if (iframeDoc) {
                iframeDoc.open()
                iframeDoc.write(processedHtml)
                iframeDoc.close()

                // Add base tag to handle relative URLs
                const baseTag = iframeDoc.createElement("base")
                baseTag.href = "/"
                iframeDoc.head.insertBefore(baseTag, iframeDoc.head.firstChild)

                // Inject script to handle Next.js client-side navigation
                const script = iframeDoc.createElement("script")
                script.textContent = `
          // Prevent Next.js client-side navigation
          window.__NEXT_DATA__ = window.__NEXT_DATA__ || {};
          window.__NEXT_DATA__.props = window.__NEXT_DATA__.props || {};
          
          // Intercept fetch requests to handle asset loading
          const originalFetch = window.fetch;
          window.fetch = function(url, options) {
            if (url && typeof url === 'string' && url.startsWith('/_next/')) {
              // This is a Next.js asset request, we need to handle it
              console.log('Intercepted fetch for Next.js asset:', url);
              // Let it fail gracefully as we can't really handle dynamic requests
              return Promise.reject(new Error('Cannot load dynamic Next.js assets in preview mode'));
            }
            return originalFetch.apply(this, arguments);
          };
          
          // Disable navigation
          const originalPushState = history.pushState;
          history.pushState = function() {
            console.log('Navigation intercepted');
            return originalPushState.apply(this, arguments);
          };
        `
                iframeDoc.body.appendChild(script)

                setLoading(false)
            }
        }

        return () => {
            // Clean up any resources
        }
    }, [selectedPage, assetMap])

    const handleHeightChange = (newHeight: number[]) => {
        setHeight(newHeight[0])
    }

    const handleWidthChange = (newWidth: number[]) => {
        setWidth(newWidth[0])
    }

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
        <div className="relative">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <div className="flex flex-col items-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        <p className="mt-2">Loading page...</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-8 text-center text-red-500">
                    <h3 className="text-lg font-semibold">Error</h3>
                    <p>{error}</p>
                </div>
            )}

            <div className="mb-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-24">Preview Size:</span>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={width === 30 ? "default" : "outline"}
                            onClick={() => setDeviceSize("mobile")}
                            title="Mobile view"
                        >
                            <Smartphone className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={width === 60 ? "default" : "outline"}
                            onClick={() => setDeviceSize("tablet")}
                            title="Tablet view"
                        >
                            <Tablet className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant={width === 100 ? "default" : "outline"}
                            onClick={() => setDeviceSize("desktop")}
                            title="Desktop view"
                        >
                            <Laptop className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-24">Width:</span>
                    <div className="flex-1">
                        <Slider value={[width]} min={20} max={100} step={1} onValueChange={handleWidthChange} />
                    </div>
                    <span className="text-sm w-12">{width}%</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium w-24">Height:</span>
                    <div className="flex-1">
                        <Slider value={[height]} min={300} max={1200} step={50} onValueChange={handleHeightChange} />
                    </div>
                    <span className="text-sm w-12">{height}px</span>
                </div>
            </div>

            <div className="flex justify-center rounded-lg overflow-hidden">
                <div style={{ width: `${width}%` }} className="transition-all duration-300 ease-in-out">
                    <iframe
                        ref={iframeRef}
                        style={{ height: `${height}px` }}
                        className="w-full border-0 [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50 [scrollbar-width:thin] [scrollbar-color:oklch(var(--muted-foreground)/0.3)_transparent]"
                        title="Next.js Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </div>
        </div>
    )
}
