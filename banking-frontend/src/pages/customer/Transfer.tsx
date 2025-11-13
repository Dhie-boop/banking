import { useEffect, useMemo, useState } from 'react';
import { FiSend, FiShield, FiTrendingUp } from 'react-icons/fi';
import Layout from '../../components/Layout';
import { accountAPI, transactionAPI } from '../../services/api';
import type { Account } from '../../types';
import { toast } from 'react-toastify';
import { normalizeAccountsResponse } from '../../utils/apiUtils';
import { formatCurrency } from '../../utils/currency';

interface TransferForm {
  fromAccountId: string;
  toAccountNumber: string;
  amount: string;
  description: string;
}

export default function CustomerTransfer() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [formData, setFormData] = useState<TransferForm>({
    fromAccountId: '',
    toAccountNumber: '',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const response = await accountAPI.getMyAccounts();
      const normalized = normalizeAccountsResponse(response);
      setAccounts(normalized);
      if (normalized.length > 0) {
        setFormData((prev) => ({ ...prev, fromAccountId: prev.fromAccountId || normalized[0].id }));
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
      toast.error('Unable to load your accounts.');
    } finally {
      setLoading(false);
    }
  };

  const fromAccount = useMemo(
    () => accounts.find((account) => account.id === formData.fromAccountId),
    [accounts, formData.fromAccountId],
  );

  const quickFillTargets = useMemo(
    () => accounts.filter((account) => account.id !== formData.fromAccountId),
    [accounts, formData.fromAccountId],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fromAccount) {
      toast.error('Please choose a source account.');
      return;
    }

    if (!formData.toAccountNumber.trim()) {
      toast.error('Enter the recipient account number.');
      return;
    }

    if (fromAccount.accountNumber === formData.toAccountNumber.trim()) {
      toast.error('You cannot transfer to the same account.');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Enter a transfer amount greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      await transactionAPI.transfer({
        sourceAccountNumber: fromAccount.accountNumber,
        targetAccountNumber: formData.toAccountNumber.trim(),
        amount: parseFloat(formData.amount),
        description: formData.description,
      });

      toast.success('Transfer completed successfully.');
      setFormData({
        fromAccountId: fromAccount.id,
        toAccountNumber: '',
        amount: '',
        description: '',
      });
    } catch (error: any) {
      console.error('Transfer failed:', error);
      const message = error.response?.data?.message ?? 'Transfer could not be completed.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Transfer">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <FiSend className="text-blue-600" size={28} />
            <p className="mt-3 text-sm text-gray-500">Transfer between your accounts or send to another customer.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <FiShield className="text-green-600" size={28} />
            <p className="mt-3 text-sm text-gray-500">Every transfer is protected with multi-factor authorization.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <FiTrendingUp className="text-purple-600" size={28} />
            <p className="mt-3 text-sm text-gray-500">Keep funds moving to meet your goals faster.</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Make a Transfer</h2>
            <p className="text-sm text-gray-500">Choose your source account, then enter the recipient details.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Account *</label>
              <select
                className="input-field"
                value={formData.fromAccountId}
                onChange={(event) => setFormData((prev) => ({ ...prev, fromAccountId: event.target.value }))}
                disabled={loading || accounts.length === 0}
                required
              >
                {accounts.length === 0 ? (
                  <option value="">No accounts available</option>
                ) : (
                  accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} · {account.accountType} ({formatCurrency(account.balance)})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Account *</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter destination account number"
                value={formData.toAccountNumber}
                onChange={(event) => setFormData((prev) => ({ ...prev, toAccountNumber: event.target.value }))}
                required
              />
              {quickFillTargets.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Quick fill with one of your other accounts:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickFillTargets.map((account) => (
                      <button
                        key={account.id}
                        type="button"
                        className="px-3 py-1 text-xs rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => setFormData((prev) => ({ ...prev, toAccountNumber: account.accountNumber }))}
                      >
                        {account.accountNumber}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Memo</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Optional note for the recipient"
                  value={formData.description}
                  onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                className="btn-secondary flex-1"
                onClick={() => setFormData((prev) => ({ ...prev, toAccountNumber: '', amount: '', description: '' }))}
                disabled={submitting}
              >
                Clear
              </button>
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={submitting || !fromAccount}
              >
                {submitting ? 'Processing…' : 'Send Money'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
