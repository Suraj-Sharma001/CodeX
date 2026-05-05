'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  LayoutDashboard,
  BookOpen,
  RotateCcw,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/problems', label: 'Problems', icon: BookOpen },
    { href: '/revisions', label: 'Revisions', icon: RotateCcw },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white dark:bg-gray-950 flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
          {/* Logo */}
          <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900 dark:text-white">
              CodeX
            </Link>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {user?.username}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-2">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="md"
              className="w-full justify-start gap-3"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
