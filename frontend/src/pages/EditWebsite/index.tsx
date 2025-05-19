import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useSuiData } from '@/hooks/useSuiData';
import { useAuth } from '@/context/AuthContext';
import { Project, transformMetadataToProject } from '@/utils/metadataUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProjectCard from '@/components/Dashboard/ProjectCard';
import { id } from 'date-fns/locale';
import { useParams } from 'react-router';

function App() {
  const [name, setName] = useState('');
  const [framework, setFramework] = useState('React');
  const [installCmd, setInstallCmd] = useState('pnpm install');
  const [buildCmd, setBuildCmd] = useState('pnpm build');
  const [outputDir, setOutputDir] = useState('dist');
  const [rootDir, setRootDir] = useState('/');
  const [cacheControl, setCacheControl] = useState('default');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const { address }: any = useAuth();
  const { metadata, isLoading, refetch } = useSuiData(
    '0x18a4c45a96c15d62b82b341f18738125bf875fee86057d88589a183700601a1c',
  );
  const {id} = useParams();
  console.log(id, 'parentId');

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/zip': ['.zip'] }, // Fixed typo in accept
    onDrop: (acceptedFiles) => {
      console.log('Uploaded files:', acceptedFiles);
      // Handle file upload logic here
    },
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const filteredProjects = useMemo(() => {
    const projects = metadata
      ? metadata.map((meta, index) => transformMetadataToProject(meta, index))
      .filter((project: Project) => project.parentId === id)
      : [];
    if (!projects || projects.length === 0) return [];
    let filtered = projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.url.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate =
        !date ||
        formatDate(project.startDate) === formatDate(date) ||
        formatDate(project.expiredDate) === formatDate(date);

      return matchesSearch && matchesDate;
    });

    return filtered;
  }, [searchQuery, date, metadata]);
  console.log(filteredProjects, 'find one');
  console.log(metadata, 'metadata');


  const handlePreview = (url: string) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  return (
    <div className="p-6 min-h-screen ">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-cyan-300 font-pixel">
          Edit Project
        </CardTitle>
      </CardHeader>
      <Card className="bg-gray-800/80 backdrop-blur-sm border-cyan-600/50 shadow-lg shadow-cyan-500/20 animate-fade">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Site Preview Section */}
            <Card className="bg-gray-700/50 border-cyan-600/50 transition-all duration-300 hover:shadow-cyan-500/30 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-200 font-semibold">
                  Site Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img
                    src="https://via.placeholder.com/800x600/1F2A44/67E8F9?text=Website+Preview"
                    alt="Site Preview"
                    className="max-w-full h-auto rounded-lg border border-cyan-600/50 transition-all duration-300 hover:scale-105"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Project Files Section */}
            <Card className="bg-gray-700/50 border-cyan-600/50 transition-all duration-300 hover:shadow-cyan-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-cyan-200 font-semibold">
                  Project Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed border-cyan-500 p-6 text-center rounded-xl transition-all duration-300 ${
                    isDragActive ? 'bg-teal-600/20' : 'bg-gray-700/30'
                  } hover:bg-teal-600/10`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-cyan-400" />
                  <p className="mt-2 text-cyan-100">
                    {isDragActive
                      ? 'Drop the ZIP file here'
                      : 'Drag & drop ZIP file here'}
                  </p>
                  <p className="text-cyan-300/70">or</p>
                  <Button
                    variant="outline"
                    className="mt-4 border-cyan-500 text-cyan-100 hover:bg-cyan-500 hover:text-white transition-colors duration-200"
                  >
                    Browse File
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Settings Section */}
            <div className="space-y-6">
              {/* Project Name */}
              <Card className="bg-gray-700/50 border-cyan-600/50 transition-all duration-300 hover:shadow-cyan-500/30">
                <CardContent className="p-4">
                  {isLoading ? (
                    <div className="text-cyan-300/70">Loading projects...</div>
                  ) : filteredProjects.length > 0 ? (
                    filteredProjects.map((project, index) => (
                      <div
                        key={index}
                        className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 p-3 rounded-lg mb-2 transition-all duration-200 hover:bg-teal-600/20"
                      >
                        <span>{project.name}</span>
                        <br/>
                        <span>{project.installCommand}</span>
                        <br/>
                        <span>{project.buildCommand}</span>
                        <br/>
                        <span>{project.defaultRoute}</span>
                      </div>
                      
                    ))
                  ) : (
                    <div className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 p-3 rounded-lg">
                      No projects available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Framework and Build Settings Row */}
              <div className="flex flex-row gap-6 sm:flex-col">
                {/* Framework Selection */}
                <Card className="bg-gray-700/50 border-cyan-600/50 transition-all duration-300 hover:shadow-cyan-500/30 flex-1">
                  <CardContent className="p-4">
                    <Select value={framework} onValueChange={setFramework}>
                      <SelectTrigger className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 focus:ring-cyan-500">
                        <SelectValue placeholder="Select Framework" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-cyan-600/50 text-cyan-100">
                        <SelectItem value="React">React</SelectItem>
                        <SelectItem value="Vue">Vue</SelectItem>
                        <SelectItem value="Node">Node</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Build and Output Settings */}
                <Card className="bg-gray-700/50 border-cyan-600/50 transition-all duration-300 hover:shadow-cyan-500/30 flex-1">
                  <CardHeader>
                    <CardTitle className="text-lg text-cyan-200 font-semibold">
                      Build and Output Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Install Command"
                      value={installCmd}
                      onChange={(e) => setInstallCmd(e.target.value)}
                      className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 placeholder-cyan-300/50 focus:ring-cyan-500"
                    />
                    <Input
                      placeholder="Build Command"
                      value={buildCmd}
                      onChange={(e) => setBuildCmd(e.target.value)}
                      className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 placeholder-cyan-300/50 focus:ring-cyan-500"
                    />
                    <Input
                      placeholder="Output Directory"
                      value={outputDir}
                      onChange={(e) => setOutputDir(e.target.value)}
                      className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 placeholder-cyan-300/50 focus:ring-cyan-500"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Options */}
              <Card className="bg-gray-700/50 border-cyan-600/50 transition-all duration-300 hover:shadow-cyan-500/30">
                <CardHeader>
                  <CardTitle className="text-lg text-cyan-200 font-semibold">
                    Advanced Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Root Directory"
                    value={rootDir}
                    onChange={(e) => setRootDir(e.target.value)}
                    className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 placeholder-cyan-300/50 focus:ring-cyan-500"
                  />
                  <Select value={cacheControl} onValueChange={setCacheControl}>
                    <SelectTrigger className="bg-gray-600/30 border-cyan-600/50 text-cyan-100 focus:ring-cyan-500">
                      <SelectValue placeholder="Select Cache Control" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-cyan-600/50 text-cyan-100">
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="no-cache">No Cache</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>


            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;