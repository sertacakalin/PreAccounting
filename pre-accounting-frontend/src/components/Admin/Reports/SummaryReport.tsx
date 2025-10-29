import { useState } from 'react';
import { getAdminSummaryReport } from '@/services/reportService';
import { SummaryReport } from '@/types';
import LoadingSpinner from '@/components/Common/LoadingSpinner';

const AdminSummaryReport = () => {
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await getAdminSummaryReport(fromDate, toDate);
      setReport(data);
    } catch (err) {
      setError('Failed to generate report.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Admin Summary Report</h2>
      <form onSubmit={handleGenerateReport} className="flex items-center gap-4 mb-6">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required className="px-3 py-2 border rounded" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required className="px-3 py-2 border rounded" />
        <button type="submit" disabled={isLoading} className="px-4 py-2 font-medium text-white bg-primary rounded-md hover:bg-secondary disabled:bg-gray-400">
          {isLoading ? 'Generating...' : 'Generate Report'}
        </button>
      </form>

      {error && <div className="text-red-500">{error}</div>}
      {isLoading && <LoadingSpinner />}

      {!isLoading && report && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="p-4 bg-blue-100 rounded-lg"><strong>From:</strong> {report.fromDate}</div>
          <div className="p-4 bg-blue-100 rounded-lg"><strong>To:</strong> {report.toDate}</div>
          <div className="p-4 bg-green-100 rounded-lg"><strong>Total Income:</strong> {report.totalIncome.toFixed(2)}</div>
          <div className="p-4 bg-red-100 rounded-lg"><strong>Total Expense:</strong> {report.totalExpense.toFixed(2)}</div>
          <div className="p-4 bg-yellow-100 rounded-lg"><strong>Net Profit:</strong> {report.netProfit.toFixed(2)}</div>
          <div className="p-4 bg-purple-100 rounded-lg"><strong>Invoice Count:</strong> {report.invoiceCount}</div>
        </div>
      )}
    </div>
  );
};

export default AdminSummaryReport;
