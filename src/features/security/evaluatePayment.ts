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
 * Follows Usable-Security verdict rule:
 * Any failed finding with HIGH or MEDIUM severity triggers a Suspicious verdict.
 */
export function evaluatePayment(
  request: PaymentRequest,
  ctx: EvaluationContext
): CheckResult {
  // Find matching registry entry by accountId or name
  const accountId = request.qr.accountId?.toLowerCase();
  const entry = ctx.registry.find((e) => {
    if (accountId && e.accountId.toLowerCase() === accountId) return true;
    return (
      e.name.toLowerCase() === request.merchantName.toLowerCase() ||
      e.registeredName.toLowerCase() === request.merchantName.toLowerCase()
    );
  });

  const findings: Finding[] = [
    checkValidFormat(request.qr),
    checkNoEmbeddedUrl(request.qr),
    checkNameMatchesRegistry(request, entry),
    checkIsMerchantAccount(entry),
    checkNotReported(request, ctx.reportedQrs),
    checkPlausibleAmount(request.amount),
  ];

  // Verdict logic
  const hasHighOrMediumFailure = findings.some(
    (f) => !f.passed && (f.severity === 'high' || f.severity === 'medium')
  );

  const verdict: Verdict = hasHighOrMediumFailure ? 'suspicious' : 'safe';

  return {
    verdict,
    findings,
    checkedAt: new Date().toISOString(),
  };
}
