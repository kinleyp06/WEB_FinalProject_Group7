import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    user: { id: number; name: string; email: string; role: string } | null;
    token: string | null;
    setAuth: (user: AuthState['user'], token: string) => void;
    logout: () => void;
}

const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setAuth: (user, token) => set({ user, token }),
            logout: () => set({ user: null, token: null }),
        }),
        { name: 'mess-auth' }
    )
);

export default useAuthStore;