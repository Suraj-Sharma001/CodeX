'use client';

import React from 'react';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Select({
  label,
  error,
  icon,
  className,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            {icon}
          </div>
        )}
        <select
          className={clsx(
            'w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors duration-200',
            icon && 'pl-10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          {...props}
        />
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
