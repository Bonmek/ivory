import ThreeJSBackground from '@/components/ThreeJsBackground'
import React from 'react'

function EditWebsite() {
  return (
    <div className=" text-white">
      <ThreeJSBackground />
      <div className="flex justify-center items-center mb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-3xl">651f0a9f3c2a7d5e8f1c1234</h1>
          <button className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-black px-4 py-2 rounded hover:bg-red-600 flex items-center text-lg">
            <span className="mr-2">✏️</span> Edit
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="">
          {/* Left Sidebar */}
          <div className="w-[600px]">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl flex items-center mb-4">
                Project files <span className="ml-2 text-red-500">⚠️</span>
              </h2>
              <div className="flex space-x-4 my-6">
                <button className="bg-gradient-to-r from-secondary-500 to-secondary-600 text-black px-6 py-3 rounded hover:bg-red-600 text-lg">
                  Upload
                </button>
                <button className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-500 text-lg">
                  Github
                </button>
              </div>
              <div className="flex justify-between items-center border-b border-gray-700 py-3 text-lg">
                <span>Name</span>
                <span>Size</span>
              </div>
              <div className="flex justify-between items-center py-3 text-lg">
                <span>Barcampsongkhla.zip</span>
                <div className="flex items-center">
                  <span className="mr-4">1 GB</span>
                  <button className="text-gray-400 hover:text-white text-xl">✖️</button>
                </div>
              </div>
            </div>
          </div>
          <br></br>

          {/* Right Sidebar */}
          <div className="w-[400px]">
            <div className="space-y-4">
              <div>
                <h2 className="text-lg mb-2">Name</h2>
                <p className="text-gray-400 text-base">Hello World!</p>
              </div>
              <div>
                <h2 className="text-lg flex items-center mb-2">
                  Ownership <span className="ml-2 text-red-500">⚠️</span>
                </h2>
                <p className="text-gray-400 text-base">Leave it to us</p>
              </div>
              <div className="space-y-4 mt-6">
                <h2 className="text-lg mb-2">Advance options</h2>
                <div>
                  <h3 className="text-base flex items-center mb-2">
                    Cache Control <span className="ml-2 text-red-500">⚠️</span>
                  </h3>
                  <p className="text-gray-400 text-base">1 Day</p>
                </div>
                <div>
                  <h3 className="text-base flex items-center mb-2">
                    Route <span className="ml-2 text-red-500">⚠️</span>
                  </h3>
                  <p className="text-gray-400 text-base">/* to /index.html</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditWebsite
