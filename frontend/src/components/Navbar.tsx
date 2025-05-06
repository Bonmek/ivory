import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Blocks, Wallet, ChevronDown, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import LoginDialog from './LoginDialog';
import { useWalletKit } from '@mysten/wallet-kit';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

const Navbar = () => {
  const { currentAccount, disconnect } = useWalletKit();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState<boolean>(false);
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

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
        className={`fixed inset-x-0 top-0 z-30 transition-all duration-300 ease-in-out
          ${isScrolled
            ? 'bg-gradient-to-r from-primary-800/90 via-primary-900/90 to-primary-800/90 backdrop-blur-xl border-b-2 border-secondary-400/30 rounded-b-2xl shadow-lg shadow-primary-900/10'
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
              <Link to="/" className="flex items-center space-x-2 group">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Blocks className="w-8 h-8 text-secondary-500 group-hover:text-secondary-400 transition-colors duration-300" />
                </motion.div>
                <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-secondary-400 via-secondary-500 to-secondary-600 bg-clip-text text-transparent font-pixel">
                  IVORY
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
                    className={`relative group transition-all duration-300 ${isActivePath(item.to)
                        ? 'text-white font-bold tracking-wide'
                        : 'text-secondary-200 hover:text-white font-medium'
                      }`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="relative"
                    >
                      <span className="relative z-10">{item.name}</span>
                      <motion.span
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-secondary-400 to-secondary-600"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isActivePath(item.to) ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ scaleX: 1 }}
                      />
                      <motion.span
                        className="absolute inset-0 bg-gradient-to-r from-secondary-400/10 to-secondary-600/10 rounded-lg -z-10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActivePath(item.to) ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        whileHover={{ opacity: 1 }}
                      />
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Connect Wallet Button */}
              <motion.button
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-black hover:shadow-lg hover:shadow-secondary-500/20 transition-all duration-300 group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <Wallet className="w-5 h-5 text-black group-hover:text-primary-900 transition-colors duration-300" />
                </motion.div>
                <span className='text-black font-bold tracking-wide group-hover:text-primary-900 transition-colors duration-300'>
                  Connect Wallet
                </span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-secondary-200 hover:text-white transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
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
              className="absolute right-0 top-0 h-full w-72 bg-gradient-to-b from-primary-900/95 to-primary-800/95 shadow-lg shadow-secondary-500/10 backdrop-blur-xl"
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
                    className={`block py-3 transition-all duration-300 ${isActivePath(item.to)
                        ? 'text-white font-bold bg-gradient-to-r from-secondary-400/20 to-secondary-600/20 rounded-lg px-4'
                        : 'text-secondary-200 hover:text-white hover:bg-secondary-500/10 rounded-lg px-4'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <span className="text-lg tracking-wide">{item.name}</span>
                    </motion.div>
                  </Link>
                ))}
                <motion.button
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-secondary-500 to-secondary-600 text-black font-bold tracking-wide hover:shadow-lg hover:shadow-secondary-500/20 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <LoginDialog open={open} setOpen={setOpen} />
    </>

  );
};

export default Navbar;
