import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import TransactionTable from '../components/TransactionTable';
import { 
  FiUsers, 
  FiActivity, 
  FiDownload, 
  FiUpload,
  FiDollarSign,
  FiSearch
} from 'react-icons/fi';
import { userAPI, transactionAPI, dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { User, Transaction } from '../types';

export default function TellerDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    todayTransactions: 0,
    todayDeposits: 0,
    todayWithdrawals: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    type: 'DEPOSIT' as 'DEPOSIT' | 'WITHDRAWAL',
    accountId: '',
    amount: '',
    description: '',
  });
  const [submittingTransaction, setSubmittingTransaction] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [customersData, transactionsData, statsData] = await Promise.all([
        userAPI.getAllUsers().then(result => result.content.filter(u => u.role === 'CUSTOMER')).catch(() => []),
        transactionAPI.getAllTransactions(0, 20).catch(() => ({ content: [] })),
        dashboardAPI.getTellerStats().catch(() => ({})),
      ]);

      setCustomers(customersData);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : transactionsData.content || []);
      
      // Calculate stats
      const today = new Date().toDateString();
      const todayTransactions = Array.isArray(transactionsData) 
        ? transactionsData.filter(t => new Date(t.createdAt).toDateString() === today)
        : (transactionsData.content || []).filter((t: Transaction) => new Date(t.createdAt).toDateString() === today);
      
      setStats({
        totalCustomers: customersData.length,
        todayTransactions: todayTransactions.length,
        todayDeposits: todayTransactions.filter((t: Transaction) => t.type === 'DEPOSIT').length,
        todayWithdrawals: todayTransactions.filter((t: Transaction) => t.type === 'WITHDRAWAL').length,
        ...statsData,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionForm.accountId || !transactionForm.amount) {
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
          transactionForm.accountId,
          parseFloat(transactionForm.amount),
          transactionForm.description
        );
      } else {
        await transactionAPI.withdraw(
          transactionForm.accountId,
          parseFloat(transactionForm.amount),
          transactionForm.description
        );
      }
      
      toast.success(`${transactionForm.type.toLowerCase()} completed successfully`);
      setTransactionForm({
        type: 'DEPOSIT',
        accountId: '',
        amount: '',
        description: '',
      });
      loadDashboardData();
    } catch (error: any) {
      console.error('Transaction error:', error);
      const errorMessage = error.response?.data?.message || 'Transaction failed';
      toast.error(errorMessage);
    } finally {
      setSubmittingTransaction(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout title="Teller Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Teller Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
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

        {/* Transaction Processing and Customer Search */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Form */}
          <Card title="Process Transaction" icon={<FiDollarSign />}>
            <form onSubmit={handleTransactionSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type *
                </label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'DEPOSIT' | 'WITHDRAWAL' 
                  }))}
                  className="input-field"
                >
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account ID *
                </label>
                <input
                  type="text"
                  value={transactionForm.accountId}
                  onChange={(e) => setTransactionForm(prev => ({ 
                    ...prev, 
                    accountId: e.target.value 
                  }))}
                  className="input-field"
                  placeholder="Enter account ID"
                  required
                />
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
                  onChange={(e) => setTransactionForm(prev => ({ 
                    ...prev, 
                    amount: e.target.value 
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
                  onChange={(e) => setTransactionForm(prev => ({ 
                    ...prev, 
                    description: e.target.value 
                  }))}
                  className="input-field"
                  rows={3}
                  placeholder="Optional transaction note..."
                />
              </div>

              <button
                type="submit"
                disabled={submittingTransaction}
                className="w-full btn-primary"
              >
                {submittingTransaction ? 'Processing...' : `Process ${transactionForm.type}`}
              </button>
            </form>
          </Card>

          {/* Customer Search */}
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
                  <div 
                    key={customer.id} 
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                        {customer.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.username}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </div>
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

        {/* Recent Transactions */}
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
    </Layout>
  );
}
