import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormattedMessage } from 'react-intl'

interface DashboardTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const tabVariants = {
  inactive: { opacity: 0.7 },
  active: { opacity: 1 },
}

const DashboardTabs = ({ activeTab, setActiveTab }: DashboardTabsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.4,
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
        <TabsList className="grid w-full grid-cols-4 md:w-[500px] bg-primary-900/80 backdrop-blur-sm relative">
          <TabsTrigger
            value="all"
            className="relative z-10 data-[state=active]:text-black flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {activeTab === 'all' && (
              <motion.div
                className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                layoutId="tab-background"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.span
              variants={tabVariants}
              animate={activeTab === 'all' ? 'active' : 'inactive'}
              transition={{ duration: 0.2 }}
              className={activeTab === 'all' ? 'text-black' : 'text-white'}
            >
              <FormattedMessage id="dashboard.tabs.all" />
            </motion.span>
          </TabsTrigger>
          <TabsTrigger
            value="building"
            className="relative z-10 data-[state=active]:text-black flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {activeTab === 'building' && (
              <motion.div
                className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                layoutId="tab-background"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.span
              variants={tabVariants}
              animate={activeTab === 'building' ? 'active' : 'inactive'}
              transition={{ duration: 0.2 }}
              className={activeTab === 'building' ? 'text-black' : 'text-white'}
            >
              <FormattedMessage id="dashboard.tabs.building" />
            </motion.span>
          </TabsTrigger>
          <TabsTrigger
            value="active"
            className="relative z-10 data-[state=active]:text-black flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {activeTab === 'active' && (
              <motion.div
                className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                layoutId="tab-background"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.span
              variants={tabVariants}
              animate={activeTab === 'active' ? 'active' : 'inactive'}
              transition={{ duration: 0.2 }}
              className={activeTab === 'active' ? 'text-black' : 'text-white'}
            >
              <FormattedMessage id="dashboard.tabs.active" />
            </motion.span>
          </TabsTrigger>
          <TabsTrigger
            value="failed"
            className="relative z-10 data-[state=active]:text-black flex items-center justify-center gap-1 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {activeTab === 'failed' && (
              <motion.div
                className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                layoutId="tab-background"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.span
              variants={tabVariants}
              animate={activeTab === 'failed' ? 'active' : 'inactive'}
              transition={{ duration: 0.2 }}
              className={activeTab === 'failed' ? 'text-black' : 'text-white'}
            >
              <FormattedMessage id="dashboard.tabs.failed" />
            </motion.span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  )
}

export default DashboardTabs 