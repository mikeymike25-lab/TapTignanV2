import { COPY } from '@/data/copy';
import { Finding, PaymentRequest, QrPayload, RegistryEntry } from '@/types';

/**
 * R-01: QR payload parses as a valid payment QR
 */
export function checkValidFormat(payload: QrPayload): Finding {
  const passed = !payload.containsUrl && Boolean(payload.accountId && payload.raw);
  return {
    ruleId: 'R-01',
    severity: 'high',
    title: COPY.rules.R01.title,
    explanation: passed ? COPY.rules.R01.explanation : COPY.rules.R01.failExplanation,
    passed,
  };
}

/**
 * R-02: QR contains no embedded URL (phishing links)
 */
export function checkNoEmbeddedUrl(payload: QrPayload): Finding {
  const passed = !payload.containsUrl;
  return {
    ruleId: 'R-02',
    severity: 'high',
    title: COPY.rules.R02.title,
    explanation: passed ? COPY.rules.R02.explanation : COPY.rules.R02.failExplanation,
    passed,
  };
}

/**
 * R-03: Recipient name matches merchant in registry
 */
export function checkNameMatchesRegistry(
  request: PaymentRequest,
  entry?: RegistryEntry
): Finding {
  if (!entry) {
    return {
      ruleId: 'R-03',
      severity: 'high',
      title: COPY.rules.R03.title,
      explanation: 'Recipient could not be found in the verified merchant directory.',
      passed: false,
    };
  }

  const reqName = (request.merchantName || request.recipientName || '').trim().toLowerCase();
  const regName = entry.name.trim().toLowerCase();
  const fullRegName = entry.registeredName.trim().toLowerCase();

  const passed = reqName === regName || reqName === fullRegName;
  return {
    ruleId: 'R-03',
    severity: 'high',
    title: COPY.rules.R03.title,
    explanation: passed ? COPY.rules.R03.explanation : COPY.rules.R03.failExplanation,
    passed,
  };
}

/**
 * R-04: Recipient is an accredited merchant (not a personal wallet)
 */
export function checkIsMerchantAccount(entry?: RegistryEntry): Finding {
  const passed = Boolean(entry && entry.type === 'merchant' && entry.isVerified);
  return {
    ruleId: 'R-04',
    severity: 'medium',
    title: COPY.rules.R04.title,
    explanation: passed ? COPY.rules.R04.explanation : COPY.rules.R04.failExplanation,
    passed,
  };
}

/**
 * R-05: QR code or recipient has not been reported previously
 */
export function checkNotReported(
  request: PaymentRequest,
  reportedQrs: string[]
): Finding {
  const rawQr = request.qr.raw;
  const accountId = request.qr.accountId || '';

  const isReported =
    reportedQrs.includes(rawQr) ||
    (Boolean(accountId) && reportedQrs.includes(accountId));

  const passed = !isReported;
  return {
    ruleId: 'R-05',
    severity: 'high',
    title: COPY.rules.R05.title,
    explanation: passed ? COPY.rules.R05.explanation : COPY.rules.R05.failExplanation,
    passed,
  };
}

/**
 * R-06: Amount is within a plausible range for this merchant
 */
export function checkPlausibleAmount(amount: number): Finding {
  const passed = amount > 0 && amount <= 50000;
  return {
    ruleId: 'R-06',
    severity: 'low',
    title: COPY.rules.R06.title,
    explanation: passed ? COPY.rules.R06.explanation : COPY.rules.R06.failExplanation,
    passed,
  };
}
