import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormattedMessage } from 'react-intl'

interface DashboardTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabVariants = {
  inactive: {
    opacity: 0.7,
    scale: 0.95,
    y: 0,
  },
  active: {
    opacity: 1,
    scale: 1,
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 15,
    },
  },
}

const backgroundVariants = {
  initial: {
    scale: 0.8,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },
  },
}

const glowVariants = {
  inactive: {
    opacity: 0,
    scale: 1.2,
  },
  active: {
    opacity: [0, 0.5, 0],
    scale: 1.5,
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

const DashboardTabs = ({ activeTab, setActiveTab }: DashboardTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay: 0.2,
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }}
      className="mb-6"
    >
      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 md:w-[500px] bg-primary-900/80 backdrop-blur-sm relative overflow-hidden">
          {/* Animated background glow effect */}
          <motion.div
            className="absolute inset-0 bg-secondary-500/20 blur-2xl rounded-full"
            initial={{ x: -100, opacity: 0 }}
            animate={{
              x: ['-100%', '200%'],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />

          {['all', 'building', 'active', 'failed'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="relative z-10 data-[state=active]:text-black flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 transition-all duration-300 hover:scale-105"
            >
              {activeTab === tab && (
                <>
                  <motion.div
                    className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                    layoutId="tab-background"
                    variants={backgroundVariants}
                    initial="initial"
                    animate="animate"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                  {/* Glow effect for active tab */}
                  <motion.div
                    className="absolute inset-0 bg-secondary-500/40 rounded-md blur-md"
                    variants={glowVariants}
                    initial="inactive"
                    animate="active"
                  />
                </>
              )}
              <motion.span
                variants={tabVariants}
                animate={activeTab === tab ? 'active' : 'inactive'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`${activeTab === tab ? 'text-black font-bold' : 'text-white'} relative`}
              >
                <FormattedMessage id={`dashboard.tabs.${tab}`} />
                {activeTab === tab && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/20"
                    layoutId="tab-underline"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </motion.div>
  )
}

export default DashboardTabs
