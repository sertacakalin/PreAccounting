import { useState } from 'react';
import { createInvoice, CreateInvoiceRequest } from '@/services/customerService';

interface InvoiceFormProps {
  onInvoiceCreated: () => void;
}

const InvoiceForm = ({ onInvoiceCreated }: InvoiceFormProps) => {
  const [formData, setFormData] = useState<CreateInvoiceRequest>({ type: 'INCOME', date: '', amount: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: name === 'amount' ? parseFloat(value) : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createInvoice(formData);
      onInvoiceCreated(); // Refresh the invoice list
      setFormData({ type: 'INCOME', date: '', amount: 0, description: '' }); // Reset form
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create invoice.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 my-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-xl font-semibold">Create New Invoice</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded">
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
        </select>
        <input name="date" value={formData.date} onChange={handleChange} type="date" required className="w-full px-3 py-2 border rounded" />
        <input name="amount" value={formData.amount} onChange={handleChange} type="number" step="0.01" placeholder="Amount" required className="w-full px-3 py-2 border rounded" />
        <input name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description" className="w-full px-3 py-2 border rounded md:col-span-2" />
        <div className="md:col-span-2">
          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-primary rounded-md hover:bg-secondary disabled:bg-gray-400">
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default InvoiceForm;
