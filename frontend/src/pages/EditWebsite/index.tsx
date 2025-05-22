// import { useMemo, useState } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Upload, X, Edit2, Save } from 'lucide-react';
// import { useDropzone } from 'react-dropzone';
// import { useSuiData } from '@/hooks/useSuiData';
// import { useAuth } from '@/context/AuthContext';
// import { transformMetadataToProject } from '@/utils/metadataUtils';
// import { Project } from '@/types/project';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { useParams } from 'react-router';

// // Editable Project Fields Component
// const EditableProjectFields = ({ project, onUpdate }: { project: Project; onUpdate: (project: Project) => void }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [installCommand, setInstallCommand] = useState(project.installCommand);
//   const [buildCommand, setBuildCommand] = useState(project.buildCommand);
//   const [defaultRoute, setDefaultRoute] = useState(project.defaultRoute);

//   const handleSave = () => {
//     onUpdate({
//       ...project,
//       installCommand,
//       buildCommand,
//       defaultRoute,
//     });
//     setIsEditing(false);
//   };

//   const handleCancel = () => {
//     setInstallCommand(project.installCommand);
//     setBuildCommand(project.buildCommand);
//     setDefaultRoute(project.defaultRoute);
//     setIsEditing(false);
//   };

//   if (isEditing) {
//     return (
//       <div className="space-y-3 py-2">
//         <div className="flex items-center gap-3">
//           <label className="w-20 text-sm text-cyan-300 font-medium">Install:</label>
//           <Input
//             value={installCommand}
//             onChange={(e) => setInstallCommand(e.target.value)}
//             className="h-9 bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//           />
//         </div>
//         <div className="flex items-center gap-3">
//           <label className="w-20 text-sm text-cyan-300 font-medium">Build:</label>
//           <Input
//             value={buildCommand}
//             onChange={(e) => setBuildCommand(e.target.value)}
//             className="h-9 bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//           />
//         </div>
//         <div className="flex items-center gap-3">
//           <label className="w-20 text-sm text-cyan-300 font-medium">Route:</label>
//           <Input
//             value={defaultRoute}
//             onChange={(e) => setDefaultRoute(e.target.value)}
//             className="h-9 bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//           />
//         </div>
//         <div className="flex justify-end gap-3 mt-3">
//           <Button
//             size="sm"
//             variant="outline"
//             onClick={handleCancel}
//             className="h-9 border-red-500/50 hover:bg-red-500/20 text-red-300 rounded-md"
//           >
//             <X size={16} className="mr-1" />
//             Cancel
//           </Button>
//           <Button
//             size="sm"
//             onClick={handleSave}
//             className="h-9 bg-cyan-600 hover:bg-cyan-500 text-cyan-50 rounded-md"
//           >
//             <Save size={16} className="mr-1" />
//             Save
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between group">
//         <div className="space-y-1">
//           <div className="flex items-center">
//             <span className="text-sm text-cyan-300 w-20 font-medium">Install:</span>
//             <span className="text-cyan-100">{project.installCommand}</span>
//           </div>
//           <div className="flex items-center">
//             <span className="text-sm text-cyan-300 w-20 font-medium">Build:</span>
//             <span className="text-cyan-100">{project.buildCommand}</span>
//           </div>
//           <div className="flex items-center">
//             <span className="text-sm text-cyan-300 w-20 font-medium">Route:</span>
//             <span className="text-cyan-100">{project.defaultRoute}</span>
//           </div>
//         </div>
//         <Button
//           size="sm"
//           variant="ghost"
//           onClick={() => setIsEditing(true)}
//           className="opacity-0 group-hover:opacity-100 h-9 text-cyan-300 hover:text-cyan-100 hover:bg-cyan-600/20 rounded-md"
//         >
//           <Edit2 size={16} />
//         </Button>
//       </div>
//     </div>
//   );
// };

// // Main App Component
// function App() {
//   const [name, setName] = useState('');
//   const [framework, setFramework] = useState('React');
//   const [installCmd, setInstallCmd] = useState('pnpm install');
//   const [buildCmd, setBuildCmd] = useState('pnpm build');
//   const [outputDir, setOutputDir] = useState('dist');
//   const [rootDir, setRootDir] = useState('/');
//   const [cacheControl, setCacheControl] = useState('default');
//   const [previewOpen, setPreviewOpen] = useState(false);
//   const [previewUrl, setPreviewUrl] = useState('');

