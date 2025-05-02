const Navbar: React.FC = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-screen-md border border-gray-700 bg-gray-900/80 py-3 shadow-lg backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg transition-all duration-300">
      <div className="px-4">
        <div className="flex items-center justify-between">
          <div className="flex shrink-0">
            <a aria-current="page" className="flex items-center" href="/">
              <img
                className="h-8 w-auto transition-transform hover:scale-110"
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Logo"
              />
              <p className="ml-2 text-lg font-bold text-white">Ivory</p>
            </a>
          </div>
          <div className="hidden md:flex md:items-center md:justify-center md:gap-6">
            <a
              aria-current="page"
              className="inline-block rounded-lg px-3 py-1 text-sm font-medium text-gray-200 transition-all duration-200 hover:bg-gray-700 hover:text-white"
              href="/"
            >
              Home
            </a>
            <a
              className="inline-block rounded-lg px-3 py-1 text-sm font-medium text-gray-200 transition-all duration-200 hover:bg-gray-700 hover:text-white"
              href="/dashboard"
            >
              Dashboard
            </a>
            <a
              className="inline-block rounded-lg px-3 py-1 text-sm font-medium text-gray-200 transition-all duration-200 hover:bg-gray-700 hover:text-white"
              href="/guide"
            >
              How to use
            </a>
          </div>
          <div className="flex items-center justify-end gap-3">
            <a
              className="hidden sm:inline-flex items-center justify-center rounded-xl bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200 shadow-sm ring-1 ring-gray-600 transition-all duration-150 hover:bg-gray-700 hover:ring-gray-500"
              href="/login"
            >
              Sign In
            </a>
            <a
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
              href="/login"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export { Navbar }
