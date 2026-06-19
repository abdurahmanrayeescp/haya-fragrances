import { create } from 'zustand';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AdminState {
  adminToken: string | null;
  adminUser: AdminUser | null;
  isAdminAuthenticated: boolean;
  adminLogin: (token: string, user: AdminUser) => void;
  adminLogout: () => void;
}

/**
 * Completely separate store from the customer useAuthStore.
 * Uses its own localStorage keys (haya_admin_token / haya_admin_user)
 * so admin sessions never interfere with customer shopping sessions.
 */
export const useAdminStore = create<AdminState>((set) => {
  const isClient = typeof window !== 'undefined';
  const savedToken = isClient ? localStorage.getItem('haya_admin_token') : null;
  const savedUser = isClient ? localStorage.getItem('haya_admin_user') : null;

  return {
    adminToken: savedToken,
    adminUser: savedUser ? JSON.parse(savedUser) : null,
    isAdminAuthenticated: !!savedToken,

    adminLogin: (token, user) => {
      if (isClient) {
        localStorage.setItem('haya_admin_token', token);
        localStorage.setItem('haya_admin_user', JSON.stringify(user));
      }
      set({ adminToken: token, adminUser: user, isAdminAuthenticated: true });
    },

    adminLogout: () => {
      if (isClient) {
        localStorage.removeItem('haya_admin_token');
        localStorage.removeItem('haya_admin_user');
      }
      set({ adminToken: null, adminUser: null, isAdminAuthenticated: false });
    },
  };
});
