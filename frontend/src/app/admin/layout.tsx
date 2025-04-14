import { Geist } from "next/font/google";
import Link from "next/link";

const geist = Geist({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800">Canteen Admin</h2>
        </div>
        <nav className="mt-4">
          <Link 
            href="/admin/dashboard" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/orders" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Orders
          </Link>
          <Link 
            href="/admin/menu" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Menu Management
          </Link>
          <Link 
            href="/admin/promotions" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Promotions
          </Link>
          <Link 
            href="/admin/bulk-orders" 
            className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
          >
            Bulk Orders
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
} 