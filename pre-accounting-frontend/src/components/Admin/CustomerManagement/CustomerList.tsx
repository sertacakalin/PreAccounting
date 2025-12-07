import { useEffect, useState, useCallback } from 'react';
import { getCustomers, deleteCustomer, getAdminInvoices } from '@/services/adminService';
import { Customer, Invoice } from '@/types';
import { FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import CustomerForm from './CustomerForm';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      setError('Failed to fetch customers.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleViewCustomer = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsLoadingInvoices(true);
    try {
      const invoices = await getAdminInvoices(customer.id);
      setCustomerInvoices(invoices);
    } catch (err) {
      console.error('Failed to fetch customer invoices', err);
      setCustomerInvoices([]);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    try {
      await deleteCustomer(customerId);
      setCustomers(customers.filter(c => c.id !== customerId));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const closeModal = () => {
    setSelectedCustomer(null);
    setCustomerInvoices([]);
  };

  const totalIncome = customerInvoices
    .filter(inv => inv.type === 'INCOME')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalExpense = customerInvoices
    .filter(inv => inv.type === 'EXPENSE')
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <>
      <CustomerForm onCustomerCreated={fetchCustomers} />
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">Customer List</h2>
        {isLoading && <LoadingSpinner />}
        {error && <div className="text-red-500">{error}</div>}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Tax No</th>
                  <th className="px-6 py-3 text-left">Username</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No customers yet. Create one above.
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-100">
                      <td className="px-6 py-4 font-medium">{customer.name}</td>
                      <td className="px-6 py-4">{customer.email}</td>
                      <td className="px-6 py-4">{customer.phone || '-'}</td>
                      <td className="px-6 py-4">{customer.taxNo || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{customer.username}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="p-2 text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        {deleteConfirm === customer.id ? (
                          <span className="ml-2">
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="ml-1 px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(customer.id)}
                            className="p-2 text-red-600 hover:text-red-900"
                            title="Delete Customer"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
              <button
                onClick={closeModal}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-800">{selectedCustomer.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{selectedCustomer.email}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">{selectedCustomer.phone || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Tax No</p>
                  <p className="font-semibold text-gray-800">{selectedCustomer.taxNo || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded md:col-span-2">
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-semibold text-gray-800">{selectedCustomer.address || '-'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">Username</p>
                  <p className="font-semibold text-gray-800">{selectedCustomer.username}</p>
                </div>
              </div>

              {/* Financial Summary */}
              {!isLoadingInvoices && customerInvoices.length > 0 && (
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-100 rounded-lg">
                    <p className="text-sm text-green-700">Total Income</p>
                    <p className="text-2xl font-bold text-green-900">${totalIncome.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-700">Total Expense</p>
                    <p className="text-2xl font-bold text-red-900">${totalExpense.toFixed(2)}</p>
                  </div>
                  <div className="p-4 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700">Net Balance</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${(totalIncome - totalExpense).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Invoices */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Invoices</h3>
                {isLoadingInvoices ? (
                  <LoadingSpinner />
                ) : customerInvoices.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No invoices for this customer</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm">Date</th>
                          <th className="px-4 py-2 text-left text-sm">Type</th>
                          <th className="px-4 py-2 text-right text-sm">Amount</th>
                          <th className="px-4 py-2 text-left text-sm">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerInvoices.map((invoice) => (
                          <tr key={invoice.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">{invoice.date}</td>
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
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {invoice.description || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerList;
