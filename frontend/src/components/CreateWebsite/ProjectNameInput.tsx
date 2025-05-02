import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import React from "react";

interface ProjectNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}

const ProjectNameInput: React.FC<ProjectNameInputProps> = ({ value, onChange, id = "name" }) => (
  <section>
    <Label htmlFor={id} className="text-lg font-semibold block mb-4 bg-gradient-to-r ">
      Name
    </Label>
    <Input
      id={id}
      value={value}
      onChange={onChange}
      className="bg-[#2a2a2a] border-gray-700 rounded-md h-10 transition-all duration-300 focus:border-[#e94057] focus:ring-[#e94057]"
    />
  </section>
);

export default ProjectNameInput; 