//   const { address }: any = useAuth();
//   const { metadata, isLoading, refetch } = useSuiData(
//     '0x18a4c45a96c15d62b82b341f18738125bf875fee86057d88589a183700601a1c',
//   );
//   const { id } = useParams();

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: { 'application/zip': ['.zip'] },
//     onDrop: (acceptedFiles) => {
//       console.log('Uploaded files:', acceptedFiles);
//       // Handle file upload logic here
//     },
//   });

//   const [searchQuery, setSearchQuery] = useState('');
//   const [date, setDate] = useState(undefined);
//   const formatDate = (date: Date) => {
//     return date.toLocaleDateString('en-GB', {
//       year: 'numeric',
//       month: '2-digit',
//       day: '2-digit',
//     });
//   };

//   const filteredProjects = useMemo(() => {
//     const projects = metadata
//       ? metadata.map((meta, index) => transformMetadataToProject(meta, index)).filter((project) => project.parentId === parseInt(id))
//       : [];
//     if (!projects || projects.length === 0) return [];
//     let filtered = projects.filter((project) => {
//       const matchesSearch =
//         project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         project.url.toLowerCase().includes(searchQuery.toLowerCase());

//       const matchesDate =
//         !date ||
//         formatDate(project.startDate) === formatDate(date) ||
//         formatDate(project.expiredDate) === formatDate(date);

//       return matchesSearch && matchesDate;
//     });

//     return filtered;
//   }, [searchQuery, date, metadata, id]);

//   const handleUpdateProject = (updatedProject: Project) => {
//     console.log('Updating project:', updatedProject);
//     alert(`Project ${updatedProject.name} would be updated with:
//     - Install Command: ${updatedProject.installCommand}
//     - Build Command: ${updatedProject.buildCommand}
//     - Default Route: ${updatedProject.defaultRoute}`);
//   };

//   const handlePreview = (url: string) => {
//     setPreviewUrl(url);
//     setPreviewOpen(true);
//   };

//   return (
//     <div className="min-h-screen p-6 md:p-8 lg:p-10">
//       <CardHeader className="mb-6">
//         <CardTitle className="text-3xl font-bold text-cyan-400 font-sans tracking-tight font-pixel">
//           Edit Project
//         </CardTitle>
//       </CardHeader>
//       <Card className="bg-gray-900/80 backdrop-blur-md border border-cyan-500/30 shadow-xl shadow-cyan-500/10 rounded-xl overflow-hidden">
//         <CardContent className="p-6 md:p-8">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Site Preview Section */}

//             {/* Project Settings Section */}
//             <div className="space-y-6 lg:col-span-2">
//               {/* File Upload Section */}
//               <Card className="bg-gray-800/50 border-cyan-500/30 rounded-lg transition-all duration-300 hover:shadow-cyan-500/20">
//                 <CardHeader className="border-b border-cyan-500/20">
//                   <CardTitle className="text-lg text-cyan-300 font-medium">
//                     Upload Project Files
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div
//                     {...getRootProps()}
//                     className={`border-2 border-dashed border-cyan-500/50 rounded-lg p-6 text-center transition-all duration-300 ${
//                       isDragActive ? 'bg-cyan-500/10' : 'bg-gray-700/30'
//                     }`}
//                   >
//                     <input {...getInputProps()} />
//                     <Upload className="mx-auto h-12 w-12 text-cyan-400" />
//                     <p className="mt-2 text-cyan-100">
//                       {isDragActive
//                         ? 'Drop the .zip file here'
//                         : 'Drag & drop a .zip file here, or click to select'}
//                     </p>
//                     <p className="text-sm text-cyan-400/70">Only .zip files are accepted</p>
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Project Configuration */}
//               <Card className="bg-gray-800/50 border-cyan-500/30 rounded-lg transition-all duration-300 hover:shadow-cyan-500/20">
//                 <CardHeader className="border-b border-cyan-500/20">
//                   <CardTitle className="text-lg text-cyan-300 font-medium">
//                     Project Configuration
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-6">
//                   <div className="mb-4">
//                     <Input
//                       placeholder="Search projects..."
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                       className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//                     />
//                   </div>
//                   {isLoading ? (
//                     <div className="text-cyan-400/70 animate-pulse">Loading projects...</div>
//                   ) : filteredProjects.length > 0 ? (
//                     filteredProjects.map((project, index) => (
//                       <div
//                         key={index}
//                         className="bg-gray-700/30 border border-cyan-500/30 text-cyan-100 p-4 rounded-lg mb-4 transition-all duration-200 hover:bg-gray-700/50"
//                       >
//                         <h3 className="text-cyan-200 font-medium mb-3">{project.name}</h3>
//                         <EditableProjectFields project={project} onUpdate={handleUpdateProject} />
//                       </div>
//                     ))
//                   ) : (
//                     <div className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 p-4 rounded-lg text-center">
//                       No projects available
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>

