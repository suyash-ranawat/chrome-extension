import React, { forwardRef } from 'react';
import classNames from 'classnames';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, fullWidth = false, ...props }, ref) => {
    const inputClasses = classNames(
      'px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500',
      {
        'border-red-300': error,
        'border-gray-300': !error,
        'w-full': fullWidth
      },
      className
    );

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;