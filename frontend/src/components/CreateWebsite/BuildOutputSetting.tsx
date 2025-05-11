import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button";
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import { Input } from "@/components/ui/input"
import { HelpCircle } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { buildOutputSettingsType } from '@/types/CreateWebstie/types'
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"


interface BuildOutputSettingProps {
  showBuildOutputSettings: boolean
  setShowBuildOutputSettings: (show: boolean) => void
  buildOutputSettings: buildOutputSettingsType
  setBuildOutputSettings: (settings: buildOutputSettingsType) => void
}

const BuildOutputSetting: React.FC<BuildOutputSettingProps> = ({ showBuildOutputSettings, setShowBuildOutputSettings, buildOutputSettings, setBuildOutputSettings }) => {
  const intl = useIntl();

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
            <FormattedMessage id="createWebsite.buildAndOutputSettings" />
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

              <section className='px-2 mt-6'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.installCommand" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.installCommandTooltip" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={buildOutputSettings.installCommand}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, installCommand: e.target.value })}
                  placeholder={intl.formatMessage({ id: 'createWebsite.installCommandPlaceholder' })}
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.buildCommand" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.buildCommandTooltip" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={buildOutputSettings.buildCommand}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, buildCommand: e.target.value })}
                  placeholder={intl.formatMessage({ id: 'createWebsite.buildCommandPlaceholder' })}
                  className="bg-primary-500 border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-secondary-500 focus:ring-secondary-500"
                />
              </section>

              <section className='px-2 mb-4'>
                <div className="flex items-center mb-2">
                  <h3 className="text-sm text-gray-300 font-semibold">
                    <FormattedMessage id="createWebsite.outputDirectory" />
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-5 w-5 text-secondary-500 ml-2 hover:text-secondary-700 transition-colors cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className='w-[260px]' side="right">
                      <FormattedMessage id="createWebsite.outputDirectoryTooltip" />
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  value={buildOutputSettings.outputDirectory}
                  onChange={(e) => setBuildOutputSettings({ ...buildOutputSettings, outputDirectory: e.target.value })}
                  placeholder={intl.formatMessage({ id: 'createWebsite.outputDirectoryPlaceholder' })}
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
