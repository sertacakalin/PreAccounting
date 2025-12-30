import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Validation schema
const paymentSchema = z.object({
  type: z.enum(['PAYMENT', 'COLLECTION'], { required_error: 'Payment type is required' }),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'CHEQUE', 'OTHER'], {
    required_error: 'Payment method is required',
  }),
  notes: z.string().max(1000).optional(),
  customerSupplierId: z.coerce.number().min(1, 'Customer/Supplier is required'),
  invoiceId: z.coerce.number().optional().or(z.literal('')),
})

export function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, payment, collection
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const queryClient = useQueryClient()

  // Fetch payments
  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await api.get('/payments')
      return response.data
    },
  })

  // Fetch customers and suppliers
  const { data: customersSuppliers = [] } = useQuery({
    queryKey: ['customers-suppliers-all'],
    queryFn: async () => {
      const response = await api.get('/customers')
      return response.data
    },
  })

  // Fetch invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['invoices-for-payment'],
    queryFn: async () => {
      const response = await api.get('/invoices')
      return response.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = { ...data }
      if (!payload.invoiceId) {
        delete payload.invoiceId
      }
      const response = await api.post('/payments', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Payment recorded successfully')
      setIsCreateDialogOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create payment')
    },
  })

  // Form
  const form = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: 'PAYMENT',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      notes: '',
      customerSupplierId: '',
      invoiceId: '',
    },
  })

  const onSubmit = (data) => {
    createMutation.mutate(data)
  }

  // Watch payment type to filter customers/suppliers
  const selectedType = form.watch('type')
  const filteredCustomersSuppliers = customersSuppliers.filter((cs) => {
    if (selectedType === 'PAYMENT') return !cs.isCustomer // Suppliers
    if (selectedType === 'COLLECTION') return cs.isCustomer // Customers
    return true
  })

  // Filter payments
  const filteredPayments = payments
    .filter((payment) => {
      if (filterType === 'payment') return payment.type === 'PAYMENT'
      if (filterType === 'collection') return payment.type === 'COLLECTION'
      return true
    })
    .filter(
      (payment) =>
        payment.customerSupplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading payments: {error.message}</div>
      </div>
    )
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      CASH: 'Cash',
      BANK_TRANSFER: 'Bank Transfer',
      CREDIT_CARD: 'Credit Card',
      DEBIT_CARD: 'Debit Card',
      CHEQUE: 'Cheque',
      OTHER: 'Other',
    }
    return labels[method] || method
  }

  // Calculate totals
  const totalPayments = payments
    .filter((p) => p.type === 'PAYMENT')
    .reduce((sum, p) => sum + (p.amount || 0), 0)
  const totalCollections = payments
    .filter((p) => p.type === 'COLLECTION')
    .reduce((sum, p) => sum + (p.amount || 0), 0)
  const netCashFlow = totalCollections - totalPayments

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="h-8 w-8" />
            Payments
          </h1>
          <p className="text-muted-foreground mt-1">Track payments and collections</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>Record a new payment or collection.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('type')}
                  >
                    <option value="PAYMENT">Payment (Money Out)</option>
                    <option value="COLLECTION">Collection (Money In)</option>
                  </select>
                  {form.formState.errors.type && (
                    <p className="text-sm text-red-500">{form.formState.errors.type.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerSupplierId">
                    {selectedType === 'PAYMENT' ? 'Supplier' : 'Customer'} <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="customerSupplierId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('customerSupplierId')}
                  >
                    <option value="">Select {selectedType === 'PAYMENT' ? 'a supplier' : 'a customer'}</option>
                    {filteredCustomersSuppliers.map((cs) => (
                      <option key={cs.id} value={cs.id}>
                        {cs.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.customerSupplierId && (
                    <p className="text-sm text-red-500">{form.formState.errors.customerSupplierId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceId">Invoice (Optional)</Label>
                  <select
                    id="invoiceId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('invoiceId')}
                  >
                    <option value="">No invoice</option>
                    {invoices
                      .filter((inv) => inv.status === 'PENDING')
                      .map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - ${inv.totalAmount?.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-red-500">*</span>
                  </Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" {...form.register('amount')} />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">
                    Payment Date <span className="text-red-500">*</span>
                  </Label>
                  <Input id="paymentDate" type="date" {...form.register('paymentDate')} />
                  {form.formState.errors.paymentDate && (
                    <p className="text-sm text-red-500">{form.formState.errors.paymentDate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="paymentMethod"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('paymentMethod')}
                  >
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT_CARD">Credit Card</option>
                    <option value="DEBIT_CARD">Debit Card</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {form.formState.errors.paymentMethod && (
                    <p className="text-sm text-red-500">{form.formState.errors.paymentMethod.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <textarea
                    id="notes"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('notes')}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex gap-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All
          </Button>
          <Button
            variant={filterType === 'payment' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('payment')}
          >
            <ArrowDownCircle className="h-4 w-4 mr-1" />
            Payments
          </Button>
          <Button
            variant={filterType === 'collection' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('collection')}
          >
            <ArrowUpCircle className="h-4 w-4 mr-1" />
            Collections
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer/supplier, invoice, or notes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading payments...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No payments found matching your search.' : 'No payments yet. Record your first payment!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Customer/Supplier</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={payment.type === 'COLLECTION' ? 'success' : 'destructive'}>
                        {payment.type === 'COLLECTION' ? (
                          <ArrowUpCircle className="h-3 w-3 mr-1 inline" />
                        ) : (
                          <ArrowDownCircle className="h-3 w-3 mr-1 inline" />
                        )}
                        {payment.type === 'COLLECTION' ? 'Collection' : 'Payment'}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.customerSupplierName}</TableCell>
                    <TableCell>{payment.invoiceNumber || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getPaymentMethodLabel(payment.paymentMethod)}</Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          payment.type === 'COLLECTION'
                            ? 'text-green-600 font-semibold'
                            : 'text-red-600 font-semibold'
                        }
                      >
                        {payment.type === 'COLLECTION' ? '+' : '-'}${payment.amount?.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Payments</div>
          <div className="text-2xl font-bold mt-1 text-red-600">${totalPayments.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Collections</div>
          <div className="text-2xl font-bold mt-1 text-green-600">${totalCollections.toFixed(2)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Net Cash Flow</div>
          <div className={`text-2xl font-bold mt-1 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${netCashFlow.toFixed(2)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Transactions</div>
          <div className="text-2xl font-bold mt-1">{payments.length}</div>
        </Card>
      </div>
    </div>
  )
}
