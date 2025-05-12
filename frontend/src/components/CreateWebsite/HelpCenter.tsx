import { motion } from 'framer-motion'
import { Archive, HelpCircle, Package, Settings2, SlidersHorizontal } from 'lucide-react'
import { FormattedMessage } from 'react-intl'

function HelpCenter() {
  return (
    <motion.article
      id="help-center"
      className="relative flex items-center bg-gradient-to-br from-[#10151c]/80 to-[#10151c]/60 mt-8 p-8 rounded-2xl shadow-2xl backdrop-blur-xl border border-primary-500/40 hover:border-primary-400/60 transition-all duration-500 glow-effect w-full"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <section className="space-y-8 w-full">
        <motion.div
          className="absolute inset-0 rounded-2xl -z-10 animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-4">
            <HelpCircle className="lg:h-10 lg:w-10 h-6 w-6 text-yellow-400" />
            <div>
              <h1 className="lg:text-2xl text-xl font-bold gradient-text font-pixel">
                <FormattedMessage id="createWebsite.helpCenter" />
              </h1>
              <p className="max-w-lg:hidden text-sm text-gray-400 font-pixel">
                <FormattedMessage id="createWebsite.helpCenterDescription" />
              </p>
            </div>
          </div>

        </motion.div>

        <div className="space-y-6">
          {[
            {
              title: <FormattedMessage id="createWebsite.projectFiles" />,
              description: <FormattedMessage id="createWebsite.projectFilesTooltip" />,
              icon: <Archive className="lg:w-6 lg:h-6 w-4 h-4 text-secondary-300 group-hover:text-secondary-200" aria-label="Project Files" />
            },
            {
              title: <FormattedMessage id="createWebsite.frameworkPreset" />,
              description: <FormattedMessage id="createWebsite.frameworkPresetTooltip" />,
              icon: <SlidersHorizontal className="lg:w-6 lg:h-6 w-4 h-4 text-secondary-300 group-hover:text-secondary-200" aria-label="Framework Presets" id="build-output-setting" />
            },
            {
              title: <FormattedMessage id="createWebsite.buildAndOutputSettings" />,
              icon: <Package className="lg:w-6 lg:h-6 w-4 h-4 text-secondary-300 group-hover:text-secondary-200" aria-label="Build Output Settings" />,
              children: (
                <section className="space-y-4 border-l-2 border-secondary-500/30">
                  <div className="pl-4">
                    <h4 className="text-lg font-semibold text-primary-100 mb-1">
                      <FormattedMessage id="createWebsite.installCommand" />
                    </h4>
                    <p className="text-sm text-secondary-300" >
                      <FormattedMessage id="createWebsite.installCommandTooltip" />
                    </p>
                  </div>
                  <div className="pl-4">
                    <h4 className="text-lg font-semibold text-primary-100 mb-1">
                      <FormattedMessage id="createWebsite.buildCommand" />
                    </h4>
                    <p className="text-sm text-secondary-300">
                      <FormattedMessage id="createWebsite.buildCommandTooltip" />
                    </p>
                  </div>
                  <div className="pl-4">
                    <h4 className="text-lg font-semibold text-primary-100 mb-1">
                      <FormattedMessage id="createWebsite.outputDirectory" />
                    </h4>
                    <p className="text-sm text-secondary-300" id="advanced-options">
                      <FormattedMessage id="createWebsite.outputDirectoryTooltip" />
                    </p>
                  </div>
                </section>
              )
            },
            {
              title: <FormattedMessage id="createWebsite.advancedOptions" />,
              icon: <Settings2 className="lg:w-6 lg:h-6 w-4 h-4 text-secondary-300 group-hover:text-secondary-200" aria-label="Advanced Options" />,
              children: (
                <section className="space-y-4 border-l-2 border-secondary-500/30">
                  <div className="pl-4">
                    <h4 className="text-lg font-semibold text-primary-100 mb-1">
                      <FormattedMessage id="createWebsite.rootDirectory" />
                    </h4>
                    <p className="text-sm text-secondary-300">
                      <FormattedMessage id="createWebsite.rootDirectoryTooltip" />
                    </p>
                  </div>
                  <div className="pl-4">
                    <h4 className="text-lg font-semibold text-primary-100 mb-1">
                      <FormattedMessage id="createWebsite.defaultPath" />
                    </h4>
                    <p className="text-sm text-secondary-300">
                      <FormattedMessage id="createWebsite.defaultPathTooltip" />
                    </p>
                  </div>
                  <div className="pl-4">
                    <h4 className="text-lg font-semibold text-primary-100 mb-1">
                      <FormattedMessage id="createWebsite.cacheControl" />
                    </h4>
                    <p className="text-sm text-secondary-300" >
                      <FormattedMessage id="createWebsite.cacheControlTooltip" />
                    </p>
                  </div>
                </section>
              )
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 * index, duration: 0.5, ease: 'easeOut' }}
              className="p-6 bg-[#10151c]/30 rounded-xl border border-primary-600/30 hover:border-primary-500/50 transition-all duration-300 group relative overflow-hidden transform hover:scale-[1.03] hover:shadow-xl focus-within:shadow-xl focus-within:scale-[1.03] outline-none hover:bg-primary-700/30"
              tabIndex={0}
              aria-labelledby={`help-title-${index}`}
              aria-describedby={`help-desc-${index}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-secondary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute top-4 left-4 bg-secondary-600 text-secondary-50 rounded-full w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center font-bold text-xs shadow-lg z-20 border-2 border-primary-800 ring-2 ring-primary-900/50" aria-label={`Step ${index + 1}`}>{index + 1}</span>
              <div className="flex items-start gap-4 relative z-10">
                <div className="flex-shrink-0">
                  <div className="lg:w-14 lg:h-14 w-10 h-10 rounded-full bg-secondary-500/20 flex items-center justify-center group-hover:bg-secondary-400/30 transition-all duration-300 hover:scale-110">
                    {item.icon}
                  </div>
                </div>
                <div>
                  <h3 id={`help-title-${index}`} className="lg:text-xl text-lg font-semibold text-gray-100 mb-3 group-hover:gradient-text transition-all duration-300">
                    {item.title}
                  </h3>
                  <p id={`help-desc-${index}`} className="text-sm text-secondary-300 leading-relaxed mb-4">
                    {item.description}
                  </p>
                  {item.children && (
                    <div className="mt-4">{item.children}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.article>
  )
}

export default HelpCenter
