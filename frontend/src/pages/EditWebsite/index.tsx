import { useState } from 'react';

function App() {
  const [name, setName] = useState('');
  const [framework, setFramework] = useState('React');
  const [installCmd, setInstallCmd] = useState('pnpm install');
  const [buildCmd, setBuildCmd] = useState('pnpm build');
  const [outputDir, setOutputDir] = useState('dist');
  const [rootDir, setRootDir] = useState('/');
  const [cacheControl, setCacheControl] = useState('default');

  return (
    <div className="min-h-screen text-white flex items-center justify-center">
      <div className="w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-pixel">Edit project</h1>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg mb-2">Project files</h2>
            <div className="border-2 border-dashed border-gray-700 p-6 text-center">
              <p>Drag & drop ZIP file here</p>
              <p>or</p>
              <button className="bg-teal-500 text-white px-4 py-2 rounded mt-2">Browse file</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded"
              />
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full bg-gray-700 p-2 rounded"
              >
                <option>React</option>
                <option>Vue</option>
                <option>Node</option>
              </select>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-md mb-2">Build and Output settings</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Install Command"
                  value={installCmd}
                  onChange={(e) => setInstallCmd(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Build Command"
                  value={buildCmd}
                  onChange={(e) => setBuildCmd(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded"
                />
                <input
                  type="text"
                  placeholder="Output Directory"
                  value={outputDir}
                  onChange={(e) => setOutputDir(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded"
                />
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-md mb-2">Advanced options</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Root Directory"
                  value={rootDir}
                  onChange={(e) => setRootDir(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded"
                />
                <select
                  value={cacheControl}
                  onChange={(e) => setCacheControl(e.target.value)}
                  className="w-full bg-gray-700 p-2 rounded"
                >
                  <option>default</option>
                  <option>no-cache</option>
                </select>
              </div>
            </div>
            <button className="bg-teal-500 text-white px-4 py-2 rounded w-full">
              Deploy project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;