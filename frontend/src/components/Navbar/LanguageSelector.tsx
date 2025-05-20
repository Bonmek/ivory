import 'flag-icons/css/flag-icons.css'
import { useLanguage } from '@/context/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const languages = [
  {
    code: 'en-US',
    flag: 'us',
    name: 'English'
  },
  {
    code: 'zh-CN',
    flag: 'cn',
    name: '中文'
  }
]

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLang = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-primary-800/80 hover:bg-primary-700/80 rounded-lg shadow-md transition-all duration-200 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className={`fi fi-${currentLang.flag} text-xl`}></span>
        <span className="text-[10px] font-medium text-gray-200">{currentLang.flag.toUpperCase()}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 cursor-pointer"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute right-0 mt-2 w-24 rounded-lg bg-primary-800/95 shadow-lg overflow-hidden z-50"
            >
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center justify-center py-2.5 hover:bg-primary-700/50 transition-all duration-200 cursor-pointer ${
                    language === lang.code ? 'bg-primary-700/50' : ''
                  }`}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300 }
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <motion.span 
                      className={`fi fi-${lang.flag} text-xl`}
                      whileHover={{ 
                        scale: 1.2,
                        transition: { type: "spring", stiffness: 400 }
                      }}
                    ></motion.span>
                    <span className="text-[10px] font-medium text-gray-200">{lang.flag.toUpperCase()}</span>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}