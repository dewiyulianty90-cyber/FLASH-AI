import React from 'react';
import { Check, Plus, Icon as LucideIcon } from 'lucide-react';
import InputLabel from './InputLabel';

interface MultiChipFieldProps {
  id: string;
  options: string[];
  label: string;
  icon?: LucideIcon;
  selectedValues: string[];
  onToggle: (id: string, value: string) => void;
  max?: number;
}

const MultiChipField: React.FC<MultiChipFieldProps> = ({ 
  id, options, label, icon, selectedValues, onToggle, max = 5 
}) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <InputLabel icon={icon}>{label}</InputLabel>
        <span className="text-[9px] font-bold text-gray-400">{(selectedValues || []).length}/{max}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const isSelected = Array.isArray(selectedValues) && selectedValues.includes(opt);
          return (
            <button 
              key={opt} 
              type="button" 
              onClick={() => onToggle(id, opt)} 
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border flex items-center gap-2 ${isSelected ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white text-gray-500 border-gray-100 hover:border-purple-200'}`}
            >
              {isSelected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={3} />} {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MultiChipField;
