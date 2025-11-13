import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiActivity, FiFilter, FiRefreshCcw, FiSearch } from 'react-icons/fi';
import Layout from '../../components/Layout';
import TransactionTable from '../../components/TransactionTable';
import { transactionAPI, accountAPI } from '../../services/api';
import type { Account, Transaction } from '../../types';
import { toast } from 'react-toastify';
import { normalizeTransactionsResponse, normalizeAccountsResponse } from '../../utils/apiUtils';
import { formatCurrency } from '../../utils/currency';

interface Filters {
  accountNumber: string;
  type: 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER';
  search: string;
}

export default function CustomerTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({ accountNumber: 'ALL', type: 'ALL', search: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const failedSections: string[] = [];

    try {
      const [transactionsResult, accountsResult] = await Promise.allSettled([
        transactionAPI.getMyTransactions(0, 100),
        accountAPI.getMyAccounts(),
      ]);

      if (transactionsResult.status === 'fulfilled') {
        const normalizedTransactions = normalizeTransactionsResponse(transactionsResult.value);
        setTransactions(normalizedTransactions);
        setFilteredTransactions(normalizedTransactions);
      } else {
        failedSections.push('transactions');
        console.error('Failed to load transactions:', transactionsResult.reason);
        setTransactions([]);
        setFilteredTransactions([]);
      }

      if (accountsResult.status === 'fulfilled') {
        const normalizedAccounts = normalizeAccountsResponse(accountsResult.value);
        setAccounts(normalizedAccounts);
      } else {
        failedSections.push('accounts');
        console.error('Failed to load accounts:', accountsResult.reason);
        setAccounts([]);
      }

      if (failedSections.length > 0) {
        const message = failedSections.length === 2
          ? 'Unable to load your transactions data right now.'
          : `Unable to load ${failedSections[0]} right now.`;
        const notifier = failedSections.length === 2 ? toast.error : toast.warn;
        notifier(message);
      }
    } catch (error) {
      console.error('Unexpected error while loading transactions data:', error);
      toast.error('Unable to load your transactions right now.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let results = [...transactions];

    if (filters.accountNumber !== 'ALL') {
      results = results.filter((transaction) => (
        transaction.sourceAccountNumber === filters.accountNumber ||
        transaction.targetAccountNumber === filters.accountNumber ||
        transaction.fromAccount?.accountNumber === filters.accountNumber ||
        transaction.toAccount?.accountNumber === filters.accountNumber
      ));
    }

    if (filters.type !== 'ALL') {
      results = results.filter((transaction) => transaction.type === filters.type);
    }

    if (filters.search.trim()) {
      const term = filters.search.toLowerCase();
      results = results.filter((transaction) => (
        transaction.id.toLowerCase().includes(term) ||
        transaction.description?.toLowerCase().includes(term) ||
        transaction.referenceNumber?.toLowerCase().includes(term) ||
        transaction.sourceAccountNumber?.toLowerCase().includes(term) ||
        transaction.targetAccountNumber?.toLowerCase().includes(term)
      ));
    }

    setFilteredTransactions(results);
  }, [transactions, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const totals = useMemo(() => ({
    deposits: filteredTransactions
      .filter((transaction) => transaction.type === 'DEPOSIT')
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    withdrawals: filteredTransactions
      .filter((transaction) => transaction.type === 'WITHDRAWAL')
      .reduce((sum, transaction) => sum + transaction.amount, 0),
    transfers: filteredTransactions
      .filter((transaction) => transaction.type === 'TRANSFER')
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  }), [filteredTransactions]);

  return (
    <Layout title="Transactions">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <p className="text-sm text-gray-500">Deposits</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totals.deposits)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <p className="text-sm text-gray-500">Withdrawals</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totals.withdrawals)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <p className="text-sm text-gray-500">Transfers</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totals.transfers)}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <FiActivity className="text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <button
              className="btn-secondary text-sm"
              onClick={loadData}
              disabled={loading}
            >
              <FiRefreshCcw className="mr-2" />
              Refresh
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                  placeholder="Search by ID, note, or account number"
                  className="input-field pl-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  className="input-field"
                  value={filters.type}
                  onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value as Filters['type'] }))}
                >
                  <option value="ALL">All Types</option>
                  <option value="DEPOSIT">Deposits</option>
                  <option value="WITHDRAWAL">Withdrawals</option>
                  <option value="TRANSFER">Transfers</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  className="input-field"
                  value={filters.accountNumber}
                  onChange={(event) => setFilters((prev) => ({ ...prev, accountNumber: event.target.value }))}
                >
                  <option value="ALL">All Accounts</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.accountNumber}>
                      {account.accountNumber}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="h-14 bg-gray-100 rounded" />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                You do not have matching transactions yet.
              </div>
            ) : (
              <TransactionTable transactions={filteredTransactions} />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
