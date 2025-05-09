import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { HelpCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { buildOutputSettingsType } from '@/types/CreateWebstie/types'


interface BuildOutputSettingProps {
  showBuildOutputSettings: boolean
  setShowBuildOutputSettings: (show: boolean) => void
  buildOutputSettings: buildOutputSettingsType
  setBuildOutputSettings: (settings: buildOutputSettingsType) => void
}

function BuildOutputSetting({ showBuildOutputSettings, setShowBuildOutputSettings, buildOutputSettings, setBuildOutputSettings }: BuildOutputSettingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <article className="w-full bg-primary-700/70  backdrop-blur-3xl shadow-lg p-4 rounded-xl">
        <div className="flex items-center px-2 ">

          <Checkbox
            id="showBuildOutputSettings"
            checked={showBuildOutputSettings}
            onCheckedChange={(checked: boolean) => setShowBuildOutputSettings(checked)}
            className="mr-4 border-white/60 cursor-pointer"
          />
          <Label htmlFor="showBuildOutputSettings" className="font-semibold text-base text-white cursor-pointer select-none">
            Build and Output settings
          </Label>
        </div>
        <AnimatePresence initial={false}>
          {showBuildOutputSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className='space-y-6'
            >
              <section className='px-2 mt-4 border-t border-gray-800'>
                <div className="flex items-center mt-4 mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">Root Directory</h3>
                  <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                </div>
                <Input
                  value={buildOutputSettings.rootDirectory}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, rootDirectory: e.target.value })}
                  placeholder="/"
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">Build Command</h3>
                  <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                </div>
                <Input
                  value={buildOutputSettings.buildCommand}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, buildCommand: e.target.value })}
                  placeholder="npm run build"
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2 mb-4'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">Output Directory</h3>
                  <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                </div>
                <Input
                  value={buildOutputSettings.outputDirectory}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, outputDirectory: e.target.value })}
                  placeholder="dist"
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </motion.div >
  )
}

export default BuildOutputSetting


