import {
  checkIsMerchantAccount,
  checkNameMatchesRegistry,
  checkNoEmbeddedUrl,
  checkNotReported,
  checkPlausibleAmount,
  checkValidFormat,
} from './rules';
import { CheckResult, Finding, PaymentRequest, RegistryEntry, Verdict } from '@/types';

export interface EvaluationContext {
  registry: RegistryEntry[];
  reportedQrs: string[];
}

/**
 * Pure function: Evaluates a payment request against known merchant registry and reported fraud indicators.
 * Follows Usable-Security 3-tier calibrated verdict (Resolves D-3):
 * 1. SUSPICIOUS (High Risk): Any failed finding with HIGH severity (e.g., malformed QR, phishing URL,
 *    impersonation/name mismatch, or reported fraud).
 * 2. CAUTION (Micro-Merchant): Valid format, matching recipient, no fraud reports, but registered
 *    to an individual personal GCash wallet (commonly used by sari-sari stores, tricycles, local vendors).
 * 3. SAFE (Verified Merchant): All checks pass and recipient is an accredited business merchant.
 */
export function evaluatePayment(
  request: PaymentRequest,
  ctx: EvaluationContext
): CheckResult {
  // Find matching registry entry:
  // If QR specifies an accountId, we MUST look up by that accountId to see who owns the receiving account.
  // Matching by name would allow an attacker to spoof a legitimate merchant's name on their own account.
  const accountId = request.qr.accountId?.toLowerCase();
  const entry = accountId
    ? ctx.registry.find((e) => e.accountId.toLowerCase() === accountId)
    : ctx.registry.find(
        (e) =>
          e.name.toLowerCase() === request.merchantName.toLowerCase() ||
          e.registeredName.toLowerCase() === request.merchantName.toLowerCase()
      );

  const findings: Finding[] = [
    checkValidFormat(request.qr),
    checkNoEmbeddedUrl(request.qr),
    checkNameMatchesRegistry(request, entry),
    checkIsMerchantAccount(entry),
    checkNotReported(request, ctx.reportedQrs),
    checkPlausibleAmount(request.amount),
  ];

  // 3-Tier Verdict logic:
  // 1. Critical risk: Any failed HIGH severity finding triggers Suspicious
  const hasHighSeverityFailure = findings.some(
    (f) => !f.passed && f.severity === 'high'
  );

  let verdict: Verdict;
  if (hasHighSeverityFailure) {
    verdict = 'suspicious';
  } else if (!findings.find((f) => f.ruleId === 'R-04')?.passed) {
    // 2. Personal account / Micro-merchant: Format and name match, not reported, but personal GCash account
    verdict = 'caution';
  } else {
    // 3. Verified Business Merchant: All checks pass, registered corporate account
    verdict = 'safe';
  }

  return {
    verdict,
    findings,
    checkedAt: new Date().toISOString(),
  };
}
