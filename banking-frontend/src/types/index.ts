// Authentication types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER' | 'TELLER';
  fullName?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Account types
export interface Account {
  id: string;
  accountNumber: string;
  accountType: 'CHECKING' | 'SAVINGS';
  balance: number;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface CreateAccountRequest {
  accountType: 'CHECKING' | 'SAVINGS';
}

// Transaction types
export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  description?: string;
  fromAccountId?: string;
  toAccountId?: string;
  fromAccount?: Account;
  toAccount?: Account;
  createdAt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface TransactionRequest {
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  amount: number;
  description?: string;
  fromAccountId?: string;
  toAccountId?: string;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
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
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
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