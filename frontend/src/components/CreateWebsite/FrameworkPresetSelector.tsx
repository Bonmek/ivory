import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
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
    <div className="text-sm text-gray-300 mb-2">Select a framework preset:</div>
    <Select
      value={selectedFramework ?? undefined}
      onValueChange={handleSelectFramework}
    >
      <SelectTrigger className="w-full py-6">
        <SelectValue placeholder="Select a framework" />
      </SelectTrigger>
      <SelectContent className="bg-primary-900">
        {frameworks.map((framework) => (
          <SelectItem key={framework.id} value={framework.id}>
            <span className="flex items-center gap-2">
              <span className={cn(
                "text-gray-400 transition-colors",
                selectedFramework === framework.id && "text-secondary-500"
              )}>{framework.icon}</span>
              <span className="font-medium">{framework.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </>
);

export default FrameworkPresetSelector; 