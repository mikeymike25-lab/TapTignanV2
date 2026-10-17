import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Report, ReportReason } from '@/types';
import { generateReportId } from './reportId';

const INITIAL_COMMUNITY_REPORTS: Report[] = [
  {
    id: 'TT-2026-00042',
    reason: 'wrong_recipient_name',
    recipientName: 'Juana Fake (Pasted Sticker)',
    rawQr: 'TAPTIGNAN:PAY:SCAM-9901:Juana Fake:350.00',
    accountId: 'SCAM-9901',
    details: 'Physical QR sticker pasted over official cashier terminal at MRT-3 Shaw.',
    status: 'resolved',
    createdAt: '2026-10-14T08:15:00.000Z',
    resolvedAt: '2026-10-14T09:30:00.000Z',
  },
];

interface ReportStore {
  reports: Report[];
  createReport: (params: {
    reason: ReportReason;
    details?: string;
    paymentId?: string;
    rawQr?: string;
    accountId?: string;
    recipientName?: string;
  }) => Report;
  resolveReport: (id: string) => void;
  getReportedQrs: () => string[];
  clearReports: () => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      reports: INITIAL_COMMUNITY_REPORTS,
      createReport: (params) => {
        const newReport: Report = {
          id: generateReportId(),
          reason: params.reason,
          details: params.details,
          paymentId: params.paymentId,
          rawQr: params.rawQr,
          accountId: params.accountId,
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
        const reportedSet = new Set<string>();
        // Hard-block known community threat identifiers
        reportedSet.add('TAPTIGNAN:PAY:SCAM-9901:Juana Fake:350.00');
        reportedSet.add('SCAM-9901');

        get().reports.forEach((r) => {
          if (r.rawQr) reportedSet.add(r.rawQr);
          if (r.accountId) reportedSet.add(r.accountId);
        });
        return Array.from(reportedSet);
      },
      clearReports: () => {
        set({ reports: INITIAL_COMMUNITY_REPORTS });
      },
    }),
    {
      name: 'taptignan-reports-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
