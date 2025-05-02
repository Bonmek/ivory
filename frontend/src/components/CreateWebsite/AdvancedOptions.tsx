import { motion } from 'framer-motion'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ChevronDown, HelpCircle, HelpCircleIcon, Plus } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { advancedOptionsType } from '@/types/CreateWebstie/types'
import { CacheControl } from '@/types/CreateWebstie/enums'

interface AdvancedOptionsProps {
  advancedOptions: advancedOptionsType
  setAdvancedOptions: (options: advancedOptionsType) => void
}

function AdvancedOptions({ advancedOptions, setAdvancedOptions }: AdvancedOptionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Collapsible className="w-full bg-primary-700/70  backdrop-blur-3xl shadow-lg p-2 px-4 rounded-xl">
        <div className="flex items-center justify-between px-2 ">
          <h2 className="font-semibold bg-gradient-to-r text-base text-white ">Advanced options</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-2 hover:text-secondary-500 transition-colors">
              <ChevronDown className="h-5 w-5" />
            </Button>
          </CollapsibleTrigger>
        </div>


        <CollapsibleContent className="space-y-6">
          <section className='px-2 mt-4 border-t border-gray-800'>
            <div className="flex items-center mt-4 mb-2">
              <h3 className="text-sm text-gray-300  font-semibold">Cache Control</h3>
              <HelpCircleIcon className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
            </div>
            <Select onValueChange={(value) => setAdvancedOptions({ ...advancedOptions, cacheControl: value as CacheControl })}>
              <SelectTrigger className="bg-primary-500 border-gray-700 rounded-md h-12 transition-all duration-300 hover:border-secondary-500">
                <SelectValue placeholder="Select cache control" />
              </SelectTrigger>
              <SelectContent className="bg-primary-500">
                <SelectItem value={CacheControl.NoCache}>No Cache</SelectItem>
                <SelectItem value={CacheControl.Public}>Public</SelectItem>
                <SelectItem value={CacheControl.Private}>Private</SelectItem>
              </SelectContent>
            </Select>
          </section>

          <section className='px-2'>
            <div className="flex items-center mb-2">
              <h3 className="text-sm text-gray-300 font-semibold">Route</h3>
              <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
            </div>
            <div className="flex items-center space-x-2 mb-4">
              <Input
                value={advancedOptions.route[0].name}
                onChange={(e) => setAdvancedOptions({ ...advancedOptions, route: [{ ...advancedOptions.route[0], name: e.target.value }] })}
                className="bg-primary-500 border-gray-700 rounded-md h-8 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500" />
              <span>to</span>
              <Input
                value={advancedOptions.route[0].path}
                onChange={(e) => setAdvancedOptions({ ...advancedOptions, route: [{ ...advancedOptions.route[0], path: e.target.value }] })}
                className="bg-primary-500 border-gray-700 rounded-md h-8 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500" />
              <Button variant="ghost" size="icon" className="rounded-full bg-secondary-500 hover:bg-secondary-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/20">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </section>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  )
}

export default AdvancedOptions
