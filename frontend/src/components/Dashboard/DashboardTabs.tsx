import { motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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
        <TabsList className="grid w-full grid-cols-3 md:w-[400px] bg-primary-900/80 backdrop-blur-sm relative">
          <TabsTrigger
            value="all"
            className="relative z-10 data-[state=active]:text-secondary-500"
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
            >
              All Sites
            </motion.span>
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="relative z-10 data-[state=active]:text-secondary-500"
          >
            {activeTab === 'recent' && (
              <motion.div
                className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                layoutId="tab-background"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.span
              variants={tabVariants}
              animate={activeTab === 'recent' ? 'active' : 'inactive'}
              transition={{ duration: 0.2 }}
            >
              Recently Added
            </motion.span>
          </TabsTrigger>
          <TabsTrigger
            value="expiring"
            className="relative z-10 data-[state=active]:text-secondary-500"
          >
            {activeTab === 'expiring' && (
              <motion.div
                className="absolute inset-0 bg-secondary-500 rounded-md -z-10"
                layoutId="tab-background"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <motion.span
              variants={tabVariants}
              animate={activeTab === 'expiring' ? 'active' : 'inactive'}
              transition={{ duration: 0.2 }}
            >
              Expiring Soon
            </motion.span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </motion.div>
  )
}

export default DashboardTabs 