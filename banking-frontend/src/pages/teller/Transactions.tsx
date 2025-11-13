import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import TransactionTable from '../../components/TransactionTable';
import { FiActivity, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { transactionAPI } from '../../services/api';
import { toast } from 'react-toastify';
import type { Transaction } from '../../types';
import { normalizeTransactionsResponse } from '../../utils/apiUtils';

const PAGE_SIZE = 20;

export default function TellerTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [typeFilter, setTypeFilter] = useState<'ALL' | Transaction['type']>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void loadTransactions(page);
  }, [page]);

  const loadTransactions = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await transactionAPI.getStaffTransactions(pageNumber, PAGE_SIZE);
      const normalized = normalizeTransactionsResponse(response);
      setTransactions(normalized);
      setTotalPages(response.totalPages ?? 0);
    } catch (error) {
      console.error('Error loading teller transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesType =
        typeFilter === 'ALL' ? true : transaction.type === typeFilter;
      if (!matchesType) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const term = searchTerm.toLowerCase();
      return (
        transaction.referenceNumber?.toLowerCase().includes(term) ||
        transaction.sourceAccountNumber?.toLowerCase().includes(term) ||
        transaction.targetAccountNumber?.toLowerCase().includes(term) ||
        transaction.description?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, transactions, typeFilter]);

  const handleRefresh = () => {
    void loadTransactions(page);
  };

  return (
    <div className="space-y-6">
      <Card title="Transactions" icon={<FiActivity />}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setTypeFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  typeFilter === filter
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="input-field pl-10"
                placeholder="Search by reference or account"
              />
              <FiSearch className="absolute inset-y-0 left-0 ml-3 mt-3 h-5 w-5 text-gray-400" />
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <FiRefreshCw className="mr-2" /> Refresh
            </button>
          </div>
        </div>

        <div className="mt-6">
          <TransactionTable transactions={filteredTransactions} loading={loading} />
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
          <button
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span>
            Page {page + 1} of {totalPages || 1}
          </span>
          <button
            type="button"
            disabled={loading || page >= Math.max(0, totalPages - 1)}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 rounded border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </Card>
    </div>
  );
}
