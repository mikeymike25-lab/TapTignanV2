import { RegistryEntry } from '@/types';

export const MOCK_REGISTRY: RegistryEntry[] = [
  {
    accountId: 'CM-98231',
    name: 'Cafe Manila',
    registeredName: 'Cafe Manila Inc.',
    type: 'merchant',
    phoneNumber: '+63 917 123 4567',
    city: 'Quezon City',
    isVerified: true,
  },
  {
    accountId: 'MM-55412',
    name: 'Metro Mart',
    registeredName: 'Metro Supermarket Inc.',
    type: 'merchant',
    phoneNumber: '+63 918 234 5678',
    city: 'Manila',
    isVerified: true,
  },
  {
    accountId: 'JD-11029',
    name: 'Juan Dela Cruz',
    registeredName: 'Juan Dela Cruz',
    type: 'personal',
    phoneNumber: '+63 908 345 6789',
    city: 'Pasig City',
    isVerified: false,
  },
  {
    accountId: 'SM-77890',
    name: 'Sarah Miller',
    registeredName: 'Sarah Miller',
    type: 'personal',
    phoneNumber: '+63 920 456 7890',
    city: 'Taguig City',
    isVerified: false,
  },
  {
    accountId: 'MS-88341',
    name: 'Maria Santos',
    registeredName: 'Maria Santos',
    type: 'personal',
    phoneNumber: '+63 918 987 6543',
    city: 'Makati City',
    isVerified: false,
  },
  {
    accountId: 'RN-33210',
    name: 'Ate Rose Sari-Sari Store',
    registeredName: 'Rosemarie Natividad',
    type: 'personal',
    phoneNumber: '+63 928 555 7890',
    city: 'Quezon City',
    isVerified: false,
  },
];

export function findRegistryEntry(accountIdOrNameOrPhone: string): RegistryEntry | undefined {
  if (!accountIdOrNameOrPhone) return undefined;
  const rawQuery = accountIdOrNameOrPhone.trim().toLowerCase();
  const normalizedQuery = rawQuery.replace(/[\s-]/g, '');
  return MOCK_REGISTRY.find((entry) => {
    const entryId = entry.accountId.toLowerCase().replace(/[\s-]/g, '');
    const entryName = entry.name.toLowerCase();
    const entryReg = entry.registeredName.toLowerCase();
    const entryPhone = entry.phoneNumber.toLowerCase().replace(/[\s-]/g, '');

    return (
      rawQuery === entryName ||
      rawQuery === entryReg ||
      normalizedQuery === entryId ||
      normalizedQuery === entryPhone
    );
  });
}
