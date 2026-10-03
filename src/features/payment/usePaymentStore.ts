import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { findRegistryEntry } from '@/data/mock/registry';
import { parseQr } from '@/features/security/parseQr';
import {
  CheckResult,
  PaymentFlowStatus,
  PaymentRequest,
  Transaction,
} from '@/types';

interface PaymentStore {
  status: PaymentFlowStatus;
  currentRequest: PaymentRequest | null;
  checkResult: CheckResult | null;
  transactions: Transaction[];

  startPaymentFromQr: (rawQr: string, customAmount?: number) => PaymentRequest;
  startPayment: (request: PaymentRequest) => void;
  setChecking: () => void;
  setResult: (result: CheckResult) => void;
  completePayment: () => Transaction | null;
  cancelPayment: () => Transaction | null;
  resetFlow: () => void;
  clearTransactions: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      status: 'idle',
      currentRequest: null,
      checkResult: null,
      transactions: [],

      startPaymentFromQr: (rawQr: string, customAmount?: number) => {
        const qrPayload = parseQr(rawQr);
        const reqId = `PAY-${Date.now().toString(36).toUpperCase()}`;

        let merchantName = 'Cafe Manila Inc.';
        let recipientName = 'Cafe Manila';
        let recipientNumber = '+63 917 123 4567';
        let amount = customAmount ?? qrPayload.amount ?? 850.0;

        if (qrPayload.containsUrl) {
          merchantName = 'Unknown Website / Link';
          recipientName = 'External Link Redirect';
          recipientNumber = '+63 9XX *** XXXX';
          amount = customAmount ?? 500.0;
        } else if (qrPayload.accountId) {
          const entry = findRegistryEntry(qrPayload.accountId);
          if (entry) {
            merchantName = qrPayload.merchantName || entry.name;
            recipientName = entry.registeredName;
            recipientNumber = entry.phoneNumber;
          } else {
            merchantName = qrPayload.merchantName || 'Unregistered Recipient';
            recipientName = qrPayload.merchantName || 'Unregistered Recipient';
            recipientNumber = '+63 999 000 0000';
          }
        }

        const request: PaymentRequest = {
          id: reqId,
          qr: qrPayload,
          merchantName,
          recipientName,
          recipientNumber,
          amount,
          fee: 0.0,
          method: 'GCash Wallet',
          createdAt: new Date().toISOString(),
        };

        set({
          status: 'pending_confirm',
          currentRequest: request,
          checkResult: null,
        });

        return request;
      },

      startPayment: (request: PaymentRequest) => {
        set({
          status: 'pending_confirm',
          currentRequest: request,
          checkResult: null,
        });
      },

      setChecking: () => {
        set({ status: 'checking' });
      },

      setResult: (result: CheckResult) => {
        set({
          status: 'checked',
          checkResult: result,
        });
      },

      completePayment: () => {
        const { currentRequest, checkResult } = get();
        if (!currentRequest || !checkResult) return null;

        const tx: Transaction = {
          id: `REF-${Math.floor(100000000 + Math.random() * 900000000)}`,
          payment: currentRequest,
          result: checkResult,
          outcome: 'paid',
          completedAt: new Date().toISOString(),
        };

        set((state) => ({
          status: 'paid',
          transactions: [tx, ...state.transactions],
        }));

        return tx;
      },

      cancelPayment: () => {
        const { currentRequest, checkResult } = get();
        if (!currentRequest) return null;

        const dummyResult: CheckResult = checkResult || {
          verdict: 'suspicious',
          findings: [],
          checkedAt: new Date().toISOString(),
        };

        const tx: Transaction = {
          id: `REF-CAN-${Math.floor(100000000 + Math.random() * 900000000)}`,
          payment: currentRequest,
          result: dummyResult,
          outcome: 'cancelled',
          completedAt: new Date().toISOString(),
        };

        set((state) => ({
          status: 'cancelled',
          transactions: [tx, ...state.transactions],
        }));

        return tx;
      },

      resetFlow: () => {
        set({
          status: 'idle',
          currentRequest: null,
          checkResult: null,
        });
      },

      clearTransactions: () => {
        set({ transactions: [] });
      },
    }),
    {
      name: 'taptignan-payment-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ transactions: state.transactions }),
    }
  )
);
