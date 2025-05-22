import { useEffect, useRef, useState, useCallback } from "react"
import { Info, X } from "lucide-react"
import { Button } from "./ui/button"
import { FormattedMessage } from "react-intl"

interface WebsitePreviewProps {
    htmlContent: string
    assetMap: Record<string, string>
}

export default function WebsitePreview({ htmlContent, assetMap }: WebsitePreviewProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null)

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

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [buttonOpacity, setButtonOpacity] = useState(1);
    const lastScrollY = useRef(0);
    const scrollThreshold = 100; // Pixels to scroll before starting to fade
    const fadeDistance = 200; // Distance over which to fade out

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY.current;

        // Calculate opacity based on scroll direction and position
        if (currentScrollY <= 0) {
            setButtonOpacity(1);
        } else if (scrollDelta < 0) {
            // Scrolling up - fade in
            const newOpacity = Math.min(1, buttonOpacity + 0.1);
            setButtonOpacity(newOpacity);
        } else if (currentScrollY > scrollThreshold) {
            // Scrolling down and past threshold - fade out
            const distanceScrolled = currentScrollY - scrollThreshold;
            const newOpacity = Math.max(0, 1 - (distanceScrolled / fadeDistance));
            setButtonOpacity(newOpacity);
        }

        lastScrollY.current = currentScrollY;
    }, [buttonOpacity]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const issues = [
        <FormattedMessage id="createWebsite.preview.issues.incorrectPaths" defaultMessage="Incorrect paths" />,
        <FormattedMessage id="createWebsite.preview.issues.jsErrors" defaultMessage="JavaScript errors in the browser console" />,
        <FormattedMessage id="createWebsite.preview.issues.mixedContent" defaultMessage="Blocked mixed content (HTTP/HTTPS conflicts)" />,
        <FormattedMessage id="createWebsite.preview.issues.missingDependencies" defaultMessage="Missing required dependencies or libraries" />,
        <FormattedMessage id="createWebsite.preview.issues.incorrectMimeTypes" defaultMessage="Incorrect MIME types for files" />,
        <FormattedMessage id="createWebsite.preview.issues.pathIssues" defaultMessage="Relative vs absolute path issues" />,
        <FormattedMessage id="createWebsite.preview.issues.missingIndex" defaultMessage="Missing index.html or incorrect entry point" />,
        <FormattedMessage id="createWebsite.preview.issues.browserCaching" defaultMessage="Browser caching of old files" />,
        <FormattedMessage id="createWebsite.preview.issues.networkIssues" defaultMessage="Network connectivity issues" />,
        <FormattedMessage id="createWebsite.preview.issues.adBlockers" defaultMessage="Ad blockers or browser extensions interfering" />,
        <FormattedMessage id="createWebsite.preview.issues.ssrRequirements" defaultMessage="Server-side rendering requirements not met" />
    ];

    return (
        <article className="flex flex-col w-full rounded-lg overflow-hidden">
            {/* Floating Toggle Button */}
            <Button
                onClick={toggleDrawer}
                className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center gap-2 group"
                aria-label="Preview not loading? Click for help"
                style={{
                    opacity: buttonOpacity,
                    transform: `translateY(${buttonOpacity < 0.1 ? '32px' : '0'})`,
                    transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                    pointerEvents: buttonOpacity < 0.1 ? 'none' : 'auto',
                }}
            >
                {isDrawerOpen ? (
                    <X size={20} className="flex-shrink-0" />
                ) : (
                    <>
                        <Info size={20} className="flex-shrink-0" />
                        <span className="text-sm font-medium pr-1 hidden sm:inline-block">
                            <FormattedMessage id="createWebsite.preview.buttonPreviewNotLoading" defaultMessage="Preview not loading?" />
                        </span>
                    </>
                )}
            </Button>

            {/* Drawer */}
            <div
                className={`fixed top-0 pt-18 right-0 h-full w-full sm:max-w-md bg-background shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full overflow-y-auto p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-foreground">
                            <FormattedMessage id="createWebsite.preview.title" defaultMessage="Preview Information" />
                        </h2>
                        <button
                            onClick={toggleDrawer}
                            className="p-1 rounded-full hover:bg-muted"
                            aria-label="Close drawer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-lg">
                            <h3 className="font-semibold text-foreground mb-3">
                                <FormattedMessage id="createWebsite.preview.commonIssues" defaultMessage="Common Issues" />
                            </h3>
                            <ul className="space-y-3">
                                {issues.map((issue, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-sm text-muted-foreground">{issue}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 p-4 rounded-lg">
                            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <FormattedMessage id="createWebsite.preview.quickTips" defaultMessage="Quick Tips" />
                            </h3>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span><FormattedMessage id="createWebsite.preview.tipCheckConsole" defaultMessage="Check browser console for specific error messages (Press F12)" /></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span><FormattedMessage id="createWebsite.preview.tipVerifyPaths" defaultMessage="Ensure all file paths in your HTML are correct" /></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span><FormattedMessage id="createWebsite.preview.tipNetworkTab" defaultMessage="Verify network requests in the Network tab" /></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span><FormattedMessage id="createWebsite.preview.tipHardRefresh" defaultMessage="Try hard refreshing (Ctrl+F5) to clear cache" /></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span>•</span>
                                    <span><FormattedMessage id="createWebsite.preview.tipJsErrors" defaultMessage="Check for JavaScript errors in the Console tab" /></span>
                                </li>
                            </ul>
                        </div>


                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30"
                    onClick={toggleDrawer}
                />
            )}
            <section className="flex-1 min-w-0">
                <div className="relative w-full" style={{ paddingTop: '56.25%', }}>
                    <iframe
                        ref={iframeRef}
                        className="absolute top-0 left-0 w-full h-full border-0 pointer-events-none [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50 [scrollbar-width:thin] [scrollbar-color:oklch(var(--muted-foreground)/0.3)_transparent]"
                        title="Website Preview"
                        sandbox="allow-scripts allow-same-origin"
                    />
                </div>
            </section>
        </article>
    )
}
