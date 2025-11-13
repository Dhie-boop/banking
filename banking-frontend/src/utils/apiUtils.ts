import type { Account, Transaction, User } from '../types';

// Utility helpers to normalize backend API responses that may wrap data
// in pagination or generic response envelopes.
export function normalizeListResponse<T>(raw: unknown): T[] {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw as T[];
  }

  if (typeof raw !== 'object') {
    return [];
  }

  const candidates: unknown[] = [];
  const obj = raw as Record<string, unknown>;

  candidates.push(obj.content);
  candidates.push(obj.data);

  if (obj.results) {
    candidates.push(obj.results);
  }

  if (obj.items) {
    candidates.push(obj.items);
  }

  if (typeof obj.data === 'object' && obj.data !== null) {
    const data = obj.data as Record<string, unknown>;
    candidates.push(data.content);
    candidates.push(data.items);
    candidates.push(data.results);
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
}

export function normalizeObjectResponse<T extends object>(raw: unknown): T {
  if (!raw || typeof raw !== 'object') {
    return {} as T;
  }

  const obj = raw as Record<string, unknown>;
  if (obj.data && typeof obj.data === 'object') {
    return obj.data as T;
  }

  return raw as T;
}

function normalizeTransactionType(rawType: unknown): Transaction['type'] {
  if (typeof rawType === 'string') {
    const upper = rawType.toUpperCase();
    if (upper === 'DEPOSIT') {
      return 'DEPOSIT';
    }
    if (upper === 'TRANSFER') {
      return 'TRANSFER';
    }
    if (upper === 'WITHDRAW' || upper === 'WITHDRAWAL' || upper === 'WITHDRAWN') {
      return 'WITHDRAWAL';
    }
  }
  return 'DEPOSIT';
}

function normalizeTransactionStatus(rawStatus: unknown): Transaction['status'] {
  if (typeof rawStatus === 'string') {
    const upper = rawStatus.toUpperCase();
    if (upper === 'COMPLETED' || upper === 'PENDING' || upper === 'FAILED') {
      return upper as Transaction['status'];
    }
  }
  return 'COMPLETED';
}

function coerceNumber(value: unknown): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function coerceString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    return value;
  }
  return undefined;
}

function normalizeUserRole(value: unknown): User['role'] {
  if (typeof value === 'string') {
    const upper = value.toUpperCase();
    if (upper === 'ADMIN' || upper === 'CUSTOMER' || upper === 'TELLER') {
      return upper as User['role'];
    }
  }
  return 'CUSTOMER';
}

type RawTransaction = Record<string, unknown> & {
  id?: string | number;
  amount?: number | string;
  type?: string;
  description?: string;
  sourceAccountNumber?: string;
  targetAccountNumber?: string;
  referenceNumber?: string;
  timestamp?: string;
  createdAt?: string;
  status?: string;
  fromAccount?: Account;
  toAccount?: Account;
};

export function normalizeTransactionsResponse(raw: unknown): Transaction[] {
  const rawTransactions = normalizeListResponse<RawTransaction>(raw);

  return rawTransactions.reduce<Transaction[]>((acc, item) => {
    const id = item.id !== undefined ? String(item.id) : undefined;
    if (!id) {
      return acc;
    }

    const timestamp = coerceString(item.timestamp) ?? coerceString(item.createdAt) ?? new Date().toISOString();

    const normalized: Transaction = {
      id,
      type: normalizeTransactionType(item.type),
      amount: coerceNumber(item.amount),
      description: coerceString(item.description),
      sourceAccountNumber: coerceString(item.sourceAccountNumber),
      targetAccountNumber: coerceString(item.targetAccountNumber),
      referenceNumber: coerceString(item.referenceNumber),
      timestamp,
      createdAt: timestamp,
      status: normalizeTransactionStatus(item.status),
      fromAccount: item.fromAccount as Account | undefined,
      toAccount: item.toAccount as Account | undefined,
    };

    acc.push(normalized);
    return acc;
  }, []);
}

function normalizeAccountType(rawType: unknown): Account['accountType'] {
  if (typeof rawType === 'string') {
    const upper = rawType.toUpperCase();
    if (upper === 'CHECKING' || upper === 'SAVINGS') {
      return upper as Account['accountType'];
    }
  }
  return 'CHECKING';
}

type RawAccount = Record<string, unknown> & {
  id?: string | number;
  accountNumber?: string;
  accountType?: string;
  balance?: number | string;
  isActive?: boolean | string;
  createdAt?: string;
  userId?: string | number;
  user?: Account['user'];
  ownerName?: string;
};

export function normalizeAccountsResponse(raw: unknown): Account[] {
  const rawAccounts = normalizeListResponse<RawAccount>(raw);

  return rawAccounts.reduce<Account[]>((acc, item) => {
    const id = item.id !== undefined ? String(item.id) : undefined;
    const accountNumber = coerceString(item.accountNumber);
    if (!id || !accountNumber) {
      return acc;
    }

    const createdAt = coerceString(item.createdAt) ?? new Date().toISOString();
    const userId = item.userId !== undefined ? String(item.userId) : undefined;

    let user = item.user as User | undefined;
    const username = coerceString((item as Record<string, unknown>).username);
    const email = coerceString((item as Record<string, unknown>).email);

    if (!user && username) {
      user = {
        id: userId ?? username,
        username,
        email: email ?? '',
        role: 'CUSTOMER',
        fullName: undefined,
        firstName: undefined,
        lastName: undefined,
        phoneNumber: undefined,
        createdAt: undefined,
        enabled: undefined,
        accountCount: undefined,
      };
    }

    const normalized: Account = {
      id,
      accountNumber,
      accountType: normalizeAccountType(item.accountType),
      balance: coerceNumber(item.balance),
      isActive: typeof item.isActive === 'boolean' ? item.isActive : item.isActive === 'true',
      createdAt,
      ownerName: coerceString(item.ownerName),
      userId,
      user,
    };

    acc.push(normalized);
    return acc;
  }, []);
}

type RawUser = Record<string, unknown> & {
  id?: string | number;
  username?: string;
  email?: string;
  role?: string;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: string;
  accountCount?: number;
};

export function normalizeUsersResponse(raw: unknown): User[] {
  const rawUsers = normalizeListResponse<RawUser>(raw);

  return rawUsers.reduce<User[]>((acc, item) => {
    const id = item.id !== undefined ? String(item.id) : undefined;
    const username = coerceString(item.username);
    const email = coerceString(item.email);

    if (!id || !username || !email) {
      return acc;
    }

    const firstName = coerceString(item.firstName);
    const lastName = coerceString(item.lastName);
    const derivedFullName = [firstName, lastName]
      .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
      .join(' ')
      .trim();
    const fullName = coerceString(item.fullName) ?? (derivedFullName !== '' ? derivedFullName : undefined);

    const normalized: User = {
      id,
      username,
      email,
      role: normalizeUserRole(item.role),
      firstName,
      lastName,
      fullName,
      phoneNumber: coerceString(item.phoneNumber),
      createdAt: coerceString(item.createdAt),
      enabled: typeof item.enabled === 'boolean' ? item.enabled : undefined,
      accountCount: typeof item.accountCount === 'number' ? item.accountCount : undefined,
    };

    acc.push(normalized);
    return acc;
  }, []);
}
