import { motion } from 'framer-motion'
import { Blocks } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  onReset: () => void
}

const EmptyState = ({ onReset }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center rounded-lg border border-secondary-500/20 border-dashed p-8 text-center mt-8 bg-primary-900/50 backdrop-blur-sm"
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        <Blocks className="h-12 w-12 text-secondary-400 mb-4" />
      </motion.div>
      <motion.h3
        className="mt-2 text-lg font-semibold text-white"
        animate={{
          textShadow: [
            '0 0 0px rgba(255, 255, 255, 0)',
            '0 0 10px rgba(255, 255, 255, 0.5)',
            '0 0 0px rgba(255, 255, 255, 0)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      >
        No projects found
      </motion.h3>
      <p className="mb-4 mt-1 text-sm text-secondary-300">
        Try adjusting your search or filter criteria
      </p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={onReset}
          className="bg-secondary-500 hover:bg-secondary-600 text-primary-900"
        >
          Reset Filters
        </Button>
      </motion.div>
    </motion.div>
  )
}

export default EmptyState 