import React, { useState, useRef, useEffect } from 'react';

interface Props {
  value: string;
  options: string[];
  onChange: (val: string) => void;
  onAddOption: (val: string) => void;
  placeholder?: string;
}

export const SelectCell: React.FC<Props> = ({ value, options, onChange, onAddOption, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (opt: string) => {
    onChange(opt);
    setIsOpen(false);
    setSearch('');
  };

  const handleAddNew = () => {
    if (search.trim()) {
      onAddOption(search.trim());
      handleSelect(search.trim());
    }
  };

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <div 
        className="w-full h-full min-h-[32px] flex items-center px-2 cursor-pointer hover:bg-gray-50 rounded text-sm truncate"
        onClick={() => setIsOpen(!isOpen)}
      >
         {value || <span className="text-gray-300">{placeholder || 'Выбрать'}</span>}
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 top-full mt-1 w-64 bg-white border shadow-xl rounded-md overflow-hidden flex flex-col max-h-64">
          <input 
            autoFocus
            className="p-2 border-b text-sm outline-none" 
            placeholder="Поиск или добавить..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="overflow-y-auto flex-1">
            {filteredOptions.map((opt) => (
              <div 
                key={opt}
                className={`p-2 hover:bg-blue-50 cursor-pointer text-sm ${opt === value ? 'bg-blue-100 font-medium' : ''}`}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </div>
            ))}
            {search && !filteredOptions.includes(search) && (
              <div 
                className="p-2 hover:bg-green-50 cursor-pointer text-sm text-green-600 font-medium border-t"
                onClick={handleAddNew}
              >
                + Добавить "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};