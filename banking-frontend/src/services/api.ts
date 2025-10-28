import axios from 'axios';
import type { 
  User, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse,
  Account,
  CreateAccountRequest,
  Transaction,
  TransactionRequest,
  TransferRequest,
  PaginatedResponse
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Spring Boot backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Account API calls
export const accountAPI = {
  getMyAccounts: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/accounts/my');
    return response.data;
  },

  getAllAccounts: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/accounts');
    return response.data;
  },

  getAccountById: async (id: string): Promise<Account> => {
    const response = await api.get<Account>(`/accounts/${id}`);
    return response.data;
  },

  createAccount: async (data: CreateAccountRequest): Promise<Account> => {
    const response = await api.post<Account>('/accounts', data);
    return response.data;
  },

  deleteAccount: async (id: string): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },
};

// Transaction API calls
export const transactionAPI = {
  getMyTransactions: async (page = 0, size = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get<PaginatedResponse<Transaction>>(`/transactions/my?page=${page}&size=${size}`);
    return response.data;
  },

  getAllTransactions: async (page = 0, size = 10): Promise<PaginatedResponse<Transaction>> => {
    const response = await api.get<PaginatedResponse<Transaction>>(`/transactions?page=${page}&size=${size}`);
    return response.data;
  },

  getTransactionById: async (id: string): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  deposit: async (accountId: string, amount: number, description?: string): Promise<Transaction> => {
    const data: TransactionRequest = {
      type: 'DEPOSIT',
      amount,
      description,
      toAccountId: accountId,
    };
    const response = await api.post<Transaction>('/transactions/deposit', data);
    return response.data;
  },

  withdraw: async (accountId: string, amount: number, description?: string): Promise<Transaction> => {
    const data: TransactionRequest = {
      type: 'WITHDRAWAL',
      amount,
      description,
      fromAccountId: accountId,
    };
    const response = await api.post<Transaction>('/transactions/withdraw', data);
    return response.data;
  },

  transfer: async (data: TransferRequest): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions/transfer', data);
    return response.data;
  },
};

// Dashboard stats API
export const dashboardAPI = {
  getCustomerStats: async () => {
    const response = await api.get('/dashboard/customer-stats');
    return response.data;
  },

  getAdminStats: async () => {
    const response = await api.get('/dashboard/admin-stats');
    return response.data;
  },

  getTellerStats: async () => {
    const response = await api.get('/dashboard/teller-stats');
    return response.data;
  },
};

export default api;
