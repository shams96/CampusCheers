import React from 'react';

export interface InputFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  maxLength,
  autoFocus,
  disabled,
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        disabled={disabled}
        className="w-full px-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-hype-blue-500 focus:border-hype-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
};
