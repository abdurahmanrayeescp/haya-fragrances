import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if code is running in client browser to load cached credentials
  const isClient = typeof window !== 'undefined';
  const savedToken = isClient ? localStorage.getItem('luxeaura_token') : null;
  const savedUser = isClient ? localStorage.getItem('luxeaura_user') : null;

  return {
    token: savedToken,
    user: savedUser ? JSON.parse(savedUser) : null,
    isAuthenticated: !!savedToken,
    
    login: (token, user) => {
      if (isClient) {
        localStorage.setItem('luxeaura_token', token);
        localStorage.setItem('luxeaura_user', JSON.stringify(user));
      }
      set({ token, user, isAuthenticated: true });
    },
    
    logout: () => {
      if (isClient) {
        localStorage.removeItem('luxeaura_token');
        localStorage.removeItem('luxeaura_user');
      }
      set({ token: null, user: null, isAuthenticated: false });
    },
    
    updateUser: (updatedFields) => {
      set((state) => {
        if (!state.user) return state;
        const newProfile = { ...state.user, ...updatedFields };
        if (isClient) {
          localStorage.setItem('luxeaura_user', JSON.stringify(newProfile));
        }
        return { user: newProfile };
      });
    }
  };
});
