'use client';

interface SimpleTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

export default function SimpleTextArea({
  value,
  onChange,
  placeholder = 'Write here...',
  rows = 4,
  maxLength,
  disabled = false,
  className = ''
}: SimpleTextAreaProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical text-gray-900 placeholder:text-gray-400 ${className}`}
    />
  );
}
