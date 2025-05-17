import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { useSuiData } from '@/hooks/useSuiData'
import { useAuth } from '@/context/AuthContext'
import { transformMetadataToProject } from '@/utils/metadataUtils'

function App() {
  const [name, setName] = useState('')
  const [framework, setFramework] = useState('React')
  const [installCmd, setInstallCmd] = useState('pnpm install')
  const [buildCmd, setBuildCmd] = useState('pnpm build')
  const [outputDir, setOutputDir] = useState('dist')
  const [rootDir, setRootDir] = useState('/')
  const [cacheControl, setCacheControl] = useState('default')

  const { address }: any = useAuth()
  const { metadata, isLoading, refetch } = useSuiData(
    '0x18a4c45a96c15d62b82b341f18738125bf875fee86057d88589a183700601a1c',
  )

  // File upload handling with react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/zip': ['.zip'] },
    onDrop: (acceptedFiles) => {
      console.log('Uploaded files:', acceptedFiles)
      // Handle file upload logic here
    },
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [date, setDate] = useState<Date | undefined>(undefined)
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const filteredProjects = useMemo(() => {
    const projects = metadata
      ? metadata.map((meta, index) => transformMetadataToProject(meta, index))
      : []
    if (!projects || projects.length === 0) return []
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.url.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDate =
        !date ||
        formatDate(project.startDate) === formatDate(date) ||
        formatDate(project.expiredDate) === formatDate(date)

      return matchesSearch && matchesDate
    })
    console.log(filtered, 'hello')

    return filtered
  }, [searchQuery, date, metadata])

  console.log(filteredProjects, 'hi')

  return (
    <div className="min-h-screen text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-pixel font-bold">
            Edit Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Files Section */}
            <Card className="bg-gray-700 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg">Project Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed border-gray-500 p-6 text-center rounded-lg transition-colors ${
                    isDragActive ? 'bg-gray-600' : 'bg-gray-700'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2">
                    {isDragActive
                      ? 'Drop the ZIP file here'
                      : 'Drag & drop ZIP file here'}
                  </p>
                  <p className="text-gray-400">or</p>
                  <Button variant="outline" className="mt-4">
                    Browse File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Settings Section */}
            <div className="space-y-6">
              {/* Project Name */}
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project, index) => (
                      <div
                        key={index}
                        className="bg-gray-600 border-gray-500 text-white p-2 rounded mb-2"
                      >
                        {project.name}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-600 border-gray-500 text-white p-2 rounded">
                      No projects available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Framework Selection */}
              <Card className="bg-gray-700 border-gray-600">
                <CardContent className="p-4">
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                      <SelectValue placeholder="Select Framework" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="React">React</SelectItem>
                      <SelectItem value="Vue">Vue</SelectItem>
                      <SelectItem value="Node">Node</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Build and Output Settings */}
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg">
                    Build and Output Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Install Command"
                    value={installCmd}
                    onChange={(e) => setInstallCmd(e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                  <Input
                    placeholder="Build Command"
                    value={buildCmd}
                    onChange={(e) => setBuildCmd(e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                  <Input
                    placeholder="Output Directory"
                    value={outputDir}
                    onChange={(e) => setOutputDir(e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                </CardContent>
              </Card>

              {/* Advanced Options */}
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg">Advanced Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Root Directory"
                    value={rootDir}
                    onChange={(e) => setRootDir(e.target.value)}
                    className="bg-gray-600 border-gray-500 text-white"
                  />
                  <Select value={cacheControl} onValueChange={setCacheControl}>
                    <SelectTrigger className="bg-gray-600 border-gray-500 text-white">
                      <SelectValue placeholder="Select Cache Control" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600 text-white">
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="no-cache">No Cache</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Deploy Button */}
              <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                Deploy Project
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default App
