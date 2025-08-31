export interface ButtonProps {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large';
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Is the button disabled? */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  size = 'medium',
  label,
  disabled = false,
  onClick,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'font-bold py-2 px-4 rounded min-h-[44px] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95';
  const sizeClasses = {
    small: 'text-sm px-5 py-2.5', // Increased padding for better touch targets
    medium: 'text-base px-6 py-3', // Increased padding for better touch targets
    large: 'text-lg px-8 py-3.5', // Increased padding for better touch targets
  };
  const primaryClasses = primary
    ? 'bg-hype-blue-500 hover:bg-hype-blue-700 active:bg-hype-blue-800 text-white focus:ring-hype-blue-500'
    : 'bg-transparent hover:bg-cheers-coral-500 active:bg-cheers-coral-600 text-cheers-coral-700 font-semibold hover:text-white border border-cheers-coral-500 hover:border-transparent focus:ring-cheers-coral-500';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type="button"
      className={`${baseClasses} ${sizeClasses[size]} ${primaryClasses} ${disabledClasses} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {label}
    </button>
  );
};
