import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, FileText, Eye, XCircle, CheckCircle, Trash2 } from 'lucide-react'
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

// Validation schemas
const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required').max(200),
  quantity: z.coerce.number().min(0.01, 'Quantity must be greater than 0'),
  unitPrice: z.coerce.number().min(0.01, 'Unit price must be greater than 0'),
})

const invoiceSchema = z.object({
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().max(1000).optional(),
  customerSupplierId: z.coerce.number().min(1, 'Customer/Supplier is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
})

export function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState(null)
  const queryClient = useQueryClient()

  // Fetch invoices
  const { data: invoices = [], isLoading, error } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get('/invoices')
      return response.data
    },
  })

  // Fetch customers for dropdown
  const { data: customers = [] } = useQuery({
    queryKey: ['customers-for-invoice'],
    queryFn: async () => {
      const response = await api.get('/customers?type=customer')
      return response.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/invoices', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created successfully')
      setIsCreateDialogOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invoice')
    },
  })

  // Cancel invoice mutation
  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.patch(`/invoices/${id}/cancel`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice cancelled')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel invoice')
    },
  })

  // Mark as paid mutation
  const markPaidMutation = useMutation({
    mutationFn: async (id) => {
      const response = await api.patch(`/invoices/${id}/mark-paid`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice marked as paid')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to mark as paid')
    },
  })

  // Form
  const form = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      notes: '',
      customerSupplierId: '',
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  })

  const onSubmit = (data) => {
    createMutation.mutate(data)
  }

  const handleCancel = (id, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to cancel invoice ${invoiceNumber}?`)) {
      cancelMutation.mutate(id)
    }
  }

  const handleMarkPaid = (id, invoiceNumber) => {
    if (window.confirm(`Mark invoice ${invoiceNumber} as paid?`)) {
      markPaidMutation.mutate(id)
    }
  }

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unitPrice) || 0
      return sum + qty * price
    }, 0)
  }

  // Filter invoices
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerSupplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading invoices: {error.message}</div>
      </div>
    )
  }

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'secondary',
      PAID: 'success',
      CANCELLED: 'destructive',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Invoices
          </h1>
          <p className="text-muted-foreground mt-1">Manage your invoices</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>Fill in the invoice details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceDate">
                      Invoice Date <span className="text-red-500">*</span>
                    </Label>
                    <Input id="invoiceDate" type="date" {...form.register('invoiceDate')} />
                    {form.formState.errors.invoiceDate && (
                      <p className="text-sm text-red-500">{form.formState.errors.invoiceDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">
                      Due Date <span className="text-red-500">*</span>
                    </Label>
                    <Input id="dueDate" type="date" {...form.register('dueDate')} />
                    {form.formState.errors.dueDate && (
                      <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerSupplierId">
                    Customer <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="customerSupplierId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...form.register('customerSupplierId')}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  {form.formState.errors.customerSupplierId && (
                    <p className="text-sm text-red-500">{form.formState.errors.customerSupplierId.message}</p>
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

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      Items <span className="text-red-500">*</span>
                    </Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="grid gap-4">
                        <div className="flex justify-between items-start">
                          <Label>Item {index + 1}</Label>
                          {fields.length > 1 && (
                            <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Input placeholder="Description" {...form.register(`items.${index}.description`)} />
                          {form.formState.errors.items?.[index]?.description && (
                            <p className="text-sm text-red-500">
                              {form.formState.errors.items[index].description.message}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Quantity"
                              {...form.register(`items.${index}.quantity`)}
                            />
                            {form.formState.errors.items?.[index]?.quantity && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.items[index].quantity.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Unit Price"
                              {...form.register(`items.${index}.unitPrice`)}
                            />
                            {form.formState.errors.items?.[index]?.unitPrice && (
                              <p className="text-sm text-red-500">
                                {form.formState.errors.items[index].unitPrice.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {form.formState.errors.items && (
                    <p className="text-sm text-red-500">{form.formState.errors.items.message}</p>
                  )}

                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      Total: ${calculateTotal(form.watch('items')).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
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

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by invoice number or customer name..."
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
            <div className="p-8 text-center text-muted-foreground">Loading invoices...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No invoices found matching your search.' : 'No invoices yet. Create your first invoice!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.customerSupplierName}</TableCell>
                    <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>${invoice.totalAmount?.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingInvoice(invoice)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {invoice.status === 'PENDING' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkPaid(invoice.id, invoice.invoiceNumber)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancel(invoice.id, invoice.invoiceNumber)}
                          >
                            <XCircle className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                    </TableCell>
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
          <div className="text-sm text-muted-foreground">Total Invoices</div>
          <div className="text-2xl font-bold mt-1">{invoices.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold mt-1 text-yellow-600">
            {invoices.filter((i) => i.status === 'PENDING').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="text-2xl font-bold mt-1 text-green-600">
            {invoices.filter((i) => i.status === 'PAID').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Amount</div>
          <div className="text-2xl font-bold mt-1">
            ${invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0).toFixed(2)}
          </div>
        </Card>
      </div>

      {/* View Invoice Dialog */}
      {viewingInvoice && (
        <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Invoice {viewingInvoice.invoiceNumber}</DialogTitle>
              <DialogDescription>Invoice details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewingInvoice.customerSupplierName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(viewingInvoice.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Date</p>
                  <p className="font-medium">{new Date(viewingInvoice.invoiceDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">{new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              {viewingInvoice.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="font-medium">{viewingInvoice.notes}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewingInvoice.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice?.toFixed(2)}</TableCell>
                        <TableCell>${item.amount?.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">Total: ${viewingInvoice.totalAmount?.toFixed(2)}</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewingInvoice(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
