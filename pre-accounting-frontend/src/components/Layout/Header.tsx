import { useAuth } from '@/context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const { auth, logout } = useAuth();

  return (
    <header className="flex items-center justify-between p-4 bg-white border-b">
      <div>
        {/* Breadcrumb can go here */}
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>
      <div className="flex items-center">
        <div className="mr-4 flex items-center">
          <FaUserCircle className="mr-2 text-primary" size={24} />
          <span>{auth?.username} ({auth?.role})</span>
        </div>
        <button 
          onClick={logout} 
          className="flex items-center px-3 py-2 text-sm font-medium text-white bg-danger rounded-md hover:bg-opacity-90"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
