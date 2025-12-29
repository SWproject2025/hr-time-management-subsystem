import React from 'react';

interface Props {
  value: 'employee' | 'hr' | 'manager';
  onChange: (value: Props['value']) => void;
}

export default function InitiatorSelector({ value, onChange }: Props) {
  const options: Props['value'][] = ['employee', 'hr', 'manager'];

  return (
    <div className="flex gap-4">
      {options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded border ${
            value === opt
              ? 'border-blue-600 bg-blue-50'
              : 'border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="initiator"
            checked={value === opt}
            onChange={() => onChange(opt)}
          />
          <span className="capitalize text-sm">{opt}</span>
        </label>
      ))}
    </div>
  );
}
