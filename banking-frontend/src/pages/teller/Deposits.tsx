import { useEffect, useState } from 'react';
import CashTransactionForm from './CashTransactionForm';
import Card from '../../components/Card';
import TransactionTable from '../../components/TransactionTable';
import { FiDownload } from 'react-icons/fi';
import { transactionAPI } from '../../services/api';
import type { Transaction } from '../../types';
import { normalizeTransactionsResponse } from '../../utils/apiUtils';
import { toast } from 'react-toastify';

export default function TellerDeposits() {
  const [recentDeposits, setRecentDeposits] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadRecentDeposits();
  }, []);

  const loadRecentDeposits = async () => {
    setLoading(true);
    try {
      const response = await transactionAPI.getStaffTransactions(0, 20);
      const normalized = normalizeTransactionsResponse(response);
      setRecentDeposits(normalized.filter((transaction) => transaction.type === 'DEPOSIT'));
    } catch (error) {
      console.error('Error loading recent deposits:', error);
      toast.error('Failed to load recent deposits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <CashTransactionForm mode="DEPOSIT" />

      <Card title="Recent Deposits" icon={<FiDownload />}>
        <TransactionTable transactions={recentDeposits.slice(0, 10)} loading={loading} />
      </Card>
    </div>
  );
}
