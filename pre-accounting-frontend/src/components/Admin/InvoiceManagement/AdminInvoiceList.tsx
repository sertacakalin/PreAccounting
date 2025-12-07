import { useEffect, useState, useCallback } from 'react';
import { getAdminInvoices } from '@/services/adminService';
import { getCustomers } from '@/services/adminService';
import { Invoice, Customer } from '@/types';
import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { format } from 'date-fns';
import { FaFilter, FaFileDownload } from 'react-icons/fa';

const AdminInvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invoicesData, customersData] = await Promise.all([
        getAdminInvoices(),
        getCustomers()
      ]);
      setInvoices(invoicesData);
      setFilteredInvoices(invoicesData);
      setCustomers(customersData);
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters
  useEffect(() => {
    let result = [...invoices];

    if (selectedCustomer !== 'all') {
      result = result.filter(inv => inv.customerId === parseInt(selectedCustomer));
    }

    if (selectedType !== 'all') {
      result = result.filter(inv => inv.type === selectedType);
    }

    if (searchTerm) {
      result = result.filter(inv =>
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInvoices(result);
  }, [selectedCustomer, selectedType, searchTerm, invoices]);

  // Calculate totals
  const totalIncome = filteredInvoices
    .filter(inv => inv.type === 'INCOME')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalExpense = filteredInvoices
    .filter(inv => inv.type === 'EXPENSE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const handleExport = () => {
    // Simple CSV export
    const headers = ['Date', 'Customer', 'Type', 'Amount', 'Description'];
    const rows = filteredInvoices.map(inv => [
      inv.date,
      inv.customerName,
      inv.type,
      inv.amount.toFixed(2),
      inv.description || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Invoice Management</h1>
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          <FaFileDownload className="mr-2" />
          Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">Total Invoices</p>
          <p className="text-2xl font-bold text-blue-900">{filteredInvoices.length}</p>
        </div>
        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-sm text-green-700">Total Income</p>
          <p className="text-2xl font-bold text-green-900">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          <p className="text-sm text-red-700">Total Expense</p>
          <p className="text-2xl font-bold text-red-900">${totalExpense.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <FaFilter className="mr-2 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Customers</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search customer or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                <th className="px-6 py-3 text-right text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{invoice.date}</td>
                    <td className="px-6 py-4 text-sm font-medium">{invoice.customerName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          invoice.type === 'INCOME'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {invoice.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold">
                      ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {invoice.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(invoice.createdAt), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Summary */}
      {filteredInvoices.length > 0 && (
        <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-lg">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-center">
            <div>
              <p className="text-sm opacity-80">Net Profit/Loss</p>
              <p className="text-3xl font-bold">
                ${(totalIncome - totalExpense).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm opacity-80">Total Income</p>
              <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Total Expense</p>
              <p className="text-3xl font-bold">${totalExpense.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvoiceList;
