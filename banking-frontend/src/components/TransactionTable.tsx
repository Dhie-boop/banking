import type { Transaction } from '../types';
import { format } from 'date-fns';

interface TransactionTableProps {
  transactions: Transaction[];
  loading?: boolean;
}

export default function TransactionTable({ transactions, loading = false }: TransactionTableProps) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'bg-green-100 text-green-800';
      case 'WITHDRAWAL':
        return 'bg-red-100 text-red-800';
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    if (type === 'WITHDRAWAL') {
      return `-${formattedAmount}`;
    }
    return `+${formattedAmount}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Account
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {(() => {
                  const dateValue = transaction.createdAt || transaction.timestamp;
                  const parsed = dateValue ? new Date(dateValue) : null;
                  return parsed && !isNaN(parsed.getTime())
                    ? format(parsed, 'MMM dd, yyyy HH:mm')
                    : 'N/A';
                })()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(transaction.type)}`}>
                  {transaction.type}
                </span>
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                transaction.type === 'WITHDRAWAL' ? 'text-red-600' : 'text-green-600'
              }`}>
                {formatAmount(transaction.amount, transaction.type)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {transaction.description || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {transaction.fromAccount?.accountNumber
                  || transaction.sourceAccountNumber
                  || transaction.toAccount?.accountNumber
                  || transaction.targetAccountNumber
                  || '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
