/**
 * Payments Page
 * Collections and payments with filtering and summaries
 */

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Wallet, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { paymentService } from '@/services/payment.service'
import { customerService } from '@/services/customer.service'
import type { CreatePaymentRequest, PaymentMethod, PaymentType } from '@/types/payment.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const paymentSchema = z.object({
  type: z.enum(['COLLECTION', 'PAYMENT']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum([
    'CASH',
    'BANK_TRANSFER',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'CHEQUE',
    'OTHER',
  ]),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').optional(),
  customerSupplierId: z.number().min(1, 'Customer/Supplier is required'),
  invoiceId: z
    .number()
    .optional()
    .or(z.nan())
    .transform((value) => (Number.isNaN(value) ? undefined : value)),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

type PaymentFormData = z.infer<typeof paymentSchema>

const paymentTypeLabels: Record<PaymentType, string> = {
  COLLECTION: 'Collection',
  PAYMENT: 'Payment',
}

const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  CHEQUE: 'Cheque',
  OTHER: 'Other',
}

export function PaymentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | PaymentType>('all')
  const [filterMethod, setFilterMethod] = useState<'all' | PaymentMethod>('all')
  const [filterCustomerId, setFilterCustomerId] = useState<number | 'all'>('all')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const queryClient = useQueryClient()

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  })

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', filterType, filterCustomerId, startDate, endDate],
    queryFn: () =>
      paymentService.getAll({
        type: filterType === 'all' ? undefined : filterType,
        customerSupplierId: filterCustomerId === 'all' ? undefined : filterCustomerId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  })

  const createForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: 'COLLECTION',
      amount: 0,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CASH',
      currency: 'TRY',
      customerSupplierId: 0,
      invoiceId: undefined,
      notes: '',
    },
  })

  const createMutation = useMutation({
    mutationFn: paymentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payment recorded successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment')
    },
  })

  const onCreateSubmit = (data: PaymentFormData) => {
    const payload: CreatePaymentRequest = {
      type: data.type,
      amount: data.amount,
      paymentDate: data.paymentDate,
      paymentMethod: data.paymentMethod,
      currency: data.currency?.trim() || undefined,
      customerSupplierId: data.customerSupplierId,
      invoiceId: data.invoiceId,
      notes: data.notes === '' ? undefined : data.notes,
    }
    createMutation.mutate(payload)
  }

  const filteredPayments = useMemo(() => {
    return payments
      .filter((payment) => {
        if (filterMethod !== 'all' && payment.paymentMethod !== filterMethod) return false
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
          payment.customerSupplierName.toLowerCase().includes(term) ||
          payment.notes?.toLowerCase().includes(term) ||
          payment.invoiceNumber?.toLowerCase().includes(term)
        )
      })
  }, [payments, filterMethod, searchTerm])

  const totalCollections = filteredPayments
    .filter((p) => p.type === 'COLLECTION')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPayments = filteredPayments
    .filter((p) => p.type === 'PAYMENT')
    .reduce((sum, p) => sum + p.amount, 0)

  const netCashflow = totalCollections - totalPayments

  const methodBreakdown = useMemo(() => {
    const totals = new Map<PaymentMethod, number>()
    filteredPayments.forEach((payment) => {
      totals.set(payment.paymentMethod, (totals.get(payment.paymentMethod) || 0) + payment.amount)
    })
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1])
  }, [filteredPayments])

  const topCounterparties = useMemo(() => {
    const totals = new Map<string, number>()
    filteredPayments.forEach((payment) => {
      totals.set(
        payment.customerSupplierName,
        (totals.get(payment.customerSupplierName) || 0) + payment.amount
      )
    })
    return Array.from(totals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filteredPayments])

  const customerOptions = useMemo(() => {
    const selectedType = createForm.watch('type')
    return customers.filter((customer) =>
      selectedType === 'COLLECTION' ? customer.type === 'CUSTOMER' : customer.type === 'SUPPLIER'
    )
  }, [customers, createForm])

  if (customersLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Collections & Payments</h1>
              <p className="text-xs text-muted-foreground">Track inflows and outflows</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Collections</p>
                <ArrowDownCircle className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">${totalCollections.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Payments</p>
                <ArrowUpCircle className="h-4 w-4 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">${totalPayments.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Net Cashflow</p>
              <p className={`text-2xl font-bold ${netCashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netCashflow.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{filteredPayments.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by counterparty, invoice, or notes..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={filterType}
                    onChange={(event) => setFilterType(event.target.value as 'all' | PaymentType)}
                  >
                    <option value="all">All Types</option>
                    <option value="COLLECTION">Collections</option>
                    <option value="PAYMENT">Payments</option>
                  </select>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={filterMethod}
                    onChange={(event) => setFilterMethod(event.target.value as 'all' | PaymentMethod)}
                  >
                    <option value="all">All Methods</option>
                    {Object.entries(paymentMethodLabels).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={filterCustomerId}
                    onChange={(event) =>
                      setFilterCustomerId(
                        event.target.value === 'all' ? 'all' : Number(event.target.value)
                      )
                    }
                  >
                    <option value="all">All Counterparties</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="start-date" className="text-xs text-muted-foreground">
                    From
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="end-date" className="text-xs text-muted-foreground">
                    To
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Top Counterparties</p>
                {topCounterparties.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">No data yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {topCounterparties.map(([name, total]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="font-semibold">${total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">By Method</p>
                {methodBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground mt-2">No data yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {methodBreakdown.map(([method, total]) => (
                      <div key={method} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{paymentMethodLabels[method]}</span>
                        <span className="font-semibold">${total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Counterparty</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No payments found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.paymentDate}</TableCell>
                      <TableCell>
                        <Badge variant={payment.type === 'COLLECTION' ? 'default' : 'secondary'}>
                          {paymentTypeLabels[payment.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{payment.customerSupplierName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {paymentMethodLabels[payment.paymentMethod]}
                      </TableCell>
                      <TableCell
                        className={`font-semibold ${
                          payment.type === 'COLLECTION' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {payment.type === 'COLLECTION' ? '+' : '-'}${payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.invoiceNumber || (payment.invoiceId ? `#${payment.invoiceId}` : 'N/A')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.notes || '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>Log a collection or payment transaction.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-type">Type *</Label>
                <select
                  id="payment-type"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...createForm.register('type')}
                >
                  <option value="COLLECTION">Collection</option>
                  <option value="PAYMENT">Payment</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Method *</Label>
                <select
                  id="payment-method"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  {...createForm.register('paymentMethod')}
                >
                  {Object.entries(paymentMethodLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Amount *</Label>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  {...createForm.register('amount', { valueAsNumber: true })}
                />
                {createForm.formState.errors.amount && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.amount.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-currency">Currency</Label>
                <Input id="payment-currency" maxLength={3} {...createForm.register('currency')} />
                {createForm.formState.errors.currency && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.currency.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment-date">Payment Date *</Label>
                <Input id="payment-date" type="date" {...createForm.register('paymentDate')} />
                {createForm.formState.errors.paymentDate && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.paymentDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-invoice">Invoice ID</Label>
                <Input
                  id="payment-invoice"
                  type="number"
                  placeholder="Optional"
                  {...createForm.register('invoiceId', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-customer">Customer / Supplier *</Label>
              <select
                id="payment-customer"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                {...createForm.register('customerSupplierId', { valueAsNumber: true })}
              >
                <option value="">Select a counterparty</option>
                {customerOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} ({customer.type.toLowerCase()})
                  </option>
                ))}
              </select>
              {createForm.formState.errors.customerSupplierId && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.customerSupplierId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <textarea
                id="payment-notes"
                rows={3}
                className="flex w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...createForm.register('notes')}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Payment'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
