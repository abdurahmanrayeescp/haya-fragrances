'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminStore } from '../../store/useAdminStore';
import AdminSidebar from '../../components/admin/AdminSidebar';

/**
 * Shared layout for all /admin/* routes.
 *
 * - /admin/login  → renders bare (no sidebar)
 * - all other /admin/* routes → renders with the fixed sidebar
 *
 * Auth guard: if the user is not admin-authenticated and they try to access
 * any non-login admin route, they are immediately redirected to /admin/login.
 *
 * Does NOT touch the customer Navbar/Footer or useAuthStore.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname             = usePathname();
  const router               = useRouter();
  const { isAdminAuthenticated } = useAdminStore();

  // Avoid SSR mismatch – localStorage is client-only
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLoginPage = pathname === '/admin/login';

  // Route guard – runs after hydration
  useEffect(() => {
    if (mounted && !isLoginPage && !isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [mounted, isLoginPage, isAdminAuthenticated, router]);

  // ── Login page layout (bare, no sidebar) ──────────────────────────────
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F7]">
        {children}
      </div>
    );
  }

  // ── Loading / redirect pending ─────────────────────────────────────────
  if (!mounted || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Authenticated admin shell (sidebar + main content) ─────────────────
  return (
    <div className="min-h-screen bg-[#0B0B0B] text-[#F5F5F7] flex">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
