import { useMemo, useState } from 'react';
import Card from '../../components/Card';
import { FiDownload, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { formatCurrency } from '../../utils/currency';
import { useTellerAccounts } from './useTellerAccounts';
import { transactionAPI } from '../../services/api';
import { toast } from 'react-toastify';

interface CashTransactionFormProps {
  mode: 'DEPOSIT' | 'WITHDRAWAL';
}

export default function CashTransactionForm({ mode }: CashTransactionFormProps) {
  const { accounts, loading, refresh } = useTellerAccounts();
  const [form, setForm] = useState({
    accountNumber: '',
    amount: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const selectedAccount = useMemo(() => {
    if (!form.accountNumber) {
      return undefined;
    }
    return accounts.find((account) => account.accountNumber === form.accountNumber);
  }, [accounts, form.accountNumber]);

  const handleChange = (field: 'accountNumber' | 'amount' | 'description') =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.accountNumber || !form.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const numericAmount = parseFloat(form.amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'DEPOSIT') {
        await transactionAPI.deposit(form.accountNumber, numericAmount, form.description);
      } else {
        await transactionAPI.withdraw(form.accountNumber, numericAmount, form.description);
      }
      toast.success(`${mode === 'DEPOSIT' ? 'Deposit' : 'Withdrawal'} completed successfully`);
      setForm({ accountNumber: '', amount: '', description: '' });
      await refresh();
    } catch (error: any) {
      console.error('Teller cash transaction error:', error);
      const message = error.response?.data?.message || 'Transaction failed';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const icon = mode === 'DEPOSIT' ? <FiDownload /> : <FiUpload />;
  const title = mode === 'DEPOSIT' ? 'Process Deposit' : 'Process Withdrawal';

  return (
    <Card title={title} icon={icon}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Number *
          </label>
          <input
            type="text"
            value={form.accountNumber}
            onChange={handleChange('accountNumber')}
            className="input-field"
            placeholder="Enter or search account number"
            list={`accounts-${mode}`}
            required
            disabled={loading}
          />
          <datalist id={`accounts-${mode}`}>
            {accounts.map((account) => {
              const label =
                account.ownerName ||
                account.user?.fullName ||
                account.user?.username ||
                'Account holder';
              return (
                <option key={account.id} value={account.accountNumber}>
                  {`${account.accountNumber} — ${label}`}
                </option>
              );
            })}
          </datalist>
          {selectedAccount && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-medium">
                {selectedAccount.accountNumber} • {selectedAccount.accountType}
              </p>
              <p className="mt-1">
                Holder:{' '}
                {selectedAccount.ownerName ||
                  selectedAccount.user?.fullName ||
                  selectedAccount.user?.username ||
                  'N/A'}
              </p>
              <p className="mt-1">Balance: {formatCurrency(selectedAccount.balance)}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount *
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={handleChange('amount')}
            className="input-field"
            placeholder="0.00"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            className="input-field"
            rows={3}
            placeholder="Optional note"
            disabled={loading}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading || submitting}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FiRefreshCw className="mr-2" /> Refresh accounts
          </button>
          <button type="submit" className="w-full sm:w-auto btn-primary" disabled={submitting || loading}>
            {submitting ? 'Processing...' : mode === 'DEPOSIT' ? 'Submit Deposit' : 'Submit Withdrawal'}
          </button>
        </div>
      </form>
    </Card>
  );
}
