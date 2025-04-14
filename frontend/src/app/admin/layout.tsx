'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Smart Canteen</h2>
        </div>
        <nav className="mt-4">
          <Link 
            href="/admin/dashboard" 
            className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/orders" 
            className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Orders
          </Link>
          <Link 
            href="/admin/menu" 
            className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Menu Management
          </Link>
          <Link 
            href="/admin/promotions" 
            className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Promotions
          </Link>
          <Link 
            href="/admin/bulk-orders" 
            className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            Bulk Orders
          </Link>
          <div className="px-4 py-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              className="flex items-center w-full px-2 py-2 text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 rounded"
              onClick={() => {
                document.documentElement.classList.toggle('dark');
              }}
            >
              <svg className="w-5 h-5 mr-2 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
              <svg className="w-5 h-5 mr-2 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
              </svg>
              Toggle Dark Mode
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
} 