export interface DemoScenario {
  id: string;
  name: string;
  flagTitle: string;
  flagBadge: string;
  description: string;
  rawQr: string;
  expectedVerdict: 'safe' | 'caution' | 'suspicious';
  amount: number;
  qrImage: any;
  cardImage: any;
  presentationTip: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'my_personal_qr',
    name: 'My GCash QR (Juan Dela Cruz)',
    flagTitle: 'Personal Wallet: Juan Dela Cruz (+63 908 345 6789)',
    flagBadge: 'MY QR',
    description: 'Personal GCash account QR code for receiving peer-to-peer money transfers.',
    rawQr: 'TAPTIGNAN:PAY:JD-11029:Juan Dela Cruz:100.00',
    expectedVerdict: 'caution',
    amount: 100.0,
    qrImage: require('../../../assets/presentation-qrs/0_My_GCash_QR_JuanDelaCruz_qr_only.png'),
    cardImage: require('../../../assets/presentation-qrs/0_My_GCash_QR_JuanDelaCruz.png'),
    presentationTip: 'Standard personal GCash wallet. Prompts verbal confirmation check when scanned by another user.',
  },
  {
    id: 'safe_cafe_manila',
    name: 'Safe Merchant (Cafe Manila)',
    flagTitle: 'Flag 1: Safe Merchant (Verified Business)',
    flagBadge: 'SAFE',
    description: 'Legitimate merchant QR code with verified business registration.',
    rawQr: 'TAPTIGNAN:PAY:CM-98231:Cafe Manila Inc.:850.00',
    expectedVerdict: 'safe',
    amount: 850.0,
    qrImage: require('../../../assets/presentation-qrs/1_Safe_Merchant_CafeManila_qr_only.png'),
    cardImage: require('../../../assets/presentation-qrs/1_Safe_Merchant_CafeManila.png'),
    presentationTip: 'Verified accredited business merchant. Passes all checks and allows immediate direct payment.',
  },
  {
    id: 'caution_sari_sari',
    name: 'Micro-Merchant (Ate Rose Store)',
    flagTitle: 'Flag 2: Caution (Micro-Merchant / Personal Wallet)',
    flagBadge: 'CAUTION',
    description: 'Personal GCash account with matching owner name. Standard for local sari-sari stores.',
    rawQr: 'TAPTIGNAN:PAY:RN-33210:Rosemarie Natividad:45.00',
    expectedVerdict: 'caution',
    amount: 45.0,
    qrImage: require('../../../assets/presentation-qrs/2_Caution_MicroMerchant_AteRose_qr_only.png'),
    cardImage: require('../../../assets/presentation-qrs/2_Caution_MicroMerchant_AteRose.png'),
    presentationTip: 'Unaccredited personal wallet. TapTignan gives an amber warning and prompts a verbal confirmation check.',
  },
  {
    id: 'suspicious_mismatch',
    name: 'Name Mismatch (Quishing Sticker)',
    flagTitle: 'Flag 3: Suspicious (Name Mismatch / Quishing)',
    flagBadge: 'MISMATCH',
    description: 'Claims to be Cafe Manila, but resolves to Juan Dela Cruz personal wallet.',
    rawQr: 'TAPTIGNAN:PAY:JD-11029:Cafe Manila Inc.:650.00',
    expectedVerdict: 'suspicious',
    amount: 650.0,
    qrImage: require('../../../assets/presentation-qrs/3_Suspicious_NameMismatch_Quishing_qr_only.png'),
    cardImage: require('../../../assets/presentation-qrs/3_Suspicious_NameMismatch_Quishing.png'),
    presentationTip: 'Physical quishing sticker attack. TapTignan catches recipient mismatch (Cafe Manila != Juan Dela Cruz).',
  },
  {
    id: 'suspicious_url',
    name: 'Phishing URL (Embedded Link)',
    flagTitle: 'Flag 4: Suspicious (Malicious Phishing URL)',
    flagBadge: 'PHISHING',
    description: 'Malicious QR attempting to redirect to an external phishing website.',
    rawQr: 'https://gcash-verification-portal.ph/claim-reward?promo=cashback',
    expectedVerdict: 'suspicious',
    amount: 500.0,
    qrImage: require('../../../assets/presentation-qrs/4_Suspicious_Phishing_URL_qr_only.png'),
    cardImage: require('../../../assets/presentation-qrs/4_Suspicious_Phishing_URL.png'),
    presentationTip: 'Credential harvesting hyperlink. TapTignan intercepts the redirect and blocks browser exposure.',
  },
  {
    id: 'reported_scam_sticker',
    name: 'Reported Quishing Sticker (Community Flagged)',
    flagTitle: 'Flag 5: Suspicious (Community Blacklisted Threat)',
    flagBadge: 'BLACKLISTED',
    description: 'Physical scam sticker reported by commuters at MRT-3 Shaw Station.',
    rawQr: 'TAPTIGNAN:PAY:SCAM-9901:Juana Fake:350.00',
    expectedVerdict: 'suspicious',
    amount: 350.0,
    qrImage: require('../../../assets/presentation-qrs/5_Suspicious_Reported_Scam_qr_only.png'),
    cardImage: require('../../../assets/presentation-qrs/5_Suspicious_Reported_Scam.png'),
    presentationTip: 'Crowdsourced community defense. When a user reports a scam sticker, all other users are shielded immediately.',
  },
];
