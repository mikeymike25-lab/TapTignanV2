import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePaymentStore } from '@/features/payment/usePaymentStore';
import { useReportStore } from '@/features/reports/useReportStore';

interface SettingsStore {
  demoMode: boolean;
  protectionEnabled: boolean;
  toggleDemoMode: () => void;
  toggleProtection: () => void;
  resetDemoData: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      demoMode: true,
      protectionEnabled: true,
      toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),
      toggleProtection: () => set((state) => ({ protectionEnabled: !state.protectionEnabled })),
      resetDemoData: async () => {
        useReportStore.getState().clearReports();
        usePaymentStore.getState().clearTransactions();
        usePaymentStore.getState().resetFlow();
        set({ demoMode: true, protectionEnabled: true });
      },
    }),
    {
      name: 'taptignan-settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
