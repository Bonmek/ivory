import React from 'react';

function EditWebsite() {
  return (
    <div>
      <nav className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold">IVORY</span>
          <a href="#" className="text-gray-400 hover:text-white">Home</a>
          <a href="#" className="text-gray-400 hover:text-white">Dashboard</a>
          <a href="#" className="text-gray-400 hover:text-white">How to use</a>
          <a href="#" className="text-gray-400 hover:text-white">About us</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Create</button>
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-white">🔔</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-700"></div>
        </div>
      </nav>
      <div className="p-6 bg-gray-900 text-white min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl">651f0a9f3c2a7d5e8f1c1234</h1>
          <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center">
            <span className="mr-1">✏️</span> Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Project Files Section */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg flex items-center">
              Project files <span className="ml-2 text-red-500">⚠️</span>
            </h2>
            <div className="flex space-x-2 my-4">
              <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Upload</button>
              <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500">Github</button>
            </div>
            <div className="flex justify-between items-center border-b border-gray-700 py-2">
              <span>Name</span>
              <span>Size</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Barcampsongkhla.zip</span>
              <div className="flex items-center">
                <span className="mr-2">1 GB</span>
                <button className="text-gray-400 hover:text-white">✖️</button>
              </div>
            </div>
          </div>
          {/* Name and Ownership Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg">Name</h2>
              <p className="text-gray-400">Hello World!</p>
            </div>
            <div>
              <h2 className="text-lg flex items-center">
                Ownership <span className="ml-2 text-red-500">⚠️</span>
              </h2>
              <p className="text-gray-400">Leave it to us</p>
            </div>
          </div>
          {/* Advanced Options Section */}
          <div className="space-y-4">
            <h2 className="text-lg">Advance options</h2>
            <div>
              <h3 className="flex items-center">
                Cache Control <span className="ml-2 text-red-500">⚠️</span>
              </h3>
              <p className="text-gray-400">1 Day</p>
            </div>
            <div>
              <h3 className="flex items-center">
                Route <span className="ml-2 text-red-500">⚠️</span>
              </h3>
              <p className="text-gray-400">/* to /index.html</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditWebsite;