import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { dashboardService } from '@/services/apiService'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Calendar } from 'lucide-react'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function Dashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard', dateRange],
    queryFn: () => dashboardService.getDashboard(dateRange).then(res => res.data),
  })

  // Fetch monthly trends
  const { data: monthlyData, isLoading: monthlyLoading } = useQuery({
    queryKey: ['dashboard-monthly', dateRange],
    queryFn: () => dashboardService.getMonthlyData(dateRange).then(res => res.data),
  })

  // Fetch expense distribution
  const { data: expenseDistribution, isLoading: expenseLoading } = useQuery({
    queryKey: ['expense-distribution', dateRange],
    queryFn: () => dashboardService.getExpenseDistribution(dateRange).then(res => res.data),
  })

  // Fetch unpaid invoices
  const { data: unpaidInvoices, isLoading: unpaidLoading } = useQuery({
    queryKey: ['unpaid-invoices'],
    queryFn: () => dashboardService.getUnpaidInvoices().then(res => res.data),
  })

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: summary?.currency || 'USD',
    }).format(value || 0)
  }

  const netProfit = (summary?.totalIncome || 0) - (summary?.totalExpense || 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2 items-center text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border rounded px-2 py-1"
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {summaryLoading ? '...' : formatCurrency(summary?.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.incomeCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summaryLoading ? '...' : formatCurrency(summary?.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.expenseCount || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summaryLoading ? '...' : formatCurrency(netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Unpaid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {unpaidLoading ? '...' : unpaidInvoices?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {unpaidLoading ? '...' : formatCurrency(
                unpaidInvoices?.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0) || 0
              )} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Income vs Expense */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalIncome" fill="#10b981" name="Income" />
                  <Bar dataKey="totalExpense" fill="#ef4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data for selected period
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            ) : expenseDistribution && expenseDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseDistribution}
                    dataKey="totalAmount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.categoryName}: ${formatCurrency(entry.totalAmount)}`}
                  >
                    {expenseDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expenses for selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Unpaid Invoices List */}
      {unpaidInvoices && unpaidInvoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Unpaid Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {unpaidInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.invoiceId} className="flex justify-between items-center p-3 border rounded">
                  <div>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(invoice.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
