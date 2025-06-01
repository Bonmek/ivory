import { motion } from 'framer-motion'
import { Blocks, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormattedMessage } from 'react-intl'

interface EmptyStateProps {
  onReset: () => void
}

const EmptyState = ({ onReset }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-xl border border-secondary-500/20 p-8 text-center mt-8 bg-primary-900/50"
    >
      {/* Icon */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Blocks className="h-12 w-12 text-secondary-400 mb-4" />
      </motion.div>

      {/* Content */}
      <div className="max-w-[280px]">
        <h3 className="text-lg font-medium text-white mb-2">
          <FormattedMessage id="dashboard.empty.title" />
        </h3>
        
        <p className="text-sm text-secondary-300/80 mb-6">
          <FormattedMessage id="dashboard.empty.description" />
        </p>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onReset}
            variant="outline"
            className="bg-secondary-500/10 hover:bg-secondary-500/20 text-secondary-400 hover:text-secondary-300 border-secondary-500/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <FormattedMessage id="dashboard.empty.reset" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default EmptyState 