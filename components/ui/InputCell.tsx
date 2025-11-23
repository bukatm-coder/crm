import React, { useState, useEffect, useRef } from 'react';

interface Props {
  value: string | number;
  onChange: (val: string | number) => void;
  type?: 'text' | 'date' | 'number' | 'phone' | 'money';
  placeholder?: string;
  warning?: boolean;
}

export const InputCell: React.FC<Props> = ({ value, onChange, type = 'text', placeholder, warning }) => {
  const [localValue, setLocalValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const commitChange = () => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const formatDisplay = (val: string | number) => {
    if (type === 'money') {
      return new Intl.NumberFormat('ru-RU').format(Number(val));
    }
    if (type === 'date' && typeof val === 'string') {
        if (!val) return '';
        try {
            const d = new Date(val);
            if (isNaN(d.getTime())) return val;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = String(d.getFullYear()).slice(-2);
            return `${day}.${month}.${year}`;
        } catch { return val; }
    }
    return val;
  };

  const getInputValue = () => {
    if (type === 'date' && typeof localValue === 'string') {
      return localValue.split('T')[0];
    }
    return localValue;
  };

  return (
    <div 
      className={`w-full h-full min-h-[32px] flex items-center px-2 cursor-text rounded transition-colors ${
        warning ? 'bg-red-50 text-red-600 border border-red-200' : 'hover:bg-gray-50'
      }`}
      onClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          autoFocus
          className="w-full bg-white border-blue-500 border rounded px-1 outline-none text-sm"
          type={type === 'date' ? 'date' : type === 'number' || type === 'money' ? 'number' : 'text'}
          value={getInputValue()}
          onChange={(e) => {
            const val = type === 'number' || type === 'money' ? Number(e.target.value) : e.target.value;
            setLocalValue(val);
          }}
          onBlur={commitChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      ) : (
        <span className={`text-sm truncate w-full ${!localValue && 'text-gray-300'}`}>
          {localValue ? formatDisplay(localValue) : placeholder || '-'}
        </span>
      )}
    </div>
  );
};