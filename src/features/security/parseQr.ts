import { QrPayload } from '@/types';

export function parseQr(raw: string): QrPayload {
  const trimmed = (raw || '').trim();

  if (!trimmed) {
    return {
      raw: '',
      containsUrl: false,
    };
  }

  // Check for embedded URLs (http:// or https://)
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  const match = trimmed.match(urlRegex);
  if (match) {
    return {
      raw: trimmed,
      containsUrl: true,
      url: match[0],
    };
  }

  // Check for TAPTIGNAN standard demo format:
  // TAPTIGNAN:PAY:<accountId>:<merchantName>:<amount>
  if (trimmed.startsWith('TAPTIGNAN:PAY:')) {
    const parts = trimmed.split(':');
    const accountId = parts[2] || undefined;
    const merchantName = parts[3] || undefined;
    const amountStr = parts[4] || undefined;
    const amount = amountStr ? parseFloat(amountStr) : undefined;

    return {
      raw: trimmed,
      accountId,
      merchantName,
      amount: isNaN(amount as number) ? undefined : amount,
      containsUrl: false,
      crcValid: true,
    };
  }

  // Check for JSON format
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        raw: trimmed,
        accountId: parsed.accountId || parsed.id,
        merchantName: parsed.merchantName || parsed.name,
        merchantCity: parsed.city,
        amount: typeof parsed.amount === 'number' ? parsed.amount : undefined,
        containsUrl: false,
        crcValid: true,
      };
    } catch {
      // not valid JSON
    }
  }

  // Fallback for generic QR strings
  return {
    raw: trimmed,
    containsUrl: false,
    accountId: trimmed,
  };
}
