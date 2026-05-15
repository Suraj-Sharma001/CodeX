'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Oops! Something went wrong
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {error.message || 'An unexpected error occurred'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={reset}
            className="w-full"
            variant="primary"
          >
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full"
            variant="secondary"
          >
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
