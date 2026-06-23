'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAdminStore } from '../../store/useAdminStore';
import { useTranslation } from '../../store/useI18nStore';
import { LanguageSwitcher } from '../LanguageSwitcher';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  LogOut,
  Shield,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',  href: '/admin',          icon: LayoutDashboard },
  { key: 'products',   href: '/admin/products', icon: Package         },
  { key: 'orders',     href: '/admin/orders',   icon: ShoppingBag     },
  { key: 'users',      href: '/admin/users',    icon: Users           },
  { key: 'coupons',    href: '/admin/coupons',  icon: Tag             },
];

export default function AdminSidebar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { adminLogout, adminUser } = useAdminStore();
  const { t } = useTranslation();

  const handleLogout = () => {
    adminLogout();
    router.push('/admin/login');
  };

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-[#0D0D0F] border-r border-[#D4AF37]/20 flex flex-col z-40 overflow-hidden">
      {/* ── Brand header ─────────────────────────────── */}
      <div className="px-5 py-6 border-b border-[#1F1F23] flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37]/25 to-[#AA7C11]/15 border border-[#D4AF37]/30 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] tracking-[0.22em] text-[#D4AF37] font-bold uppercase leading-none">
              Haya Admin
            </p>
            <p className="text-white text-sm font-semibold mt-0.5 truncate">
              {adminUser?.name ?? 'Administrator'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────── */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] tracking-[0.18em] text-[#AEAEB2]/50 uppercase font-bold px-3 mb-3">
          Navigation
        </p>

        {NAV_ITEMS.map(({ key, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <button
              key={href}
              id={`admin-nav-${key}`}
              onClick={() => router.push(href)}
              className={`w-full group flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 ${
                active
                  ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/25 shadow-sm'
                  : 'text-[#8E8E93] hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors duration-200 ${
                  active ? 'text-[#D4AF37]' : 'text-[#8E8E93] group-hover:text-white'
                }`}
              />
              <span className="flex-1 text-left">{t(`admin.${key}`)}</span>
              {active && (
                <ChevronRight className="w-3 h-3 text-[#D4AF37] opacity-80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Footer / Logout ──────────────────────────── */}
      <div className="px-3 py-4 border-t border-[#1F1F23] flex-shrink-0 space-y-2">
        <div className="flex justify-center py-1">
          <LanguageSwitcher />
        </div>
        {adminUser?.email && (
          <div className="px-3 py-2 rounded-lg bg-[#1F1F23]/60">
            <p className="text-[9px] text-[#AEAEB2]/60 tracking-widest uppercase leading-none">
              Signed in as
            </p>
            <p className="text-white text-xs font-semibold truncate mt-1">
              {adminUser.email}
            </p>
          </div>
        )}
        <button
          id="admin-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#FF453A]/70 hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('admin.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
