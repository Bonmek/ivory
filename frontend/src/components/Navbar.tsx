import { motion } from 'framer-motion'
import { useLocation } from 'react-router'

const Navbar: React.FC = () => {
  const location = useLocation()

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (location.pathname === path) {
      e.preventDefault()
    }
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="fixed inset-x-0 top-0 z-30 mx-auto w-full max-w-screen-md border border-gray-700 bg-gray-900/80 py-3 shadow-lg backdrop-blur-lg md:top-6 md:rounded-3xl lg:max-w-screen-lg transition-all duration-300"
    >
      <div className="px-4">
        <div className="flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex shrink-0">
            <a aria-current="page" className="flex items-center" href="/">
              <img
                className="h-8 w-auto transition-transform hover:scale-110"
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                alt="Logo"
              />
              <p className="ml-2 text-lg font-bold text-white">Ivory</p>
            </a>
          </motion.div>
          <div className="hidden md:flex md:items-center md:justify-center md:gap-6">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-current="page"
              className={`inline-block rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-gray-700 text-white cursor-default'
                  : 'text-gray-200 hover:bg-gray-700 hover:text-white'
              }`}
              href="/"
              onClick={(e) => handleClick(e, '/')}
            >
              Home
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-block rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200 ${
                location.pathname === '/dashboard'
                  ? 'bg-gray-700 text-white cursor-default'
                  : 'text-gray-200 hover:bg-gray-700 hover:text-white'
              }`}
              href="/dashboard"
              onClick={(e) => handleClick(e, '/dashboard')}
            >
              Dashboard
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-block rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200 ${
                location.pathname === '/guide'
                  ? 'bg-gray-700 text-white cursor-default'
                  : 'text-gray-200 hover:bg-gray-700 hover:text-white'
              }`}
              href="/guide"
              onClick={(e) => handleClick(e, '/guide')}
            >
              How to use
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`inline-block rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200 ${
                location.pathname === '/about'
                  ? 'bg-gray-700 text-white cursor-default'
                  : 'text-gray-200 hover:bg-gray-700 hover:text-white'
              }`}
              href="/about"
              onClick={(e) => handleClick(e, '/about')}
            >
              About us
            </motion.a>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative flex items-center justify-end"
          >
            <motion.div
              className="absolute inset-0 rounded-xl"
              style={{
                boxShadow:
                  '0 0 10px rgba(239, 68, 68, 0.5), 0 0 15px rgba(59, 130, 246, 0.5), 0 0 20px rgba(147, 51, 234, 0.5), 0 0 25px rgba(34, 197, 94, 0.5)',
              }}
            />
            <a
              className={`relative inline-flex items-center justify-center rounded-xl px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 ${
                location.pathname === '/login'
                  ? 'bg-red-700 cursor-default'
                  : 'bg-red-600 hover:bg-red-500'
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500`}
              href="/login"
              onClick={(e) => handleClick(e, '/login')}
            >
              Login
            </a>
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export { Navbar }
