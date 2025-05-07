import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronDown, HelpCircle, HelpCircleIcon, Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { advancedOptionsType } from '@/types/CreateWebstie/types'
import { CacheControl } from '@/types/CreateWebstie/enums'
import { useState } from 'react'

interface AdvancedOptionsProps {
  advancedOptions: advancedOptionsType
  setAdvancedOptions: (options: advancedOptionsType) => void
}

function AdvancedOptions({ advancedOptions, setAdvancedOptions }: AdvancedOptionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <section className="w-full bg-primary-700/70  backdrop-blur-3xl shadow-lg p-2 px-4 rounded-xl">
        <div className="flex items-center justify-between px-2 cursor-pointer"
          onClick={() => setIsOpen((prev) => !prev)}>
          <h2 className="font-semibold bg-gradient-to-r text-base text-white ">Advanced options</h2>
          <Button
            variant="link"
            size="sm"
            className="ml-2 hover:bg-primary-700/70 cursor-pointer hover:text-secondary-500 transition-colors"
            aria-expanded={isOpen}
            aria-controls="advanced-options-content"
          >
            <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              id="advanced-options-content"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className='space-y-6'
            >

              <section className='px-2 mt-4 border-t border-gray-800'>
                <div className="flex items-center mt-4 mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">Default Path</h3>
                  <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                </div>
                <Input
                  value={advancedOptions.defaultPath}
                  onChange={(e) => setAdvancedOptions({ ...advancedOptions, defaultPath: e.target.value })}
                  placeholder="/"
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2 mt-4 mb-4'>
                <div className="flex items-center mt-4 mb-2">
                  <h3 className="text-sm text-gray-300  font-semibold">Cache Control</h3>
                  <HelpCircleIcon className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                </div>
                <Select onValueChange={(value) => setAdvancedOptions({ ...advancedOptions, cacheControl: value as CacheControl })}>
                  <SelectTrigger className="bg-primary-500 border-gray-700 rounded-md h-12 transition-all duration-300 hover:border-secondary-500 w-full">
                    <SelectValue placeholder="Select cache control" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary-500">
                    <SelectItem value={CacheControl.NoCache}>No Cache</SelectItem>
                    <SelectItem value={CacheControl.OneDay}>1 Day</SelectItem>
                    <SelectItem value={CacheControl.OneWeek}>1 Week</SelectItem>
                    <SelectItem value={CacheControl.OneMonth}>1 Month</SelectItem>
                    <SelectItem value={CacheControl.OneYear}>1 Year</SelectItem>
                  </SelectContent>
                </Select>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  )
}

export default AdvancedOptions
