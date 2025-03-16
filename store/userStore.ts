import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface UserState {
  name: string;
  profileImage: string;
  themeMode: ThemeMode;
  setName: (name: string) => void;
  setProfileImage: (image: string) => void;
  toggleThemeMode: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: 'Utilisateur',
      profileImage: '',
      themeMode: 'light',
      setName: (name: string) => set({ name }),
      setProfileImage: (image: string) => set({ profileImage: image }),
      toggleThemeMode: () => set((state) => ({ 
        themeMode: state.themeMode === 'light' ? 'dark' : 'light' 
      })),
      setThemeMode: (mode: ThemeMode) => set({ themeMode: mode }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
