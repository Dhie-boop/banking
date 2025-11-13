import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import TellerOverview from './Overview';
import TellerCustomers from './Customers';
import TellerTransactions from './Transactions';
import TellerDeposits from './Deposits';
import TellerWithdrawals from './Withdrawals';

export default function TellerRouter() {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/customers')) {
      return 'Teller Customers';
    }
    if (path.includes('/transactions')) {
      return 'Teller Transactions';
    }
    if (path.includes('/deposit')) {
      return 'Process Deposits';
    }
    if (path.includes('/withdraw')) {
      return 'Process Withdrawals';
    }
    return 'Teller Dashboard';
  };

  return (
    <Layout title={getPageTitle()}>
      <Routes>
        <Route path="/teller" element={<TellerOverview />} />
        <Route path="/teller/customers" element={<TellerCustomers />} />
        <Route path="/teller/transactions" element={<TellerTransactions />} />
        <Route path="/teller/deposit" element={<TellerDeposits />} />
        <Route path="/teller/withdraw" element={<TellerWithdrawals />} />
        <Route path="/" element={<TellerOverview />} />
        <Route path="*" element={<TellerOverview />} />
      </Routes>
    </Layout>
  );
}
