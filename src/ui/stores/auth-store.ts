import { create } from 'zustand';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoggingIn: false,
  error: null,

  login: async (username, password) => {
    set({ isLoggingIn: true, error: null });

    try {
      const result = await window.electronAPI.login(username, password);
      if (result.ok && result.user) {
        set({ user: result.user, isAuthenticated: true, isLoggingIn: false });
        return true;
      }
      set({ error: result.error || 'فشل تسجيل الدخول', isLoggingIn: false });
      return false;
    } catch {
      set({ error: 'حدث خطأ في الاتصال', isLoggingIn: false });
      return false;
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, error: null });
  },
}));

export function canViewCost(role: string): boolean {
  return role === 'OWNER' || role === 'ADMIN';
}
