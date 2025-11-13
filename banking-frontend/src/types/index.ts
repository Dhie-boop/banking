// Authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'TELLER';
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phoneNumber?: string;
  createdAt?: string;
  enabled?: boolean;
  accountCount?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: 'ADMIN' | 'CUSTOMER' | 'TELLER';
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Backend JWT response format (what the API actually returns)
export interface JwtResponse {
  token: string;
  type?: string;
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'TELLER';
}

// Account types
export interface Account {
  id: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  balance: number;
  isActive?: boolean;
  ownerName?: string;
  createdAt: string;
  userId?: string;
  user?: User;
}

export interface CreateAccountRequest {
  accountType: 'CHECKING' | 'SAVINGS';
  userId?: string;
}

// Transaction types
export interface Transaction {
  createdAt: string | number | Date;
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  description?: string;
  sourceAccountNumber?: string;
  targetAccountNumber?: string;
  referenceNumber?: string;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  fromAccount?: Account;
  toAccount?: Account;
}

export interface TransactionRequest {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  description?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export interface TransferRequest {
  sourceAccountNumber: string;
  targetAccountNumber: string;
  amount: number;
  description?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Form types
export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface TransferFormData {
  recipientAccount: string;
  amount: number;
  description: string;
}

// Component props
export interface DashboardStats {
  totalAccounts?: number;
  totalBalance?: number;
  totalCustomers?: number;
  recentTransactions?: number;
}

export interface NotificationToast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}