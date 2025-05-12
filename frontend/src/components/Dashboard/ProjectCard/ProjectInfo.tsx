import { ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface ProjectInfoProps {
  project: {
    name: string
    suins?: string
    siteId?: string
    status: number
  }
  colors: {
    text: string
    link: string
  }
  handleCopy: (text: string) => Promise<void>
}

export const ProjectInfo = ({ project, colors, handleCopy }: ProjectInfoProps) => {
  const [copied, setCopied] = useState(false)

  const onCopy = async (text: string) => {
    await handleCopy(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className={`font-bold text-base truncate group-hover:translate-x-0.5 transition-transform duration-200 ${colors.text}`}>
        {project.name}
      </div>
      {project.suins && (
        <a
          href={`https://${project.suins}.wal.app`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center h-[28px] hover:underline truncate transition-colors duration-200 ${colors.link}`}
        >
          {project.suins}.suins
          <span className="ml-1 group-hover:translate-x-0.5 transition-transform duration-200">
            <ExternalLink className="h-4 w-4 flex-shrink-0" />
          </span>
        </a>
      )}
      {project.status === 1 && project.siteId && (
        <div className="flex items-center text-xs text-white/60 mb-2 group-hover:translate-x-0.5 transition-transform duration-200">
          <span className="truncate mr-2">
            Site ID: {project.siteId.slice(0, 6)}...{project.siteId.slice(-4)}
          </span>
          <button
            onClick={() => onCopy(project.siteId!)}
            className="p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}
    </>
  )
} 