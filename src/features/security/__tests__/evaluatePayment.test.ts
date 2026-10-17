import { evaluatePayment } from '../evaluatePayment';
import { PaymentRequest, RegistryEntry } from '@/types';

describe('evaluatePayment (Security Engine)', () => {
  const mockRegistry: RegistryEntry[] = [
    {
      accountId: 'ACC-1001',
      name: 'Cafe Manila',
      registeredName: 'Cafe Manila Inc.',
      phoneNumber: '0917-555-1234',
      isVerified: true,
      city: 'Makati City',
      type: 'merchant',
    },
    {
      accountId: 'ACC-1002',
      name: 'Metro Mart',
      registeredName: 'Metro Retail Group PH Inc.',
      phoneNumber: '0918-555-5678',
      isVerified: true,
      city: 'Taguig City',
      type: 'merchant',
    },
    {
      accountId: 'ACC-9999',
      name: 'Juan Dela Cruz',
      registeredName: 'Juan Dela Cruz',
      phoneNumber: '0919-555-9999',
      isVerified: false,
      type: 'personal',
    },
  ];

  function createMockRequest(overrides?: Partial<PaymentRequest>): PaymentRequest {
    return {
      id: 'REQ-001',
      recipientName: 'Cafe Manila Inc.',
      merchantName: 'Cafe Manila',
      recipientNumber: '0917-123-4567',
      amount: 850,
      fee: 0,
      method: 'GCash Wallet',
      createdAt: '2026-10-03T00:00:00.000Z',
      qr: {
        raw: 'TAPTIGNAN:PAY:ACC-1001:Cafe Manila:850',
        accountId: 'ACC-1001',
        merchantName: 'Cafe Manila',
        amount: 850,
        containsUrl: false,
        crcValid: true,
      },
      ...overrides,
    };
  }

  it('marks a valid verified merchant payment as SAFE with all rules passed', () => {
    const request = createMockRequest();

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [],
    });

    expect(result.verdict).toBe('safe');
    expect(result.findings).toHaveLength(6);
    expect(result.findings.every((f) => f.passed)).toBe(true);
  });

  it('fails R-02 and flags SUSPICIOUS when QR contains an embedded URL', () => {
    const request = createMockRequest({
      recipientName: 'Claim GCash Prize',
      merchantName: 'Claim GCash Prize',
      amount: 1500,
      qr: {
        raw: 'https://gcash-claim-bonus.net/login',
        containsUrl: true,
        url: 'https://gcash-claim-bonus.net/login',
      },
    });

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [],
    });

    expect(result.verdict).toBe('suspicious');
    const r02 = result.findings.find((f) => f.ruleId === 'R-02');
    expect(r02?.passed).toBe(false);
  });

  it('fails R-03 and flags SUSPICIOUS when merchant name does not match registry', () => {
    const request = createMockRequest({
      recipientName: 'Fake Cafe Corner',
      merchantName: 'Fake Cafe Corner',
      amount: 250,
      qr: {
        raw: 'TAPTIGNAN:PAY:ACC-1001:Fake Cafe Corner:250',
        accountId: 'ACC-1001',
        merchantName: 'Fake Cafe Corner',
        containsUrl: false,
      },
    });

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [],
    });

    expect(result.verdict).toBe('suspicious');
    const r03 = result.findings.find((f) => f.ruleId === 'R-03');
    expect(r03?.passed).toBe(false);
  });

  it('fails R-03 when merchant is not present in registry at all', () => {
    const request = createMockRequest({
      recipientName: 'Unknown Shop',
      merchantName: 'Unknown Shop',
      amount: 500,
      qr: {
        raw: 'TAPTIGNAN:PAY:UNKNOWN-001:Unknown Shop:500',
        accountId: 'UNKNOWN-001',
        merchantName: 'Unknown Shop',
        containsUrl: false,
      },
    });

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [],
    });

    expect(result.verdict).toBe('suspicious');
    const r03 = result.findings.find((f) => f.ruleId === 'R-03');
    expect(r03?.passed).toBe(false);
  });

  it('flags CAUTION (micro-merchant) when recipient is a valid personal GCash account with matching name', () => {
    const request = createMockRequest({
      recipientName: 'Juan Dela Cruz',
      merchantName: 'Juan Dela Cruz',
      amount: 100,
      qr: {
        raw: 'TAPTIGNAN:PAY:ACC-9999:Juan Dela Cruz:100',
        accountId: 'ACC-9999',
        merchantName: 'Juan Dela Cruz',
        containsUrl: false,
      },
    });

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [],
    });

    expect(result.verdict).toBe('caution');
    const r04 = result.findings.find((f) => f.ruleId === 'R-04');
    expect(r04?.passed).toBe(false);
  });

  it('flags SUSPICIOUS (not caution) if a personal account is used in a name mismatch quishing attempt', () => {
    const request = createMockRequest({
      recipientName: 'Cafe Manila',
      merchantName: 'Cafe Manila',
      amount: 650,
      qr: {
        raw: 'TAPTIGNAN:PAY:ACC-9999:Cafe Manila:650',
        accountId: 'ACC-9999', // ACC-9999 is Juan Dela Cruz in registry
        merchantName: 'Cafe Manila',
        containsUrl: false,
      },
    });

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [],
    });

    // Name mismatch (R-03) has high severity failure => overrides to Suspicious
    expect(result.verdict).toBe('suspicious');
    const r03 = result.findings.find((f) => f.ruleId === 'R-03');
    expect(r03?.passed).toBe(false);
  });

  it('fails R-05 and flags SUSPICIOUS when QR or account was previously reported', () => {
    const reportedRaw = 'TAPTIGNAN:PAY:ACC-1001:Cafe Manila:850';
    const request = createMockRequest({
      qr: {
        raw: reportedRaw,
        accountId: 'ACC-1001',
        merchantName: 'Cafe Manila',
        containsUrl: false,
      },
    });

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [reportedRaw],
    });

    expect(result.verdict).toBe('suspicious');
    const r05 = result.findings.find((f) => f.ruleId === 'R-05');
    expect(r05?.passed).toBe(false);
  });

  it('evaluates R-06 for amount plausibility (low severity warning)', () => {
    const request = createMockRequest({
      amount: 75000, // exceeds 50000 threshold
      qr: {
        raw: 'TAPTIGNAN:PAY:ACC-1001:Cafe Manila:75000',
        accountId: 'ACC-1001',
        merchantName: 'Cafe Manila',
        containsUrl: false,
      },
    });

    const result = evaluatePayment(request, {
      registry: mockRegistry,
      reportedQrs: [],
    });

    const r06 = result.findings.find((f) => f.ruleId === 'R-06');
    expect(r06?.passed).toBe(false);
    expect(r06?.severity).toBe('low');
    // Low severity alone does not mark payment as suspicious
    expect(result.verdict).toBe('safe');
  });
});
