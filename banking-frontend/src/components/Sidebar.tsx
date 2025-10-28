import { NavLink, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { 
  FiHome, 
  FiCreditCard, 
  FiActivity, 
  FiSend, 
  FiUser, 
  FiLogOut,
  FiUsers,
  FiSettings,
  FiPieChart,
  FiDollarSign,
  FiDownload,
  FiUpload
} from 'react-icons/fi';
import authService from '../services/auth';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

interface SidebarLink {
  to: string;
  icon: ReactNode;
  label: string;
  roles?: ('ADMIN' | 'CUSTOMER' | 'TELLER')[];
}

const sidebarLinks: SidebarLink[] = [
  // Customer links
  { to: '/dashboard', icon: <FiHome />, label: 'Dashboard', roles: ['CUSTOMER'] },
  { to: '/accounts', icon: <FiCreditCard />, label: 'My Accounts', roles: ['CUSTOMER'] },
  { to: '/transactions', icon: <FiActivity />, label: 'Transactions', roles: ['CUSTOMER'] },
  { to: '/transfer', icon: <FiSend />, label: 'Transfer', roles: ['CUSTOMER'] },
  
  // Admin links
  { to: '/admin', icon: <FiPieChart />, label: 'Overview', roles: ['ADMIN'] },
  { to: '/admin/customers', icon: <FiUsers />, label: 'Customers', roles: ['ADMIN'] },
  { to: '/admin/accounts', icon: <FiCreditCard />, label: 'Accounts', roles: ['ADMIN'] },
  { to: '/admin/transactions', icon: <FiActivity />, label: 'Transactions', roles: ['ADMIN'] },
  { to: '/admin/settings', icon: <FiSettings />, label: 'Settings', roles: ['ADMIN'] },
  
  // Teller links
  { to: '/teller', icon: <FiPieChart />, label: 'Overview', roles: ['TELLER'] },
  { to: '/teller/customers', icon: <FiUsers />, label: 'Customers', roles: ['TELLER'] },
  { to: '/teller/transactions', icon: <FiActivity />, label: 'Transactions', roles: ['TELLER'] },
  { to: '/teller/deposit', icon: <FiDownload />, label: 'Deposits', roles: ['TELLER'] },
  { to: '/teller/withdraw', icon: <FiUpload />, label: 'Withdrawals', roles: ['TELLER'] },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const userRole = user?.role;

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local data even if API call fails
      authService.clearAuthData();
      navigate('/login');
    }
  };

  // Filter links based on user role
  const filteredLinks = sidebarLinks.filter(link => 
    !link.roles || (userRole && link.roles.includes(userRole))
  );

  return (
    <div className={`bg-white shadow-sm border-r border-gray-200 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-800 text-white rounded-lg flex items-center justify-center font-bold text-lg">
            <FiDollarSign />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SecureBank</h1>
            <p className="text-sm text-gray-500 capitalize">
              {userRole?.toLowerCase()} Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active' : 'sidebar-link'
            }
          >
            <span className="text-lg">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? 'sidebar-link-active' : 'sidebar-link'
          }
        >
          <FiUser />
          <span>Profile</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <FiLogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