//               {/* Framework and Build Settings */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Framework Selection */}
//                 <Card className="bg-gray-800/50 border-cyan-500/30 rounded-lg transition-all duration-300 hover:shadow-cyan-500/20">
//                   <CardHeader className="border-b border-cyan-500/20">
//                     <CardTitle className="text-lg text-cyan-300 font-medium">
//                       Framework
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-6">
//                     <Select value={framework} onValueChange={setFramework}>
//                       <SelectTrigger className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 focus:ring-2 focus:ring-cyan-500 rounded-md">
//                         <SelectValue placeholder="Select Framework" />
//                       </SelectTrigger>
//                       <SelectContent className="bg-gray-800 border-cyan-500/30 text-cyan-100 rounded-md">
//                         <SelectItem value="React">React</SelectItem>
//                         <SelectItem value="Vue">Vue</SelectItem>
//                         <SelectItem value="Node">Node</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </CardContent>
//                 </Card>

//                 {/* Build and Output Settings */}
//                 <Card className="bg-gray-800/50 border-cyan-500/30 rounded-lg transition-all duration-300 hover:shadow-cyan-500/20">
//                   <CardHeader className="border-b border-cyan-500/20">
//                     <CardTitle className="text-lg text-cyan-300 font-medium">
//                       Build Settings
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-6 space-y-4">
//                     <Input
//                       placeholder="Install Command (e.g., pnpm install)"
//                       value={installCmd}
//                       onChange={(e) => setInstallCmd(e.target.value)}
//                       className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//                     />
//                     <Input
//                       placeholder="Build Command (e.g., pnpm build)"
//                       value={buildCmd}
//                       onChange={(e) => setBuildCmd(e.target.value)}
//                       className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//                     />
//                     <Input
//                       placeholder="Output Directory (e.g., dist)"
//                       value={outputDir}
//                       onChange={(e) => setOutputDir(e.target.value)}
//                       className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//                     />
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>

//             {/* Advanced Options */}
//             <Card className="bg-gray-800/50 border-cyan-500/30 rounded-lg transition-all duration-300 hover:shadow-cyan-500/20">
//               <CardHeader className="border-b border-cyan-500/20">
//                 <CardTitle className="text-lg text-cyan-300 font-edium">
//                   Advanced Options
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-6 space-y-4">
//                 <Input
//                   placeholder="Root Directory (e.g., /)"
//                   value={rootDir}
//                   onChange={(e) => setRootDir(e.target.value)}
//                   className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 placeholder-cyan-400/50 focus:ring-2 focus:ring-cyan-500 rounded-md"
//                 />
//                 <Select value={cacheControl} onValueChange={setCacheControl}>
//                   <SelectTrigger className="bg-gray-700/30 border-cyan-500/30 text-cyan-100 focus:ring-2 focus:ring-cyan-500 rounded-md">
//                     <SelectValue placeholder="Select Cache Control" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-gray-800 border-cyan-500/30 text-cyan-100 rounded-md">
//                     <SelectItem value="default">Default</SelectItem>
//                     <SelectItem value="no-cache">No Cache</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </CardContent>
//             </Card>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Preview Dialog */}
//       <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
//         <DialogContent className="bg-gray-900/90 border-cyan-500/30 text-cyan-100 max-w-5xl rounded-xl">
//           <DialogHeader>
//             <DialogTitle className="text-cyan-300 text-xl font-medium">Site Preview</DialogTitle>
//           </DialogHeader>
//           <div className="mt-4">
//             <iframe
//               src={previewUrl}
//               className="w-full h-[70vh] border border-cyan-500/30 rounded-lg"
//               title="Site Preview"
//             />
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default App;