import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { HelpCircle } from "lucide-react";
import React from "react";
import { Ownership } from "@/types/enums";

interface OwnershipRadioGroupProps {
  value: Ownership;
  onChange: (value: Ownership) => void;
}

const OwnershipRadioGroup: React.FC<OwnershipRadioGroupProps> = ({ value, onChange }) => (
  <section>
    <div className="flex items-center mb-4">
      <h2 className="text-sm text-gray-300 font-semibold bg-gradient-to-r ">Ownership</h2>
      <HelpCircle className="h-5 w-5 text-[#e94057] ml-2 hover:text-[#ff4d6d] transition-colors cursor-help" />
    </div>
    <RadioGroup defaultValue="leave" className="space-y-2" value={value} onValueChange={onChange}>
      <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
        <RadioGroupItem value={Ownership.Leave} id="leave" />
        <Label htmlFor="leave">Leave it to us</Label>
        <span className="text-gray-400 text-sm">(Default)</span>
      </div>
      <div className="flex items-center space-x-2 hover:text-[#e94057] transition-colors">
        <RadioGroupItem value={Ownership.Own} id="own" />
        <Label htmlFor="own">Own it</Label>
      </div>
    </RadioGroup>
  </section>
);

export default OwnershipRadioGroup; 