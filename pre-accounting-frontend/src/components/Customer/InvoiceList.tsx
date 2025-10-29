import { useEffect, useState, useCallback } from 'react';
import { getMyInvoices } from '@/services/customerService';
import { Invoice } from '@/types';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import InvoiceForm from './InvoiceForm';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const CustomerInvoiceList = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMyInvoices();
      setInvoices(data);
    } catch (err) {
      setError('Failed to fetch invoices.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <>
      <InvoiceForm onInvoiceCreated={fetchInvoices} />
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-4 text-2xl font-semibold">My Invoices</h2>
        {isLoading && <LoadingSpinner />}
        {error && <div className="text-red-500">{error}</div>}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-gray-100">
                    <td className="px-6 py-4">{invoice.id}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.type === 'INCOME' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {invoice.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{invoice.date}</td>
                    <td className="px-6 py-4">{invoice.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">{invoice.description || '-'}</td>
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

export default CustomerInvoiceList;
