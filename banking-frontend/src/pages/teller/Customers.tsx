import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/Card';
import { FiUsers, FiCreditCard, FiDollarSign, FiSearch } from 'react-icons/fi';
import { accountAPI, userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import type { Account, User } from '../../types';
import { normalizeAccountsResponse, normalizeUsersResponse } from '../../utils/apiUtils';
import { formatCurrency } from '../../utils/currency';

export default function TellerCustomers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [accountsByUser, setAccountsByUser] = useState<Record<string, Account[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [customersResponse, accountsResponse] = await Promise.all([
        userAPI.getCustomers(),
        accountAPI.getAllAccounts(),
      ]);

      const normalizedCustomers = normalizeUsersResponse(customersResponse);
      const normalizedAccounts = normalizeAccountsResponse(accountsResponse).filter(
        (account) => account.isActive !== false
      );

      const grouped = normalizedAccounts.reduce<Record<string, Account[]>>((acc, account) => {
        const ownerId = account.userId ?? account.user?.id;
        if (!ownerId) {
          return acc;
        }

        const key = String(ownerId);
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(account);
        return acc;
      }, {});

      setCustomers(normalizedCustomers);
      setAccountsByUser(grouped);
    } catch (error) {
      console.error('Error loading teller customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) {
      return customers;
    }

    const term = searchTerm.toLowerCase();
    return customers.filter((customer) => {
      const matchesIdentity =
        customer.username.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term);
      const matchesAccount = (accountsByUser[customer.id] ?? []).some((account) =>
        account.accountNumber.toLowerCase().includes(term)
      );
      return matchesIdentity || matchesAccount;
    });
  }, [accountsByUser, customers, searchTerm]);

  const totals = useMemo(() => {
    const totalAccounts = Object.values(accountsByUser).reduce(
      (sum, list) => sum + list.length,
      0
    );
    const totalBalance = Object.values(accountsByUser).reduce((sum, list) => {
      return sum + list.reduce((acc, account) => acc + account.balance, 0);
    }, 0);

    return {
      totalCustomers: customers.length,
      totalAccounts,
      totalBalance,
    };
  }, [accountsByUser, customers.length]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Customers" icon={<FiUsers />}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <p className="text-3xl font-bold text-white">{totals.totalCustomers}</p>
          <p className="text-blue-100 text-sm">Registered customers</p>
        </Card>
        <Card title="Active Accounts" icon={<FiCreditCard />}>
          <p className="text-3xl font-bold text-gray-900">{totals.totalAccounts}</p>
          <p className="text-gray-500 text-sm">Linked to customers</p>
        </Card>
        <Card title="Managed Balance" icon={<FiDollarSign />}>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(totals.totalBalance)}</p>
          <p className="text-gray-500 text-sm">Across all accounts</p>
        </Card>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
            <p className="text-sm text-gray-500">Search by customer or account number</p>
          </div>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="input-field pl-10"
              placeholder="Search customers or accounts"
            />
            <FiSearch className="absolute inset-y-0 left-0 ml-3 mt-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accounts
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Balance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => {
                const accounts = accountsByUser[customer.id] ?? [];
                const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {customer.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{customer.username}</div>
                          <div className="text-xs text-gray-500">ID: {customer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-2">
                        {accounts.length > 0 ? (
                          accounts.map((account) => (
                            <span
                              key={account.id}
                              className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                            >
                              {account.accountNumber}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No active accounts</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(totalBalance)}
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No matching customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
