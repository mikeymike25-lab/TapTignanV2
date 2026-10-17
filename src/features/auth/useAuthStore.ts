import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  phone: string;
  maskedPhone: string;
  initials: string;
  deviceModel: string;
}

export const DEFAULT_USER: UserProfile = {
  name: 'Juan Dela Cruz',
  phone: '+63-9958829383',
  maskedPhone: '+63-9958829383',
  initials: 'JD',
  deviceModel: 'This Device (Account Secure)',
};

export const DEMO_ACCOUNTS: UserProfile[] = [
  DEFAULT_USER,
  {
    name: 'Maria Santos',
    phone: '+63 918 987 6543',
    maskedPhone: '+63 918 ••• 6543',
    initials: 'MS',
    deviceModel: 'This Device (Account Secure)',
  },
];

interface AuthState {
  isAuthenticated: boolean;
  registeredMpin: string;
  duressMpin: string;
  isDuressMode: boolean;
  realBalance: number;
  decoyBalance: number;
  inputMpin: string;
  attemptsRemaining: number;
  isLocked: boolean;
  user: UserProfile;
  biometricsEnabled: boolean;

  // Actions
  appendDigit: (digit: string) => string;
  deleteDigit: () => void;
  clearInput: () => void;
  verifyMpin: (pinToVerify?: string) => {
    success: boolean;
    attemptsLeft: number;
    isLocked: boolean;
    isDuress?: boolean;
  };
  authenticateWithBiometrics: () => boolean;
  logout: () => void;
  resetLockout: () => void;
  switchAccount: (account: UserProfile) => void;
  updateMpin: (newMpin: string) => void;
  setDuressMode: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      registeredMpin: '1234',
      duressMpin: '9999',
      isDuressMode: false,
      realBalance: 100367.0,
      decoyBalance: 48.5,
      inputMpin: '',
      attemptsRemaining: 5,
      isLocked: false,
      user: DEFAULT_USER,
      biometricsEnabled: true,

      appendDigit: (digit: string) => {
        const current = get().inputMpin;
        if (current.length >= 4) return current;
        const next = current + digit;
        set({ inputMpin: next });
        return next;
      },

      deleteDigit: () => {
        const current = get().inputMpin;
        if (current.length > 0) {
          set({ inputMpin: current.slice(0, -1) });
        }
      },

      clearInput: () => {
        set({ inputMpin: '' });
      },

      verifyMpin: (pinToVerify?: string) => {
        const state = get();
        const candidate = pinToVerify ?? state.inputMpin;
        const isNormalMatch = candidate === state.registeredMpin;
        const isDuressMatch = candidate === state.duressMpin;

        if (isNormalMatch) {
          set({
            isAuthenticated: true,
            isDuressMode: false,
            inputMpin: '',
            attemptsRemaining: 5,
            isLocked: false,
          });
          return { success: true, attemptsLeft: 5, isLocked: false, isDuress: false };
        }

        if (isDuressMatch) {
          set({
            isAuthenticated: true,
            isDuressMode: true,
            inputMpin: '',
            attemptsRemaining: 5,
            isLocked: false,
          });
          return { success: true, attemptsLeft: 5, isLocked: false, isDuress: true };
        }

        const nextAttempts = Math.max(0, state.attemptsRemaining - 1);
        const locked = nextAttempts === 0;

        set({
          inputMpin: '',
          attemptsRemaining: nextAttempts,
          isLocked: locked,
        });

        return { success: false, attemptsLeft: nextAttempts, isLocked: locked, isDuress: false };
      },

      authenticateWithBiometrics: () => {
        const state = get();
        if (state.isLocked) return false;
        set({
          isAuthenticated: true,
          isDuressMode: false,
          inputMpin: '',
          attemptsRemaining: 5,
          isLocked: false,
        });
        return true;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          isDuressMode: false,
          inputMpin: '',
        });
      },

      resetLockout: () => {
        set({
          attemptsRemaining: 5,
          isLocked: false,
          isDuressMode: false,
          inputMpin: '',
        });
      },

      setDuressMode: (enabled: boolean) => {
        set({ isDuressMode: enabled });
      },

      switchAccount: (account: UserProfile) => {
        set({
          user: account,
          inputMpin: '',
          isAuthenticated: false,
        });
      },

      updateMpin: (newMpin: string) => {
        set({
          registeredMpin: newMpin,
          inputMpin: '',
          attemptsRemaining: 5,
          isLocked: false,
        });
      },
    }),
    {
      name: 'taptignan-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        registeredMpin: state.registeredMpin,
        duressMpin: state.duressMpin,
        isDuressMode: state.isDuressMode,
        attemptsRemaining: state.attemptsRemaining,
        isLocked: state.isLocked,
        user: state.user,
        biometricsEnabled: state.biometricsEnabled,
      }),
    }
  )
);
