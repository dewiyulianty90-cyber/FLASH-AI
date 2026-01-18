import React from 'react';
import { Icon as LucideIcon } from 'lucide-react';

interface InputLabelProps {
  children: React.ReactNode;
  icon?: LucideIcon;
}

const InputLabel: React.FC<InputLabelProps> = ({ children, icon: Icon }) => (
  <label className="flex items-center gap-2.5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3 ml-1">
    {Icon && <Icon size={14} className="text-purple-600" />} {children}
  </label>
);

export default InputLabel;
