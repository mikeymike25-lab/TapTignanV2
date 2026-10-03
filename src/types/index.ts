export type Verdict = 'safe' | 'suspicious';
export type Severity = 'high' | 'medium' | 'low';

export interface QrPayload {
  raw: string;
  merchantName?: string;
  merchantCity?: string;
  accountId?: string;
  amount?: number;
  containsUrl: boolean;
  url?: string;
  crcValid?: boolean;
}

export interface PaymentRequest {
  id: string;
  qr: QrPayload;
  recipientName: string;
  merchantName: string;
  recipientNumber: string;
  amount: number;
  fee: number;
  method: 'GCash Wallet';
  createdAt: string;
}

export interface Finding {
  ruleId: string;
  severity: Severity;
  title: string;
  explanation: string;
  passed: boolean;
}

export interface CheckResult {
  verdict: Verdict;
  findings: Finding[];
  checkedAt: string;
}

export type ReportReason =
  | 'wrong_recipient_name'
  | 'suspicious_link'
  | 'forced_to_pay'
  | 'unrecognized_qr';

export type ReportStatus = 'under_review' | 'resolved';

export interface Report {
  id: string;
  paymentId?: string;
  rawQr?: string;
  recipientName?: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface Transaction {
  id: string;
  payment: PaymentRequest;
  result: CheckResult;
  outcome: 'paid' | 'cancelled';
  completedAt: string;
}

export interface RegistryEntry {
  accountId: string;
  name: string;
  registeredName: string;
  type: 'merchant' | 'personal';
  phoneNumber: string;
  city?: string;
  isVerified: boolean;
}

export type PaymentFlowStatus =
  | 'idle'
  | 'pending_confirm'
  | 'checking'
  | 'checked'
  | 'paid'
  | 'cancelled';
