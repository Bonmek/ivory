import { useLanguage } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const languages = [
  {
    code: 'en-US',
    flag: '🇺🇸',
    name: 'English'
  },
  {
    code: 'zh-CN',
    flag: '🇨🇳',
    name: '中文'
  },
]

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-800/50 hover:bg-primary-700/50 transition-all duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl transform hover:scale-110 transition-transform duration-200">
          {currentLang.flag}
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 mt-2 w-16 rounded-2xl bg-primary-800/95 border border-secondary-500/20 shadow-lg overflow-hidden z-50"
            >
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-center py-3 hover:bg-primary-700/50 transition-all duration-200 ${
                    language === lang.code ? 'bg-primary-700/50' : ''
                  }`}
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 5,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <motion.span 
                    className="text-2xl"
                    whileHover={{ 
                      scale: 1.3,
                      transition: { type: "spring", stiffness: 400 }
                    }}
                  >
                    {lang.flag}
                  </motion.span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}