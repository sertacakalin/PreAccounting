import { useEffect, useState, useCallback } from 'react';
import { getCustomers } from '@/services/adminService';
import { Customer } from '@/types';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import CustomerForm from './CustomerForm';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-100">
                    <td className="px-6 py-4">{customer.name}</td>
                    <td className="px-6 py-4">{customer.email}</td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4">{customer.taxNo}</td>
                    <td className="px-6 py-4 text-center">
                      <button className="p-2 text-blue-600 hover:text-blue-900"><FaEye /></button>
                      <button className="p-2 text-yellow-600 hover:text-yellow-900"><FaEdit /></button>
                      <button className="p-2 text-red-600 hover:text-red-900"><FaTrash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomerList;
