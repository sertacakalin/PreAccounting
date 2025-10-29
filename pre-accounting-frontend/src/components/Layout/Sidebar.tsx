import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FaTachometerAlt, FaUsers, FaFileInvoice, FaChartBar } from 'react-icons/fa';

const Sidebar = () => {
  const { auth } = useAuth();

  const adminLinks = (
    <>
      <NavLink to="/admin/dashboard" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-primary'}`}>
        <FaTachometerAlt className="mr-3" /> Dashboard
      </NavLink>
      <NavLink to="/admin/customers" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-primary'}`}>
        <FaUsers className="mr-3" /> Customers
      </NavLink>
      <NavLink to="/admin/invoices" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-primary'}`}>
        <FaFileInvoice className="mr-3" /> Invoices
      </NavLink>
      <NavLink to="/admin/reports" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-primary'}`}>
        <FaChartBar className="mr-3" /> Reports
      </NavLink>
    </>
  );

  const customerLinks = (
    <>
      <NavLink to="/customer/dashboard" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-primary'}`}>
        <FaTachometerAlt className="mr-3" /> Dashboard
      </NavLink>
      <NavLink to="/customer/invoices" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-primary'}`}>
        <FaFileInvoice className="mr-3" /> My Invoices
      </NavLink>
      <NavLink to="/customer/reports" className={({ isActive }) => `flex items-center p-3 my-1 rounded-lg ${isActive ? 'bg-secondary text-white' : 'text-white hover:bg-primary'}`}>
        <FaChartBar className="mr-3" /> My Reports
      </NavLink>
    </>
  );

  return (
    <div className="w-64 p-4 text-white bg-gradient-to-b from-primary to-secondary">
      <h2 className="mb-6 text-2xl font-semibold">Pre-Accounting</h2>
      <nav>
        {auth?.role === 'ADMIN' ? adminLinks : customerLinks}
      </nav>
    </div>
  );
};

export default Sidebar;
