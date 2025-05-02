import { motion } from "framer-motion";
import React from "react";
import { cn } from "@/lib/utils";

interface Framework {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface FrameworkPresetSelectorProps {
  frameworks: Framework[];
  selectedFramework: string | null;
  handleSelectFramework: (id: string) => void;
}

const FrameworkPresetSelector: React.FC<FrameworkPresetSelectorProps> = ({ frameworks, selectedFramework, handleSelectFramework }) => (
  <>
    <div className="text-sm text-gray-300 mb-3">Select a framework preset:</div>
    <div className="grid grid-cols-1 gap-2">
      {frameworks.map((framework) => (
        <motion.div
          key={framework.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSelectFramework(framework.id)}
          className={cn(
            "p-3 rounded-md border transition-all cursor-pointer",
            selectedFramework === framework.id
              ? "border-secondary-500 bg-primary-500"
              : "border-gray-800 hover:border-gray-700 hover:bg-primary-500"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "text-gray-400 transition-colors",
              selectedFramework === framework.id && "text-secondary-500"
            )}>
              {framework.icon}
            </div>
            <div>
              <div className="font-medium">{framework.name}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </>
);

export default FrameworkPresetSelector; 