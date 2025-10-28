import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import TransactionTable from '../components/TransactionTable';
import TransferModal from '../components/TransferModal';
import { 
  FiCreditCard, 
  FiTrendingUp, 
  FiActivity,
  FiPlus,
  FiSend,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { accountAPI, transactionAPI, dashboardAPI } from '../services/api';
import { toast } from 'react-toastify';
import type { Account, Transaction, DashboardStats } from '../types';

export default function CustomerDashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [accountsData, transactionsData, statsData] = await Promise.all([
        accountAPI.getMyAccounts(),
        transactionAPI.getMyTransactions(0, 5),
        dashboardAPI.getCustomerStats().catch(() => ({})),
      ]);

      setAccounts(accountsData);
      setTransactions(transactionsData.content || transactionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const createNewAccount = async (accountType: 'CHECKING' | 'SAVINGS') => {
    try {
      await accountAPI.createAccount({ accountType });
      toast.success(`${accountType.toLowerCase()} account created successfully`);
      loadDashboardData();
    } catch (error: any) {
      console.error('Error creating account:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create account';
      toast.error(errorMessage);
    }
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const handleTransfer = (accountId: string) => {
    setSelectedAccountId(accountId);
    setIsTransferModalOpen(true);
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Balance */}
          <Card 
            title="Total Balance" 
            icon={<FiCreditCard />}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {showBalance 
                    ? `$${totalBalance.toFixed(2)}` 
                    : '••••••'
                  }
                </p>
                <p className="text-blue-100 text-sm">Across {accounts.length} accounts</p>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-white hover:text-blue-100"
              >
                {showBalance ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
          </Card>

          {/* Accounts */}
          <Card title="Active Accounts" icon={<FiCreditCard />}>
            <div>
              <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
              <p className="text-gray-500 text-sm">Total accounts</p>
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card title="This Month" icon={<FiActivity />}>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.recentTransactions || 0}</p>
              <p className="text-gray-500 text-sm">Transactions</p>
            </div>
          </Card>

          {/* Quick Transfer */}
          <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="w-full text-center"
            >
              <FiSend className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-600">Quick Transfer</p>
              <p className="text-xs text-gray-500">Send money instantly</p>
            </button>
          </Card>
        </div>

        {/* Accounts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="My Accounts">
            <div className="space-y-4">
              {accounts.map((account) => (
                <div 
                  key={account.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-lg flex items-center justify-center">
                      <FiCreditCard />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {account.accountType} Account
                      </h4>
                      <p className="text-sm text-gray-500">{account.accountNumber}</p>
                      <p className="text-sm font-medium text-gray-900">
                        ${account.balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleTransfer(account.id)}
                    className="btn-primary text-sm"
                  >
                    Transfer
                  </button>
                </div>
              ))}
              
              {/* Add Account Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => createNewAccount('CHECKING')}
                  className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <FiPlus className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Add Checking</span>
                </button>
                <button
                  onClick={() => createNewAccount('SAVINGS')}
                  className="flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <FiPlus className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">Add Savings</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
              >
                <FiSend className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-800">Transfer Money</p>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
                <FiTrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">View Statements</p>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center">
                <FiActivity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-purple-800">Transaction History</p>
              </button>
              <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center">
                <FiCreditCard className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-orange-800">Account Settings</p>
              </button>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card title="Recent Transactions">
          {transactions.length > 0 ? (
            <TransactionTable transactions={transactions} />
          ) : (
            <div className="text-center py-12">
              <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your recent transactions will appear here</p>
            </div>
          )}
        </Card>
      </div>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onTransferComplete={loadDashboardData}
        fromAccountId={selectedAccountId}
      />
    </Layout>
  );
}
