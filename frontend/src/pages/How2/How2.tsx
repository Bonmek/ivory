import React from 'react'

function How2() {
  return (
    <div className="bg-gray-900 text-white font-sans min-h-screen flex flex-col">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="text-2xl font-bold">IVORY</div>
        <ul className="flex space-x-6">
          <li>
            <a href="#" className="hover:text-gray-400">
              Home
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-400">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-400">
              How to use
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-400">
              About us
            </a>
          </li>
        </ul>
        <div className="flex space-x-4">
          <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
            Create
          </button>
          <button className="text-gray-400 hover:text-white">🔔</button>
          <button className="text-gray-400 hover:text-white">👤</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex p-8">
        {/* Left Section */}
        <div className="w-3/4 pr-8">
          <h1 id="how-to-launch-website-with-us" className="text-4xl font-bold mb-4">
            How to launch website with us
          </h1>
          <p className="text-gray-400 italic mb-6">
            "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
            consectetur, adipisci velit..." "There is no one who loves pain
            itself, who seeks after it and wants to have it, simply because it
            is pain..."
          </p>

          {/* Video Placeholder - Replaced with YouTube Embed */}
          <div className="h-120 rounded mb-6 relative">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/YmS8WSapXBo?si=pIE37D18TjRBtfKK"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          </div>

          {/* Lorem Ipsum Text */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Lorem Ipsum</h2>
            <p className="text-gray-300">
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Lorem Ipsum</h2>
            <p className="text-gray-300">
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>
          </div>

          <br></br>
          <br></br>
          <br></br>
          <div className="flex justify-between items-center mb-6">
            <h1 id="how-to-bind-sui-ns" className="text-4xl font-bold">How to bind Sui NS</h1>
            <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded">
              Dashboard
            </button>
          </div>
          <p className="text-gray-400 italic mb-6">
            "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
            consectetur, adipisci velit..." "There is no one who loves pain
            itself, who seeks after it and wants to have it, simply because it
            is pain..."
          </p>

          {/* Video Placeholder */}
          <div className="h-120 rounded mb-6 relative">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/czEy7XoeVa0?si=xCJmp2tXK2CEcBTh"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Embedded YouTube Video"
            ></iframe>
          </div>

          {/* Lorem Ipsum Text */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Lorem Ipsum</h2>
            <p className="text-gray-300">
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>
            <h2 className="text-xl font-semibold mt-4 mb-2">Lorem Ipsum</h2>
            <p className="text-gray-300">
              is simply dummy text of the printing and typesetting industry.
              Lorem Ipsum has been the industry's standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-1/4 p-4 border-l border-gray-700 sticky top-0 self-start h-[calc(100vh-72px)] overflow-auto">
          <h3 className="text-lg font-semibold mb-4">On this page</h3>
          <ul className="space-y-2">
            <li>
              <a href="#how-to-launch-website-with-us" className="text-gray-400 hover:underline">
                How to launch website with us
              </a>
            </li>
            <li>
              <a href="#how-to-bind-sui-ns" className="text-gray-400 hover:underline">
                How to bind Siu NS
              </a>
            </li>
          </ul>
          <div className="mt-6 flex items-center">
            <span className="text-gray-400 mr-2">⬆</span>
            <a href="#" className="text-gray-400 hover:underline">
              Back to top
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default How2
