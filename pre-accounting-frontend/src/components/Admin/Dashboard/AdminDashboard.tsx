import { useEffect, useState } from 'react';
import { getCustomers } from '@/services/adminService';
import { getAdminInvoices, DashboardStats } from '@/services/adminService';
import { Customer, Invoice } from '@/types';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { FaUsers, FaFileInvoice, FaDollarSign, FaChartLine } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [customers, invoices] = await Promise.all([
          getCustomers(),
          getAdminInvoices()
        ]);

        // Calculate statistics
        const totalIncome = invoices
          .filter(inv => inv.type === 'INCOME')
          .reduce((sum, inv) => sum + inv.amount, 0);

        const totalExpense = invoices
          .filter(inv => inv.type === 'EXPENSE')
          .reduce((sum, inv) => sum + inv.amount, 0);

        setStats({
          totalCustomers: customers.length,
          totalInvoices: invoices.length,
          totalIncome,
          totalExpense,
          netProfit: totalIncome - totalExpense
        });

        // Get 5 most recent invoices
        const sorted = [...invoices].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentInvoices(sorted.slice(0, 5));

        // Get 5 most recent customers
        setRecentCustomers(customers.slice(0, 5));
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Customers</p>
              <p className="text-3xl font-bold">{stats?.totalCustomers || 0}</p>
            </div>
            <FaUsers className="text-5xl opacity-50" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Invoices</p>
              <p className="text-3xl font-bold">{stats?.totalInvoices || 0}</p>
            </div>
            <FaFileInvoice className="text-5xl opacity-50" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Total Income</p>
              <p className="text-3xl font-bold">${stats?.totalIncome.toFixed(2) || '0.00'}</p>
            </div>
            <FaDollarSign className="text-5xl opacity-50" />
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">Net Profit</p>
              <p className="text-3xl font-bold">${stats?.netProfit.toFixed(2) || '0.00'}</p>
            </div>
            <FaChartLine className="text-5xl opacity-50" />
          </div>
        </div>
      </div>

      {/* Income vs Expense Summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">Financial Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="font-medium text-green-700">Total Income</span>
              <span className="text-lg font-bold text-green-600">${stats?.totalIncome.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <span className="font-medium text-red-700">Total Expense</span>
              <span className="text-lg font-bold text-red-600">${stats?.totalExpense.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-t-2 border-blue-500">
              <span className="font-medium text-blue-700">Net Profit</span>
              <span className="text-xl font-bold text-blue-600">${stats?.netProfit.toFixed(2) || '0.00'}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="mb-4 text-xl font-semibold text-gray-800">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/customers')}
              className="w-full p-3 text-left bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <FaUsers className="inline mr-2" />
              Manage Customers
            </button>
            <button
              onClick={() => navigate('/admin/invoices')}
              className="w-full p-3 text-left bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <FaFileInvoice className="inline mr-2" />
              View All Invoices
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-full p-3 text-left bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              <FaChartLine className="inline mr-2" />
              Generate Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices and Customers */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Recent Invoices</h3>
            <button
              onClick={() => navigate('/admin/invoices')}
              className="text-sm text-primary hover:text-secondary"
            >
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm">Customer</th>
                  <th className="px-4 py-2 text-left text-sm">Type</th>
                  <th className="px-4 py-2 text-right text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-4 text-center text-gray-500">
                      No invoices yet
                    </td>
                  </tr>
                ) : (
                  recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{invoice.customerName}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            invoice.type === 'INCOME'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {invoice.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold">
                        ${invoice.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers */}
        <div className="p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Recent Customers</h3>
            <button
              onClick={() => navigate('/admin/customers')}
              className="text-sm text-primary hover:text-secondary"
            >
              View All →
            </button>
          </div>
          <div className="space-y-3">
            {recentCustomers.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No customers yet</p>
            ) : (
              recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => navigate('/admin/customers')}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{customer.name}</p>
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.phone}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
