import type { User } from '../types';

class AuthService {
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  // Get auth token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Check if user has specific role
  hasRole(role: 'ADMIN' | 'CUSTOMER' | 'TELLER'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  // Check if user is customer
  isCustomer(): boolean {
    return this.hasRole('CUSTOMER');
  }

  // Check if user is teller
  isTeller(): boolean {
    return this.hasRole('TELLER');
  }

  // Set auth data in localStorage
  setAuthData(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Clear auth data from localStorage
  clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // Get redirect path based on user role
  getRedirectPath(): string {
    const user = this.getCurrentUser();
    if (!user) return '/login';

    switch (user.role) {
      case 'ADMIN':
        return '/admin';
      case 'TELLER':
        return '/teller';
      case 'CUSTOMER':
        return '/dashboard';
      default:
        return '/login';
    }
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
