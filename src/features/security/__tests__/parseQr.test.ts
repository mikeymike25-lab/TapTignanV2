import { parseQr } from '../parseQr';

describe('parseQr', () => {
  it('handles empty or whitespace strings', () => {
    expect(parseQr('')).toEqual({
      raw: '',
      containsUrl: false,
    });
    expect(parseQr('   ')).toEqual({
      raw: '',
      containsUrl: false,
    });
  });

  it('detects embedded phishing URLs', () => {
    const resultHttp = parseQr('http://gcash-claim-bonus.net/login');
    expect(resultHttp.containsUrl).toBe(true);
    expect(resultHttp.url).toBe('http://gcash-claim-bonus.net/login');

    const resultHttps = parseQr('SCAN TO WIN https://promo-gcash.xyz/claim NOW');
    expect(resultHttps.containsUrl).toBe(true);
    expect(resultHttps.url).toBe('https://promo-gcash.xyz/claim');
  });

  it('correctly parses TAPTIGNAN standard format', () => {
    const raw = 'TAPTIGNAN:PAY:ACC-1001:Cafe Manila:850.50';
    const result = parseQr(raw);

    expect(result.raw).toBe(raw);
    expect(result.accountId).toBe('ACC-1001');
    expect(result.merchantName).toBe('Cafe Manila');
    expect(result.amount).toBe(850.5);
    expect(result.containsUrl).toBe(false);
    expect(result.crcValid).toBe(true);
  });

  it('handles TAPTIGNAN standard format without amount', () => {
    const raw = 'TAPTIGNAN:PAY:ACC-1002:Metro Mart';
    const result = parseQr(raw);

    expect(result.accountId).toBe('ACC-1002');
    expect(result.merchantName).toBe('Metro Mart');
    expect(result.amount).toBeUndefined();
    expect(result.containsUrl).toBe(false);
  });

  it('correctly parses valid JSON format', () => {
    const jsonStr = JSON.stringify({
      accountId: 'ACC-2001',
      merchantName: 'Quezon Bookstore',
      city: 'Quezon City',
      amount: 450,
    });
    const result = parseQr(jsonStr);

    expect(result.accountId).toBe('ACC-2001');
    expect(result.merchantName).toBe('Quezon Bookstore');
    expect(result.merchantCity).toBe('Quezon City');
    expect(result.amount).toBe(450);
    expect(result.containsUrl).toBe(false);
  });

  it('falls back to generic QR payload for unrecognized plain strings', () => {
    const result = parseQr('UNKNOWN_VENDOR_PAYLOAD_999');
    expect(result.raw).toBe('UNKNOWN_VENDOR_PAYLOAD_999');
    expect(result.accountId).toBe('UNKNOWN_VENDOR_PAYLOAD_999');
    expect(result.containsUrl).toBe(false);
  });
});
