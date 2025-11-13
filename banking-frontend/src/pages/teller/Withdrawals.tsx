import { useEffect, useState } from 'react';
import CashTransactionForm from './CashTransactionForm';
import Card from '../../components/Card';
import TransactionTable from '../../components/TransactionTable';
import { FiUpload } from 'react-icons/fi';
import { transactionAPI } from '../../services/api';
import type { Transaction } from '../../types';
import { normalizeTransactionsResponse } from '../../utils/apiUtils';
import { toast } from 'react-toastify';

export default function TellerWithdrawals() {
  const [recentWithdrawals, setRecentWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadRecentWithdrawals();
  }, []);

  const loadRecentWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getStaffTransactions(0, 20);
      const normalized = normalizeTransactionsResponse(response);
      setRecentWithdrawals(normalized.filter((transaction) => transaction.type === 'WITHDRAWAL'));
    } catch (error) {
      console.error('Error loading recent withdrawals:', error);
      toast.error('Failed to load recent withdrawals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CashTransactionForm mode="WITHDRAWAL" />

      <Card title="Recent Withdrawals" icon={<FiUpload />}>
        <TransactionTable transactions={recentWithdrawals.slice(0, 10)} loading={loading} />
      </Card>
    </div>
  );
}
