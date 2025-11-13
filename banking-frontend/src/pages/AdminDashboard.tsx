import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { 
  FiUsers, 
  FiCreditCard, 
  FiActivity, 
  FiDollarSign,
  FiTrendingUp,
  FiPieChart
} from 'react-icons/fi';
import { userAPI, accountAPI, transactionAPI, dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { User, Account, Transaction } from '../types';
import { normalizeListResponse, normalizeObjectResponse, normalizeTransactionsResponse, normalizeAccountsResponse } from '../utils/apiUtils';
import { formatCurrency } from '../utils/currency';

// Import the new admin pages
import UsersManagement from './admin/UsersManagement';
import AccountsManagement from './admin/AccountsManagement';
import TransactionsManagement from './admin/TransactionsManagement';

// Dashboard Overview Component
function AdminOverview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalBalance: 0,
    recentTransactions: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const failedSections: string[] = [];

    try {
      const [usersResult, accountsResult, transactionsResult, statsResult] = await Promise.allSettled([
        userAPI.getAllUsers(),
        accountAPI.getAllAccounts(),
        transactionAPI.getAllTransactions(0, 10),
        dashboardAPI.getAdminStats(),
      ]);

      if (usersResult.status === 'rejected') {
        console.error('Error loading users:', usersResult.reason);
        failedSections.push('users');
      }
      if (accountsResult.status === 'rejected') {
        console.error('Error loading accounts:', accountsResult.reason);
        failedSections.push('accounts');
      }
      if (transactionsResult.status === 'rejected') {
        console.error('Error loading transactions:', transactionsResult.reason);
        failedSections.push('transactions');
      }
      if (statsResult.status === 'rejected') {
        console.error('Error loading stats:', statsResult.reason);
        failedSections.push('stats');
      }

      const usersData = normalizeListResponse<User>(
        usersResult.status === 'fulfilled' ? usersResult.value : []
      );
      const accountsArray = normalizeAccountsResponse(
        accountsResult.status === 'fulfilled' ? accountsResult.value : []
      );
      const transactionsData = normalizeTransactionsResponse(
        transactionsResult.status === 'fulfilled' ? transactionsResult.value : []
      );
      const statsData = normalizeObjectResponse<Partial<typeof stats>>(
        statsResult.status === 'fulfilled' ? statsResult.value : {}
      );

      console.log('AdminDashboard - Processed users:', usersData);
      console.log('AdminDashboard - Processed accounts:', accountsArray);
      console.log('AdminDashboard - Processed transactions:', transactionsData);
      console.log('AdminDashboard - Processed stats:', statsData);

      setUsers(usersData);
      setAccounts(accountsArray);
      setTransactions(transactionsData);

      const totalBalance = accountsArray.reduce((sum: number, account: Account) => sum + (account.balance || 0), 0);
      const mergedStats: typeof stats = {
        totalUsers: usersData.length,
        totalAccounts: accountsArray.length,
        totalBalance,
        recentTransactions: transactionsData.length,
      };

      Object.entries(statsData).forEach(([key, value]) => {
        if (typeof value === 'number' && key in mergedStats) {
          mergedStats[key as keyof typeof mergedStats] = value;
        }
      });

      setStats(mergedStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      failedSections.push('dashboard');
    } finally {
      setLoading(false);

      if (failedSections.length > 0) {
        const hasCriticalError = failedSections.includes('dashboard') || failedSections.length === 4;
        const message = hasCriticalError
          ? 'Failed to load dashboard data'
          : `Partial data loaded. Issues with: ${failedSections.join(', ')}`;
        (hasCriticalError ? toast.error : toast.warn)(message);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card 
          title="Total Users" 
          icon={<FiUsers />}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        >
          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          <p className="text-blue-100 text-sm">Registered customers</p>
        </Card>

        <Card title="Total Accounts" icon={<FiCreditCard />}>
          <p className="text-3xl font-bold text-gray-900">{stats.totalAccounts}</p>
          <p className="text-gray-500 text-sm">Active accounts</p>
        </Card>

        <Card title="Total Balance" icon={<FiDollarSign />}>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalBalance)}</p>
          <p className="text-gray-500 text-sm">System-wide balance</p>
        </Card>

        <Card title="Recent Transactions" icon={<FiActivity />}>
          <p className="text-3xl font-bold text-gray-900">{stats.recentTransactions}</p>
          <p className="text-gray-500 text-sm">Last 30 days</p>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Account Distribution" icon={<FiPieChart />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Checking Accounts</span>
              <span className="text-sm text-gray-500">
                {accounts.filter(a => a.accountType === 'CHECKING').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Savings Accounts</span>
              <span className="text-sm text-gray-500">
                {accounts.filter(a => a.accountType === 'SAVINGS').length}
              </span>
            </div>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiPieChart className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-gray-500">Chart placeholder</span>
            </div>
          </div>
        </Card>

        <Card title="Transaction Activity" icon={<FiTrendingUp />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Deposits</span>
              <span className="text-sm text-green-600">
                {transactions.filter(t => t.type === 'DEPOSIT').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Withdrawals</span>
              <span className="text-sm text-red-600">
                {transactions.filter(t => t.type === 'WITHDRAWAL').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Transfers</span>
              <span className="text-sm text-blue-600">
                {transactions.filter(t => t.type === 'TRANSFER').length}
              </span>
            </div>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="h-8 w-8 text-gray-400" />
              <span className="ml-2 text-gray-500">Chart placeholder</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Users */}
      <Card title="Recent Users">
        {users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// Main Admin Dashboard Component with Routing
export default function AdminDashboard() {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/customers')) return 'Users Management';
    if (path.includes('/accounts')) return 'Accounts Management';
    if (path.includes('/transactions')) return 'Transactions Management';
    if (path.includes('/settings')) return 'Settings';
    return 'Admin Dashboard';
  };

  return (
    <Layout title={getPageTitle()}>
      <Routes>
        <Route path="/" element={<AdminOverview />} />
        <Route path="/customers" element={<UsersManagement />} />
        <Route path="/accounts" element={<AccountsManagement />} />
        <Route path="/transactions" element={<TransactionsManagement />} />
        <Route path="/settings" element={
          <div className="text-center py-12">
            <FiUsers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Settings page coming soon...</p>
          </div>
        } />
        {/* Default redirect to overview */}
        <Route path="*" element={<AdminOverview />} />
      </Routes>
    </Layout>
  );
}
