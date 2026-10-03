export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  rawQr: string;
  expectedVerdict: 'safe' | 'suspicious';
  amount: number;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'safe_cafe_manila',
    name: 'Safe Merchant (Cafe Manila)',
    description: 'Legitimate merchant QR code with verified business registration.',
    rawQr: 'TAPTIGNAN:PAY:CM-98231:Cafe Manila Inc.:850.00',
    expectedVerdict: 'safe',
    amount: 850.0,
  },
  {
    id: 'suspicious_mismatch',
    name: 'Name Mismatch (Quishing Sticker)',
    description: 'Claims to be Cafe Manila, but resolves to a personal account.',
    rawQr: 'TAPTIGNAN:PAY:JD-11029:Cafe Manila Inc.:650.00',
    expectedVerdict: 'suspicious',
    amount: 650.0,
  },
  {
    id: 'suspicious_url',
    name: 'Phishing URL (Embedded Link)',
    description: 'Malicious QR attempting to redirect to an external phishing website.',
    rawQr: 'https://gcash-verification-portal.ph/claim-reward?promo=cashback',
    expectedVerdict: 'suspicious',
    amount: 500.0,
  },
];
