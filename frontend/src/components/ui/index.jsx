import React from 'react';
import styles from './ui.module.css';
export { HelpTooltip } from './HelpTooltip';

// Button component with variant support
export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon,
  onClick,
  disabled = false,
  className = '',
  ...props 
}) {
  const variantClass = variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  
  return (
    <button
      className={`${styles.button} ${variantClass} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// Badge component
export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const variantClasses = {
    default: styles.badgeSecondary,
    primary: styles.badgePrimary,
    secondary: styles.badgeSecondary,
    success: styles.badgeSuccess,
    warning: styles.badgeWarning,
    danger: styles.badgeDanger,
    error: styles.badgeDanger,
    info: styles.badgeInfo,
    tier1: styles.badgePrimary,
    tier2: styles.badgePrimary,
    tier3: styles.badgePrimary,
  };
  
  const sizeClasses = {
    sm: styles.badgeSm,
    md: '',
    lg: styles.badgeLg,
  };
  
  const variantClass = variantClasses[variant] || styles.badgeSecondary;
  const sizeClass = sizeClasses[size] || '';
  
  return (
    <span className={`${styles.badge} ${variantClass} ${sizeClass} ${className}`}>
      {children}
    </span>
  );
}

// Card component
export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

// Input component
export function Input({ 
  label, 
  error, 
  type = 'text',
  className = '',
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

export default { Button, Badge, Card, Input };
