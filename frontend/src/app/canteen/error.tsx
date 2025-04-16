'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error.message || "An unexpected error occurred"}</p>
        <button
          onClick={() => reset()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 