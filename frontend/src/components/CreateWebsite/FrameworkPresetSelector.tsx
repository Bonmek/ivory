import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import React from "react";
import { cn } from "@/lib/utils";
import { buildOutputSettingsType } from "@/types/CreateWebstie/types";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { HelpCircle } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';

interface Framework {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface FrameworkPresetSelectorProps {
  frameworks: Framework[];
  selectedFramework: string | null;
  handleSelectFramework: (id: string) => void;
  setShowBuildOutputSettings: (show: boolean) => void;
  setBuildOutputSettings: (settings: buildOutputSettingsType) => void;
}

const FrameworkPresetSelector: React.FC<FrameworkPresetSelectorProps> = ({ frameworks, selectedFramework, handleSelectFramework, setShowBuildOutputSettings, setBuildOutputSettings }) => {
  const intl = useIntl();

  const onSelectFramework = async (frameworkId: string) => {
    switch (frameworkId) {
      case 'none':
        handleSelectFramework(frameworkId);
        setShowBuildOutputSettings(false);
        break;
      case 'next':
        handleSelectFramework(frameworkId);
        setShowBuildOutputSettings(true);
        setBuildOutputSettings({
          buildCommand: 'npm run build',
          installCommand: 'npm install',
          outputDirectory: 'out',
        });
        break;
      case 'react':
        handleSelectFramework(frameworkId);
        setShowBuildOutputSettings(true);
        setBuildOutputSettings({
          buildCommand: 'npm run build',
          installCommand: 'npm install',
          outputDirectory: 'dist',
        });
        break;
      case 'angular':
        handleSelectFramework(frameworkId);
        setShowBuildOutputSettings(true);
        setBuildOutputSettings({
          buildCommand: 'npm run build',
          installCommand: 'npm install',
          outputDirectory: 'dist/demo/browser',
        });
        break;
      default:
        break;
    }
  };

  return (
    <article className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-300">
          <FormattedMessage id="createWebsite.selectFrameworkPreset" />
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-secondary-500 hover:text-secondary-700 transition-colors cursor-help" />
          </TooltipTrigger>
          <TooltipContent className='w-[260px]' side="right">
            <FormattedMessage id="createWebsite.frameworkPresetTooltip" />
          </TooltipContent>
        </Tooltip>
      </div>
      <Select
        value={selectedFramework ?? 'none'}
        onValueChange={(frameworkId) => {
          onSelectFramework(frameworkId);
        }}
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
    </article >
  );
}

export default FrameworkPresetSelector; 