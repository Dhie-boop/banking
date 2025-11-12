import { useState, useEffect, useCallback } from 'react';
import { 
  FiCreditCard, 
  FiPlus, 
  FiEye, 
  FiTrash2, 
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiUser
} from 'react-icons/fi';
import { accountAPI, userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import type { Account, User, CreateAccountRequest } from '../../types';
import { normalizeAccountsResponse } from '../../utils/apiUtils';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: CreateAccountRequest & { userId?: string }) => void;
  mode: 'create';
}

function AccountModal({ isOpen, onClose, onSave }: AccountModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState({
    accountType: 'CHECKING' as 'CHECKING' | 'SAVINGS',
    userId: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const userData = await userAPI.getAllUsers();
      // Handle paginated response and filter to only show customers for account creation
      const users = Array.isArray(userData) ? userData : userData.content || [];
      setUsers(users.filter(user => user.role === 'CUSTOMER'));
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              required
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a customer</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              value={formData.accountType}
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'CHECKING' | 'SAVINGS' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CHECKING">Checking Account</option>
              <option value="SAVINGS">Savings Account</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
}

function AccountDetailsModal({ isOpen, onClose, account }: AccountDetailsModalProps) {
  if (!isOpen || !account) return null;

  const accountHolderName = account.user?.username || account.ownerName || 'Unknown User';
  const accountHolderEmail = account.user?.email || account.user?.username || undefined;
  const initials = accountHolderName.charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Account Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Number</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{account.accountNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <p className="mt-1 text-sm text-gray-900">{account.accountType}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Balance</label>
            <p className="mt-1 text-lg font-bold text-green-600">
              ${account.balance.toFixed(2)}
            </p>
          </div>

          {(account.user || account.ownerName) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Account Holder</label>
              <div className="mt-1 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{accountHolderName}</p>
                  {accountHolderEmail && (
                    <p className="text-sm text-gray-500">{accountHolderEmail}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Created Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(account.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  accountNumber: string;
}

function DeleteConfirmation({ isOpen, onClose, onConfirm, accountNumber }: DeleteConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Confirm Delete</h2>
        <p className="text-gray-700 mb-6">
          Are you sure you want to delete account <strong>{accountNumber}</strong>? 
          This action cannot be undone and will remove all associated data.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountsManagement() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CHECKING' | 'SAVINGS'>('ALL');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const filterAccounts = useCallback(() => {
    let filtered = accounts;

    // Apply search filter
    if (searchTerm) {
      const lowered = searchTerm.toLowerCase();
      filtered = filtered.filter(account => {
        const username = account.user?.username?.toLowerCase();
        const email = account.user?.email?.toLowerCase();
        const owner = account.ownerName?.toLowerCase();

        return (
          account.accountNumber.toLowerCase().includes(lowered) ||
          (username?.includes(lowered) ?? false) ||
          (email?.includes(lowered) ?? false) ||
          (owner?.includes(lowered) ?? false)
        );
      });
    }

    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(account => account.accountType === typeFilter);
    }

    setFilteredAccounts(filtered);
  }, [accounts, searchTerm, typeFilter]);

  useEffect(() => {
    filterAccounts();
  }, [filterAccounts]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountAPI.getAllAccounts();
      const normalized = normalizeAccountsResponse(data);
      setAccounts(normalized);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    setShowAccountModal(true);
  };

  const handleViewAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowDetailsModal(true);
  };

  const handleDeleteAccount = (account: Account) => {
    setSelectedAccount(account);
    setShowDeleteModal(true);
  };

  const handleSaveAccount = async (accountData: CreateAccountRequest & { userId?: string }) => {
    try {
      // Note: This assumes the backend createAccount endpoint accepts userId
      // You may need to modify the backend to support admin creating accounts for users
      await accountAPI.createAccount(accountData);
      toast.success('Account created successfully');
      setShowAccountModal(false);
      await loadAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
      toast.error('Failed to create account');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAccount) return;

    try {
      await accountAPI.deleteAccount(selectedAccount.id);
      toast.success('Account deleted successfully');
      setShowDeleteModal(false);
      await loadAccounts();
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'CHECKING': return 'bg-blue-100 text-blue-800';
      case 'SAVINGS': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalBalance = () => {
    return filteredAccounts.reduce((sum, account) => sum + account.balance, 0);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Accounts Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <FiCreditCard className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Accounts Management</h1>
        </div>
        <button
          onClick={handleCreateAccount}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <FiPlus className="h-4 w-4" />
          <span>Create Account</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FiCreditCard className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{filteredAccounts.length}</p>
              <p className="text-gray-500">Total Accounts</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FiDollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">${getTotalBalance().toFixed(2)}</p>
              <p className="text-gray-500">Total Balance</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FiUser className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {new Set(filteredAccounts.filter(a => a.userId).map(a => a.userId)).size}
              </p>
              <p className="text-gray-500">Account Holders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'CHECKING' | 'SAVINGS')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Types</option>
              <option value="CHECKING">Checking</option>
              <option value="SAVINGS">Savings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Holder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiCreditCard className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {account.accountNumber}
                        </div>
                        <div className="text-sm text-gray-500">ID: {account.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {account.user ? (
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {(account.user?.username || account.ownerName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{account.user?.username || account.ownerName || 'Unknown User'}</div>
                          {(account.user?.email || account.user?.username) && (
                            <div className="text-sm text-gray-500">{account.user?.email || account.user?.username}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown User</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.accountType)}`}>
                      {account.accountType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${account.balance.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button
                      onClick={() => handleViewAccount(account)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="View Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Delete Account"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <FiCreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'ALL' ? 'No accounts match your filters' : 'No accounts found'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        onSave={handleSaveAccount}
        mode="create"
      />

      <AccountDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        account={selectedAccount}
      />

      <DeleteConfirmation
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        accountNumber={selectedAccount?.accountNumber || ''}
      />
    </div>
  );
}