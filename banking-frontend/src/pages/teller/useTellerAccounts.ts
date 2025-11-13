import { useEffect, useState, useCallback } from 'react';
import { accountAPI } from '../../services/api';
import type { Account } from '../../types';
import { normalizeAccountsResponse } from '../../utils/apiUtils';
import { toast } from 'react-toastify';

export function useTellerAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await accountAPI.getAllAccounts();
      const normalized = normalizeAccountsResponse(response).filter(
        (account) => account.isActive !== false
      );
      setAccounts(normalized);
    } catch (error) {
      console.error('Error loading teller accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  return { accounts, loading, refresh: loadAccounts };
}
