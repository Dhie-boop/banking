import { useState, useEffect, useCallback } from 'react';
import { 
  FiActivity, 
  FiEye, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw
} from 'react-icons/fi';
import { transactionAPI } from '../../services/api';
import { toast } from 'react-toastify';
import type { Transaction } from '../../types';
import { normalizeTransactionsResponse } from '../../utils/apiUtils';
import { formatCurrency } from '../../utils/currency';

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

function TransactionDetailsModal({ isOpen, onClose, transaction }: TransactionDetailsModalProps) {
  if (!isOpen || !transaction) return null;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <FiTrendingUp className="h-6 w-6 text-green-600" />;
      case 'WITHDRAWAL': return <FiTrendingDown className="h-6 w-6 text-red-600" />;
      case 'TRANSFER': return <FiRefreshCw className="h-6 w-6 text-blue-600" />;
      default: return <FiActivity className="h-6 w-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            {getTransactionIcon(transaction.type)}
            <h2 className="text-xl font-semibold">Transaction Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Transaction Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{transaction.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="mt-1 text-sm text-gray-900">{transaction.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {formatCurrency(Math.abs(transaction.amount))}
              </p>
            </div>
          </div>

          {/* Account Information */}
          {transaction.type === 'TRANSFER' && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Transfer Details</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">From Account</label>
                  {transaction.fromAccount ? (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900">{transaction.fromAccount.accountNumber}</p>
                      <p className="text-sm text-gray-500">{transaction.fromAccount.accountType}</p>
                      {transaction.fromAccount.user && (
                        <p className="text-sm text-gray-500">{transaction.fromAccount.user.username}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">N/A</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">To Account</label>
                  {transaction.toAccount ? (
                    <div className="mt-1 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900">{transaction.toAccount.accountNumber}</p>
                      <p className="text-sm text-gray-500">{transaction.toAccount.accountType}</p>
                      {transaction.toAccount.user && (
                        <p className="text-sm text-gray-500">{transaction.toAccount.user.username}</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-gray-500">N/A</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {(transaction.type === 'DEPOSIT' || transaction.type === 'WITHDRAWAL') && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              {transaction.toAccount || transaction.fromAccount ? (
                <div className="p-3 bg-gray-50 rounded-md">
                  {transaction.toAccount && (
                    <>
                      <p className="text-sm font-medium text-gray-900">{transaction.toAccount.accountNumber}</p>
                      <p className="text-sm text-gray-500">{transaction.toAccount.accountType}</p>
                      {transaction.toAccount.user && (
                        <p className="text-sm text-gray-500">{transaction.toAccount.user.username}</p>
                      )}
                    </>
                  )}
                  {transaction.fromAccount && (
                    <>
                      <p className="text-sm font-medium text-gray-900">{transaction.fromAccount.accountNumber}</p>
                      <p className="text-sm text-gray-500">{transaction.fromAccount.accountType}</p>
                      {transaction.fromAccount.user && (
                        <p className="text-sm text-gray-500">{transaction.fromAccount.user.username}</p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Account information not available</p>
              )}
            </div>
          )}

          {/* Description */}
          {transaction.description && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{transaction.description}</p>
            </div>
          )}

          {/* Timestamp */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Transaction Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(transaction.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
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

export default function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED'>('ALL');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 20
  });

  const loadTransactions = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const response = await transactionAPI.getAllTransactions(page, pagination.size);
      const normalized = normalizeTransactionsResponse(response);

      setTransactions(normalized);
      setFilteredTransactions(normalized);

      if (response && typeof response === 'object') {
        const paginated = response as Partial<{ totalPages: number; totalElements: number }>;
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalPages: paginated.totalPages ?? prev.totalPages,
          totalElements: paginated.totalElements ?? normalized.length,
        }));
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [pagination.size]);

  useEffect(() => {
    loadTransactions(pagination.currentPage);
  }, [loadTransactions, pagination.currentPage]);

  const applyFilters = useCallback(() => {
    let filtered = [...transactions];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((transaction) => {
        const sourceNumber = transaction.sourceAccountNumber ?? transaction.fromAccount?.accountNumber;
        const targetNumber = transaction.targetAccountNumber ?? transaction.toAccount?.accountNumber;

        return (
          transaction.id.toLowerCase().includes(term) ||
          transaction.description?.toLowerCase().includes(term) ||
          sourceNumber?.toLowerCase().includes(term) ||
          targetNumber?.toLowerCase().includes(term)
        );
      });
    }

    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return 'bg-green-100 text-green-800';
      case 'WITHDRAWAL': return 'bg-red-100 text-red-800';
      case 'TRANSFER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT': return <FiTrendingUp className="h-4 w-4 text-green-600" />;
      case 'WITHDRAWAL': return <FiTrendingDown className="h-4 w-4 text-red-600" />;
      case 'TRANSFER': return <FiRefreshCw className="h-4 w-4 text-blue-600" />;
      default: return <FiActivity className="h-4 w-4 text-gray-600" />;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Transactions Management</h1>
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
          <FiActivity className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Transactions Management</h1>
        </div>
        <button
          onClick={() => loadTransactions(pagination.currentPage)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <FiRefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FiActivity className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{filteredTransactions.length}</p>
              <p className="text-gray-500">Total Transactions</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FiTrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {filteredTransactions.filter(t => t.type === 'DEPOSIT').length}
              </p>
              <p className="text-gray-500">Deposits</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FiTrendingDown className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {filteredTransactions.filter(t => t.type === 'WITHDRAWAL').length}
              </p>
              <p className="text-gray-500">Withdrawals</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <FiRefreshCw className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">
                {filteredTransactions.filter(t => t.type === 'TRANSFER').length}
              </p>
              <p className="text-gray-500">Transfers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Types</option>
                <option value="DEPOSIT">Deposits</option>
                <option value="WITHDRAWAL">Withdrawals</option>
                <option value="TRANSFER">Transfers</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'PENDING' | 'COMPLETED' | 'FAILED')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2">
              <FiDownload className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTransactionIcon(transaction.type)}
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {transaction.id.substring(0, 8)}...
                        </div>
                        {transaction.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-xs text-gray-500">
                      {transaction.type === 'TRANSFER' ? (
                        <>
                          <div>From: {transaction.fromAccount?.accountNumber || 'N/A'}</div>
                          <div>To: {transaction.toAccount?.accountNumber || 'N/A'}</div>
                        </>
                      ) : (
                        <div>
                          {transaction.toAccount?.accountNumber || transaction.fromAccount?.accountNumber || 'N/A'}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleViewTransaction(transaction)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="View Details"
                    >
                      <FiEye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <FiActivity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL' 
                ? 'No transactions match your filters' 
                : 'No transactions found'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 rounded-lg shadow-sm">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
              disabled={pagination.currentPage === 0}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
              disabled={pagination.currentPage >= pagination.totalPages - 1}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{pagination.currentPage * pagination.size + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min((pagination.currentPage + 1) * pagination.size, pagination.totalElements)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalElements}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(Math.max(0, pagination.currentPage - 1))}
                  disabled={pagination.currentPage === 0}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum = i;
                  if (pagination.totalPages > 5) {
                    const start = Math.max(0, pagination.currentPage - 2);
                    const end = Math.min(pagination.totalPages, start + 5);
                    pageNum = start + i;
                    if (pageNum >= end) return null;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pageNum === pagination.currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(Math.min(pagination.totalPages - 1, pagination.currentPage + 1))}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <TransactionDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        transaction={selectedTransaction}
      />
    </div>
  );
}