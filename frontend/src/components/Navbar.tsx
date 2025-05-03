import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Blocks, Wallet, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', to: '/' },
    { name: 'Dashboard', to: '/dashboard' },
    { name: 'How to use', to: '/guide' },
    { name: 'About', to: '/about' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out
          ${isScrolled
            ? 'bg-gradient-to-r from-primary-800 via-primary-900 to-primary-800 backdrop-blur-xl border-b-2 border-secondary-400/30 rounded-b-2xl shadow-lg shadow-primary-900/10'
            : 'bg-transparent'
          }`}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link to="/" className="flex items-center space-x-2">
                <Blocks className="w-8 h-8 text-secondary-500" />
                <span className="text-xl font-bold bg-gradient-to-r from-secondary-400 to-secondary-600 bg-clip-text text-transparent">
                  Ivory
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {/* Nav Links */}
              <div className="flex space-x-6">
                {navItems.map((item, index) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`relative group transition-colors ${isActivePath(item.to) ? 'text-white font-semibold' : 'text-secondary-200 hover:text-white font-medium'
                      }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      {item.name}
                      <span
                        className={`absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-secondary-400 to-secondary-600 transform transition-transform ${isActivePath(item.to) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                          }`}
                      />
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Connect Wallet Button */}
              <motion.button
                className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-white hover:shadow-lg hover:shadow-secondary-500/20 transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-4 h-4 text-black" />
                <span className='text-black font-bold'>Connect Wallet</span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-secondary-200 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.div
              className="absolute right-0 top-0 h-full w-64 bg-gray-900/95 shadow-lg shadow-secondary-500/10"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <div className="p-6 space-y-6">
                {navItems.map((item, index) => (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`block py-2 transition-colors ${isActivePath(item.to)
                      ? 'text-white font-medium bg-gradient-to-r from-secondary-400/10 to-secondary-600/10 rounded-lg px-3'
                      : 'text-secondary-200 hover:text-white'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
                <motion.button
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-white"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
