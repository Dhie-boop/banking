import { useState, useEffect } from 'react';
import type { Account } from '../types';
import { FiX } from 'react-icons/fi';
import { transactionAPI, accountAPI } from '../services/api';
import { toast } from 'react-toastify';
import { normalizeAccountsResponse } from '../utils/apiUtils';
import { formatCurrency } from '../utils/currency';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransferComplete?: () => void;
  fromAccountId?: string;
}

export default function TransferModal({ 
  isOpen, 
  onClose, 
  onTransferComplete,
  fromAccountId 
}: TransferModalProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromAccountId: fromAccountId || '',
    toAccountNumber: '',
    amount: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
      setFormData(prev => ({ ...prev, fromAccountId: fromAccountId || '' }));
    }
  }, [isOpen, fromAccountId]);

  const loadAccounts = async () => {
    try {
      const data = await accountAPI.getMyAccounts();
      setAccounts(normalizeAccountsResponse(data));
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fromAccountId || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    const fromAccount = accounts.find(account => account.id === formData.fromAccountId);
    if (!fromAccount) {
      toast.error('Selected account could not be found');
      return;
    }

    const targetNumber = formData.toAccountNumber.trim();
    if (!targetNumber) {
      toast.error('Enter a recipient account number');
      return;
    }

    if (fromAccount.accountNumber === targetNumber) {
      toast.error('Cannot transfer to the same account');
      return;
    }

    setLoading(true);
    try {
      await transactionAPI.transfer({
        sourceAccountNumber: fromAccount.accountNumber,
        targetAccountNumber: targetNumber,
        amount: parseFloat(formData.amount),
        description: formData.description,
      });
      
      toast.success('Transfer completed successfully');
      onTransferComplete?.();
      handleClose();
    } catch (error: any) {
      console.error('Transfer error:', error);
      const errorMessage = error.response?.data?.message || 'Transfer failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      fromAccountId: '',
      toAccountNumber: '',
      amount: '',
      description: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transfer Money</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* From Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Account *
            </label>
            <select
              value={formData.fromAccountId}
              onChange={(e) => setFormData(prev => ({ ...prev, fromAccountId: e.target.value }))}
              className="input-field"
              required
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.accountNumber} - {account.accountType} ({formatCurrency(account.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* To Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Account *
            </label>
            <input
              value={formData.toAccountNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, toAccountNumber: e.target.value }))}
              className="input-field"
              placeholder="Recipient account number"
              required
            />
            {accounts.filter(account => account.id !== formData.fromAccountId).length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Quick fill from your other accounts:</p>
                <div className="flex flex-wrap gap-2">
                  {accounts
                    .filter(account => account.id !== formData.fromAccountId)
                    .map((account) => (
                      <button
                        key={account.id}
                        type="button"
                        className="px-2 py-1 text-xs rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50"
                        onClick={() => setFormData(prev => ({ ...prev, toAccountNumber: account.accountNumber }))}
                      >
                        {account.accountNumber}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="input-field"
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input-field"
              rows={3}
              placeholder="Optional transfer note..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
