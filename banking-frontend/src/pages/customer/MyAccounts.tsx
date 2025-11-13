import { useEffect, useMemo, useState } from 'react';
import { FiCreditCard, FiDollarSign, FiLock, FiPlus, FiTrash2 } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { accountAPI } from '../../services/api';
import type { Account } from '../../types';
import { toast } from 'react-toastify';
import { normalizeAccountsResponse } from '../../utils/apiUtils';
import { formatCurrency } from '../../utils/currency';

interface AccountAction {
  id: string;
  label: string;
  onClick: () => void;
}

export default function MyAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<'CHECKING' | 'SAVINGS' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await accountAPI.getMyAccounts();
      setAccounts(normalizeAccountsResponse(data));
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Unable to load accounts right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (type: 'CHECKING' | 'SAVINGS') => {
    setCreating(type);
    try {
      await accountAPI.createAccount({ accountType: type });
      toast.success(`${type.toLowerCase()} account created.`);
      await loadAccounts();
    } catch (error: any) {
      console.error('Create account error:', error);
      const message = error.response?.data?.message ?? 'Unable to create account.';
      toast.error(message);
    } finally {
      setCreating(null);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find((item) => item.id === accountId);
    const label = account ? account.accountNumber : 'this account';
    const confirmed = window.confirm(`Are you sure you want to close ${label}?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(accountId);
    try {
      await accountAPI.deactivateAccount(accountId);
      toast.success('Account closed successfully.');
      await loadAccounts();
    } catch (error: any) {
      console.error('Delete account error:', error);
      const message = error.response?.data?.message ?? 'Unable to close account.';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const totalBalance = useMemo(() => (
    accounts.reduce((sum, account) => sum + (account.balance ?? 0), 0)
  ), [accounts]);

  const accountActions = (account: Account): AccountAction[] => [
    {
      id: 'close',
      label: deletingId === account.id ? 'Closing…' : 'Close Account',
      onClick: () => handleDeleteAccount(account.id),
    },
  ];

  return (
    <Layout title="My Accounts">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <FiCreditCard className="text-blue-600" size={26} />
              <div>
                <p className="text-sm text-gray-500">Active Accounts</p>
                <p className="text-2xl font-bold text-gray-900">{accounts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <FiDollarSign className="text-green-600" size={26} />
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3">
              <FiLock className="text-purple-600" size={26} />
              <div>
                <p className="text-sm text-gray-500">Secure Banking</p>
                <p className="text-sm text-gray-700">Manage, create, or close accounts anytime.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Accounts</h2>
              <p className="text-sm text-gray-500">Create new accounts or manage existing ones.</p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary"
                onClick={() => handleCreateAccount('CHECKING')}
                disabled={creating !== null}
              >
                <FiPlus className="mr-2" />
                {creating === 'CHECKING' ? 'Creating…' : 'New Checking'}
              </button>
              <button
                className="btn-primary"
                onClick={() => handleCreateAccount('SAVINGS')}
                disabled={creating !== null}
              >
                <FiPlus className="mr-2" />
                {creating === 'SAVINGS' ? 'Creating…' : 'New Savings'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-20 bg-gray-100 rounded-md" />
                ))}
              </div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              You do not have any accounts yet. Create one to get started.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {accounts.map((account) => (
                <li key={account.id} className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FiCreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm uppercase tracking-wide text-gray-500">{account.accountType} Account</p>
                      <p className="text-lg font-semibold text-gray-900 font-mono">{account.accountNumber}</p>
                      <p className="text-sm text-gray-500">Balance: {formatCurrency(account.balance)}</p>
                      <p className="text-xs text-gray-400 mt-1">Opened {new Date(account.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {accountActions(account).map((action) => (
                      <button
                        key={action.id}
                        className="btn-secondary text-sm"
                        onClick={action.onClick}
                        disabled={deletingId === account.id}
                      >
                        {action.id === 'close' && <FiTrash2 className="mr-2" />} {action.label}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}
