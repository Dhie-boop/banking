import { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card';
import TransactionTable from '../../components/TransactionTable';
import {
  FiUsers,
  FiActivity,
  FiDownload,
  FiUpload,
  FiDollarSign,
  FiSearch,
} from 'react-icons/fi';
import { accountAPI, userAPI, transactionAPI, dashboardAPI } from '../../services/api';
import { toast } from 'react-toastify';
import type { Account, Transaction, User } from '../../types';
import {
  normalizeAccountsResponse,
  normalizeObjectResponse,
  normalizeTransactionsResponse,
  normalizeUsersResponse,
} from '../../utils/apiUtils';
import { formatCurrency } from '../../utils/currency';

export default function TellerOverview() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todayTransactions: 0,
    todayDeposits: 0,
    todayWithdrawals: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsByUser, setAccountsByUser] = useState<Record<string, Account[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionForm, setTransactionForm] = useState({
    type: 'DEPOSIT' as 'DEPOSIT' | 'WITHDRAWAL',
    accountNumber: '',
    amount: '',
    description: '',
  });
  const [submittingTransaction, setSubmittingTransaction] = useState(false);

  const selectedAccount = useMemo(() => {
    if (!transactionForm.accountNumber) {
      return undefined;
    }
    return accounts.find((account) => account.accountNumber === transactionForm.accountNumber);
  }, [accounts, transactionForm.accountNumber]);

  useEffect(() => {
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    const failedSections: string[] = [];

    try {
      const [customersResult, transactionsResult, statsResult, accountsResult] = await Promise.allSettled([
        userAPI.getCustomers(),
        transactionAPI.getStaffTransactions(0, 25),
        dashboardAPI.getTellerStats(),
        accountAPI.getAllAccounts(),
      ]);

      if (customersResult.status === 'rejected') {
        console.error('Error loading users:', customersResult.reason);
        failedSections.push('users');
      }
      if (transactionsResult.status === 'rejected') {
        console.error('Error loading transactions:', transactionsResult.reason);
        failedSections.push('transactions');
      }
      if (statsResult.status === 'rejected') {
        console.error('Error loading stats:', statsResult.reason);
        failedSections.push('stats');
      }
      if (accountsResult.status === 'rejected') {
        console.error('Error loading accounts:', accountsResult.reason);
        failedSections.push('accounts');
      }

      const customersData = normalizeUsersResponse(
        customersResult.status === 'fulfilled' ? customersResult.value : []
      );
      const transactionsData = normalizeTransactionsResponse(
        transactionsResult.status === 'fulfilled' ? transactionsResult.value : []
      );
      const statsData = normalizeObjectResponse<Partial<typeof stats>>(
        statsResult.status === 'fulfilled' ? statsResult.value : {}
      );
      const accountsData = normalizeAccountsResponse(
        accountsResult.status === 'fulfilled' ? accountsResult.value : []
      ).filter((account) => account.isActive !== false);

      const groupedAccounts = accountsData.reduce<Record<string, Account[]>>((acc, account) => {
        const ownerId = account.userId ?? account.user?.id;
        if (!ownerId) {
          return acc;
        }

        const key = String(ownerId);
        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(account);
        return acc;
      }, {});

      setCustomers(customersData);
      setTransactions(transactionsData);
      setAccounts(accountsData);
      setAccountsByUser(groupedAccounts);

      const today = new Date().toDateString();
      const todayTransactions = transactionsData.filter((t: Transaction) =>
        new Date(t.createdAt).toDateString() === today
      );

      const tellerStats = {
        totalCustomers: statsData.totalCustomers ?? customersData.length,
        todayTransactions: statsData.todayTransactions ?? todayTransactions.length,
        todayDeposits:
          statsData.todayDeposits ?? todayTransactions.filter((t) => t.type === 'DEPOSIT').length,
        todayWithdrawals:
          statsData.todayWithdrawals ?? todayTransactions.filter((t) => t.type === 'WITHDRAWAL').length,
      };

      setStats(tellerStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      failedSections.push('dashboard');
    } finally {
      setLoading(false);

      if (failedSections.length > 0) {
        const hasCriticalError = failedSections.includes('dashboard') || failedSections.length === 3;
        const message = hasCriticalError
          ? 'Failed to load dashboard data'
          : `Partial data loaded. Issues with: ${failedSections.join(', ')}`;
        (hasCriticalError ? toast.error : toast.warn)(message);
      }
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionForm.accountNumber || !transactionForm.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(transactionForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setSubmittingTransaction(true);
    try {
      if (transactionForm.type === 'DEPOSIT') {
        await transactionAPI.deposit(
          transactionForm.accountNumber,
          parseFloat(transactionForm.amount),
          transactionForm.description
        );
      } else {
        await transactionAPI.withdraw(
          transactionForm.accountNumber,
          parseFloat(transactionForm.amount),
          transactionForm.description
        );
      }

      toast.success(`${transactionForm.type.toLowerCase()} completed successfully`);
      setTransactionForm({
        type: 'DEPOSIT',
        accountNumber: '',
        amount: '',
        description: '',
      });
      void loadDashboardData();
    } catch (error: any) {
      console.error('Transaction error:', error);
      const errorMessage = error.response?.data?.message || 'Transaction failed';
      toast.error(errorMessage);
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm) {
      return true;
    }

    const term = searchTerm.toLowerCase();
    const matchesIdentity =
      customer.username.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term);

    const userAccounts = accountsByUser[customer.id] ?? [];
    const matchesAccount = userAccounts.some((account) =>
      account.accountNumber.toLowerCase().includes(term)
    );

    return matchesIdentity || matchesAccount;
  });

  const handleAccountSelect = (accountNumber: string) => {
    setTransactionForm((prev) => ({
      ...prev,
      accountNumber,
    }));
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Customers"
          icon={<FiUsers />}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
        >
          <p className="text-3xl font-bold text-white">{stats.totalCustomers}</p>
          <p className="text-blue-100 text-sm">Active customers</p>
        </Card>

        <Card title="Today's Transactions" icon={<FiActivity />}>
          <p className="text-3xl font-bold text-gray-900">{stats.todayTransactions}</p>
          <p className="text-gray-500 text-sm">Processed today</p>
        </Card>

        <Card title="Today's Deposits" icon={<FiDownload />}>
          <p className="text-3xl font-bold text-green-600">{stats.todayDeposits}</p>
          <p className="text-gray-500 text-sm">Cash deposits</p>
        </Card>

        <Card title="Today's Withdrawals" icon={<FiUpload />}>
          <p className="text-3xl font-bold text-red-600">{stats.todayWithdrawals}</p>
          <p className="text-gray-500 text-sm">Cash withdrawals</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Process Transaction" icon={<FiDollarSign />}>
          <form onSubmit={handleTransactionSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type *
              </label>
              <select
                value={transactionForm.type}
                onChange={(e) => setTransactionForm((prev) => ({
                  ...prev,
                  type: e.target.value as 'DEPOSIT' | 'WITHDRAWAL',
                }))}
                className="input-field"
              >
                <option value="DEPOSIT">Deposit</option>
                <option value="WITHDRAWAL">Withdrawal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                value={transactionForm.accountNumber}
                onChange={(e) => setTransactionForm((prev) => ({
                  ...prev,
                  accountNumber: e.target.value,
                }))}
                className="input-field"
                placeholder="Start typing to search accounts"
                list="teller-account-options"
                required
              />
              <datalist id="teller-account-options">
                {accounts.map((account) => {
                  const ownerLabel =
                    account.ownerName ||
                    account.user?.fullName ||
                    account.user?.username ||
                    'Account holder';
                  return (
                    <option key={account.id} value={account.accountNumber}>
                      {`${account.accountNumber} — ${ownerLabel}`}
                    </option>
                  );
                })}
              </datalist>
              {selectedAccount && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <p className="font-medium">
                    {selectedAccount.accountNumber} • {selectedAccount.accountType}
                  </p>
                  <p className="mt-1">
                    Holder:{' '}
                    {selectedAccount.ownerName ||
                      selectedAccount.user?.fullName ||
                      selectedAccount.user?.username ||
                      'N/A'}
                  </p>
                  <p className="mt-1">Balance: {formatCurrency(selectedAccount.balance)}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={transactionForm.amount}
                onChange={(e) => setTransactionForm((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))}
                className="input-field"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={transactionForm.description}
                onChange={(e) => setTransactionForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))}
                className="input-field"
                rows={3}
                placeholder="Optional transaction note..."
              />
            </div>

            <button type="submit" disabled={submittingTransaction} className="w-full btn-primary">
              {submittingTransaction ? 'Processing...' : `Process ${transactionForm.type}`}
            </button>
          </form>
        </Card>

        <Card title="Customer Lookup" icon={<FiUsers />}>
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
                placeholder="Search customers..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredCustomers.map((customer) => (
                <div key={customer.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                      {customer.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.username}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(accountsByUser[customer.id] ?? []).map((account) => (
                      <button
                        type="button"
                        key={account.id}
                        onClick={() => handleAccountSelect(account.accountNumber)}
                        className="px-3 py-1 text-xs font-medium bg-white border border-blue-100 text-blue-700 rounded-full hover:bg-blue-50"
                      >
                        {account.accountNumber}
                      </button>
                    ))}
                    {(accountsByUser[customer.id] ?? []).length === 0 && (
                      <span className="text-xs text-gray-400">No active accounts</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && searchTerm && (
                <p className="text-gray-500 text-center py-4">No customers found</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Transactions">
        {transactions.length > 0 ? (
          <TransactionTable transactions={transactions.slice(0, 10)} />
        ) : (
          <div className="text-center py-12">
            <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions found</p>
            <p className="text-sm text-gray-400">Recent transactions will appear here</p>
          </div>
        )}
      </Card>
    </div>
  );
}
