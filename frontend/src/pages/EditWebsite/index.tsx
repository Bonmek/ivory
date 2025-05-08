import ThreeJSBackground from '@/components/ThreeJsBackground'
import React from 'react'
import { useState } from 'react'
import { Clock, Globe, ChevronRight, Github, Upload } from 'lucide-react'
import { Card } from '@/components/ui/card'

function EditWebsite() {
  const [cacheValue, setCacheValue] = useState(3600)
  const [showGithub, setShowGithub] = useState(true);
  
  const toggleCard = () => {
    setShowGithub(!showGithub);
  };

  return (
    <div className="text-white min-h-screen p-6 font-sans mt-20 container mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex mb-2">
          <h1 className="text-xl font-medium">IVORY</h1>
          <div className="flex items-center ml-4">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-green-500">Ready</span>
          </div>
        </div>
        <div className="text-gray-400 text-sm">ID 651f0a9f3c2a7d5e8f1c1234</div>
      </div>

      {/* Production Deploy Box */}
      <Card className="bg-primary-900/80 border-secondary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.4)] border-2 border-secondary-500/40">
        <h2 className="text-lg mb-4 px-6">Production deploy</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6">
          {/* Domain */}
          <Card className="bg-primary-900/80 border-secondary-500/20">
            <div className="px-6">
              <div className="text-gray-400 mb-2">Domain</div>
              <div className="flex items-center cursor-pointer">
                <Globe size={18} className="text-blue-400 mr-2" />
                <span>myapp.kursui.app</span>
              </div>
            </div>
          </Card>

          {/* Created */}
          <Card className="bg-primary-900/80 border-secondary-500/20">
            <div className="px-6">
              <div className="text-gray-400 mb-2">Created</div>
              <div className="flex items-center">
                <Clock size={18} className="text-gray-400 mr-2" />
                <span>52s ago 05/07/2025 3:28 PM</span>
              </div>
            </div>
          </Card>

          {/* Ownership */}
          <Card className="bg-primary-900/80 border-secondary-500/20">
            <div className="px-6">
              <div className="text-gray-400 mb-2">Ownership</div>
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>leave it to use</span>
              </div>
            </div>
          </Card>
        </div>
      </Card>
      <br />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Build Details */}
        <Card className="bg-primary-900/80 border-secondary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.4)] border-2 border-secondary-500/40 p-6">
          <h2 className="text-lg font-medium mb-6">Build Details</h2>

          {/* Framework */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-sm font-medium mb-3">Framework</h3>
            <div className="flex items-center bg-primary-800/50 rounded-lg p-3 hover:bg-primary-800/70 transition-colors">
              <svg
                className="h-5 w-5 mr-3 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 19.132l10-6.8v6.8l10-17.132-10 6.8V2z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-medium">Next.js 20.1</span>
            </div>
          </div>

          {/* Node */}
          <div className="mb-6">
            <h3 className="text-gray-400 text-sm font-medium mb-3">Node</h3>
            <div className="flex items-center bg-primary-800/50 rounded-lg p-3 hover:bg-primary-800/70 transition-colors">
              <svg
                className="h-5 w-5 mr-3 text-green-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21.8L3.8 17.1c-.5-.3-.8-.8-.8-1.4V7.9c0-.6.3-1.1.8-1.4L12 2.2l8.2 4.3c.5.3.8.8.8 1.4v7.8c0 .6-.3 1.1-.8 1.4L12 21.8z"
                  fill="currentColor"
                />
              </svg>
              <span className="font-medium">21.0x</span>
            </div>
          </div>

          {/* Build Command */}
          <div>
            <h3 className="text-gray-400 text-sm font-medium mb-3">Build Command</h3>
            <div className="bg-blue-950 rounded-lg p-4 font-mono text-sm">next build</div>
          </div>
        </Card>

        {/* Source - Conditional rendering between GitHub and Upload */}
        {showGithub ? (
          <Card className="bg-primary-900/80 border-secondary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.4)] border-2 border-secondary-500/40 p-6">
            
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-medium">Source</h2>
              <button 
                onClick={toggleCard}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 ml-4"
              >
                Switch 
              </button>
            </div>

            <div className="flex items-center mb-6 bg-primary-800/50 rounded-lg p-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
              <Github size={18} className="mr-3" />
              <span className="font-medium">Github</span>
            </div>

            <div className="space-y-6">
              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm font-medium mb-2">Github username</div>
                <div className="font-medium">JJ developer 101</div>
              </div>

              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm font-medium mb-2">Repository name</div>
                <div className="font-medium">project kursui</div>
              </div>

              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <ChevronRight size={16} className="text-gray-400 mr-2" />
                  <span className="font-medium">main</span>
                </div>

                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2"
                    />
                  </svg>
                  <span className="text-sm text-gray-400 truncate font-mono">
                    ae2asd213asdasda1231321312sdaasd123
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="bg-primary-900/80 border-secondary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.4)] border-2 border-secondary-500/40 p-6">
            
            <div className="flex items-center mb-6">
              <h2 className="text-lg font-medium">Source</h2>
              <button 
                onClick={toggleCard}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 ml-4"
              >
                Switch 
              </button>
            </div>

            <div className="flex items-center mb-6 bg-primary-800/50 rounded-lg p-3">
              <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
              <Upload size={18} className="mr-3" />
              <span className="font-medium">Upload</span>
            </div>

            <div className="space-y-6">
              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm font-medium mb-2">File Name</div>
                <div className="font-medium">JJ developer 101</div>
              </div>

              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm font-medium mb-2">Size</div>
                <div className="font-medium">30 MB</div>
              </div>

              <div className="bg-primary-800/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm font-medium mb-2">Directory</div>
                <div className="font-medium">c:/dowload/krusui123.zip</div>
              </div>
            </div>
          </Card>
        )}
      </div>
      <br />

      {/* Cache */}
      <Card className="bg-primary-900/80 border-secondary-500/20">
        <div className="flex items-center">
          <h2 className="px-6 text-lg">Cache</h2>
          <div className="bg-primary-800/50 rounded-lg p-2 ml-3">
              0 3600
          </div>
        </div>
      </Card>
    </div>
  )
}

export default EditWebsite