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
];

export function findRegistryEntry(accountIdOrName: string): RegistryEntry | undefined {
  const query = accountIdOrName.trim().toLowerCase();
  return MOCK_REGISTRY.find(
    (entry) =>
      entry.accountId.toLowerCase() === query ||
      entry.name.toLowerCase() === query ||
      entry.registeredName.toLowerCase() === query
  );
}
