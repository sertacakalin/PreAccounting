import { useState } from 'react';
import { createCustomer, CreateCustomerRequest, CreateCustomerResponse } from '@/services/adminService';

interface CustomerFormProps {
  onCustomerCreated: () => void;
}

const CustomerForm = ({ onCustomerCreated }: CustomerFormProps) => {
  const [formData, setFormData] = useState<CreateCustomerRequest>({ name: '', email: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [createdCustomerInfo, setCreatedCustomerInfo] = useState<CreateCustomerResponse | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedCustomerInfo(null);

    try {
      const response = await createCustomer(formData);
      setCreatedCustomerInfo(response);
      onCustomerCreated(); // Refresh the customer list
      setFormData({ name: '', email: '' }); // Reset form
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create customer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 my-6 bg-white rounded-lg shadow-md">
      <h3 className="mb-4 text-xl font-semibold">Create New Customer</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required className="w-full px-3 py-2 border rounded" />
        <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" type="email" required className="w-full px-3 py-2 border rounded" />
        <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="Phone" className="w-full px-3 py-2 border rounded" />
        <input name="taxNo" value={formData.taxNo || ''} onChange={handleChange} placeholder="Tax No" className="w-full px-3 py-2 border rounded" />
        <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Address" className="w-full px-3 py-2 border rounded md:col-span-2" />
        <div className="md:col-span-2">
          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-primary rounded-md hover:bg-secondary disabled:bg-gray-400">
            {isLoading ? 'Creating...' : 'Create Customer'}
          </button>
        </div>
      </form>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {createdCustomerInfo && (
        <div className="mt-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700">
          <h4 className="font-bold">Customer Created Successfully!</h4>
          <p><strong>Username:</strong> {createdCustomerInfo.username}</p>
          <p><strong>Password:</strong> {createdCustomerInfo.password} (Please save this password!)</p>
        </div>
      )}
    </div>
  );
};

export default CustomerForm;
