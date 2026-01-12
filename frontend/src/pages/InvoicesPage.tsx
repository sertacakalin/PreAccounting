/**
 * Invoice Operations Page
 * Full backend integration with list, create, and detail views
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, ArrowLeft, FileText, Eye, Ban, DollarSign, Download } from 'lucide-react'
import { toast } from 'sonner'
import { invoiceService } from '@/services/invoice.service'
import { customerService } from '@/services/customer.service'
import type { Invoice } from '@/types/invoice.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Validation schema for invoice creation
const createInvoiceSchema = z.object({
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  customerSupplierId: z.number().min(1, 'Please select a customer'),
  currency: z.string().min(3, 'Currency is required'),
  type: z.enum(['INCOME', 'EXPENSE']),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.number().min(1, 'Item is required').optional(),
      itemName: z.string().min(1, 'Item name is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0, 'Unit price must be non-negative'),
      vatRate: z.number().min(0).max(100),
    })
  ).min(1, 'At least one item is required'),
})

type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>

export function InvoicesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false)
  const queryClient = useQueryClient()

  // Fetch invoices
  const { data: invoices = [], isLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices', showOnlyUnpaid],
    queryFn: () => invoiceService.getAll({ unpaidOnly: showOnlyUnpaid }),
  })

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  })

  // Form
  const form = useForm<CreateInvoiceFormData>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 30 days from now
      customerSupplierId: 0,
      currency: 'USD',
      type: 'INCOME',
      notes: '',
      items: [{ itemName: '', quantity: 1, unitPrice: 0, vatRate: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: invoiceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created successfully')
      setIsCreateDialogOpen(false)
      form.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: invoiceService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice cancelled successfully')
      setSelectedInvoice(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel invoice')
    },
  })

  const markPaidMutation = useMutation({
    mutationFn: invoiceService.markAsPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice marked as paid successfully')
      setSelectedInvoice(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to mark invoice as paid')
    },
  })

  // Handlers
  const onSubmit = (data: CreateInvoiceFormData) => {
    createMutation.mutate(data)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
  }

  const handleCancelInvoice = (id: number) => {
    if (window.confirm('Are you sure you want to cancel this invoice?')) {
      cancelMutation.mutate(id)
    }
  }

  const handleMarkAsPaid = (id: number) => {
    if (window.confirm('Mark this invoice as paid?')) {
      markPaidMutation.mutate(id)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + currency
  }

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'PAID':
        return 'default'
      case 'CANCELLED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  // PDF Generation - Download from backend
  const generateInvoicePDF = async (invoice: Invoice) => {
    try {
      await invoiceService.downloadPdf(invoice.id, invoice.invoiceNumber)
      toast.success('Invoice PDF downloaded successfully')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    )
  }

  // Invoice Detail View
  if (selectedInvoice) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(null)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to list
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Invoice Details</h1>
              <p className="text-muted-foreground">{selectedInvoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => generateInvoicePDF(selectedInvoice)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            {selectedInvoice.status === 'ISSUED' && (
              <Button onClick={() => handleMarkAsPaid(selectedInvoice.id)}>
                <DollarSign className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            )}
            {selectedInvoice.status !== 'CANCELLED' && (
              <Button
                variant="destructive"
                onClick={() => handleCancelInvoice(selectedInvoice.id)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Cancel Invoice
              </Button>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Invoice Number</p>
                  <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <Badge>{selectedInvoice.type}</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Invoice Date</p>
                  <p className="font-semibold">
                    {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-semibold">
                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-semibold">{selectedInvoice.customerSupplierName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedInvoice.status)}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Line Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.itemName ?? item.description ?? 'Item'}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice, selectedInvoice.currency)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(item.quantity * item.unitPrice, selectedInvoice.currency)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedInvoice.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="text-sm mt-2">{selectedInvoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">
                  {new Date(selectedInvoice.createdAt).toLocaleString()}
                </p>
              </div>
              {selectedInvoice.updatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">
                    {new Date(selectedInvoice.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Invoice List View
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Invoices</h1>
            <p className="text-muted-foreground">Manage and track your invoices</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Issued</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">
              {invoices.filter((i) => i.status === 'ISSUED').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {invoices.filter((i) => i.status === 'PAID').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {invoices.filter((i) => i.status === 'CANCELLED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Button
          variant={showOnlyUnpaid ? 'secondary' : 'outline'}
          onClick={() => setShowOnlyUnpaid(!showOnlyUnpaid)}
        >
          {showOnlyUnpaid ? 'Show All' : 'Show Unpaid Only'}
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice Number</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invoice.type}</Badge>
                    </TableCell>
                    <TableCell>{invoice.customerSupplierName}</TableCell>
                    <TableCell>
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(invoice.totalAmount, invoice.currency)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewInvoice(invoice)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generateInvoicePDF(invoice)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for a customer or supplier.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input id="invoiceDate" type="date" {...form.register('invoiceDate')} />
                {form.formState.errors.invoiceDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.invoiceDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input id="dueDate" type="date" {...form.register('dueDate')} />
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerSupplierId">Customer *</Label>
                <Select
                  value={form.watch('customerSupplierId')?.toString()}
                  onValueChange={(value) =>
                    form.setValue('customerSupplierId', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.customerSupplierId && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.customerSupplierId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={form.watch('type')}
                  onValueChange={(value) => form.setValue('type', value as 'INCOME' | 'EXPENSE')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Input id="currency" placeholder="USD" {...form.register('currency')} />
              {form.formState.errors.currency && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currency.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Line Items *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ itemName: '', quantity: 1, unitPrice: 0, vatRate: 0 })}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="space-y-2 border p-3 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Item Name"
                      {...form.register(`items.${index}.itemName`)}
                    />
                    <Input
                      type="number"
                      placeholder="VAT Rate (%)"
                      {...form.register(`items.${index}.vatRate`, { valueAsNumber: true })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      type="number"
                      placeholder="Quantity"
                      {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Unit Price"
                      {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Ban className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {form.formState.errors.items && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.items.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                {...form.register('notes')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
