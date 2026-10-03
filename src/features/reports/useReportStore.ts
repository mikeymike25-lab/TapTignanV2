import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, ReportReason } from '@/types';
import { generateReportId } from './reportId';

interface ReportStore {
  reports: Report[];
  createReport: (params: {
    reason: ReportReason;
    details?: string;
    paymentId?: string;
    rawQr?: string;
    recipientName?: string;
  }) => Report;
  resolveReport: (id: string) => void;
  getReportedQrs: () => string[];
  clearReports: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: [],
      createReport: (params) => {
        const newReport: Report = {
          id: generateReportId(),
          reason: params.reason,
          details: params.details,
          paymentId: params.paymentId,
          rawQr: params.rawQr,
          recipientName: params.recipientName,
          status: 'under_review',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ reports: [newReport, ...state.reports] }));
        return newReport;
      },
      resolveReport: (id) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === id
              ? { ...r, status: 'resolved', resolvedAt: new Date().toISOString() }
              : r
          ),
        }));
      },
      getReportedQrs: () => {
        return get()
          .reports.map((r) => r.rawQr)
          .filter(Boolean) as string[];
      },
      clearReports: () => {
        set({ reports: [] });
      },
    }),
    {
      name: 'taptignan-reports-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
