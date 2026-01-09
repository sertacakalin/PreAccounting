/**
 * Customers/Suppliers Page
 * Full CRUD operations
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { customerService } from '@/services/customer.service'
import type { Customer, CustomerType } from '@/types/customer.types'
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

// Validation schema
const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['CUSTOMER', 'SUPPLIER']),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  phone: z.string().optional(),
  taxNo: z.string().optional(),
  address: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | CustomerType>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const queryClient = useQueryClient()

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customerService.getAll,
  })

  // Forms
  const createForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      type: 'CUSTOMER',
      email: '',
      phone: '',
      taxNo: '',
      address: '',
    },
  })

  const editForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create customer')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CustomerFormData }) =>
      customerService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer updated successfully')
      setIsEditDialogOpen(false)
      setEditingCustomer(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update customer')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete customer')
    },
  })

  // Handlers
  const onCreateSubmit = (data: CustomerFormData) => {
    const cleanedData = {
      ...data,
      email: data.email === '' ? undefined : data.email,
      phone: data.phone === '' ? undefined : data.phone,
      taxNo: data.taxNo === '' ? undefined : data.taxNo,
      address: data.address === '' ? undefined : data.address,
    }
    createMutation.mutate(cleanedData)
  }

  const onEditSubmit = (data: CustomerFormData) => {
    if (editingCustomer) {
      const cleanedData = {
        ...data,
        email: data.email === '' ? undefined : data.email,
        phone: data.phone === '' ? undefined : data.phone,
        taxNo: data.taxNo === '' ? undefined : data.taxNo,
        address: data.address === '' ? undefined : data.address,
      }
      updateMutation.mutate({ id: editingCustomer.id, data: cleanedData })
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    editForm.reset({
      name: customer.name,
      type: customer.type,
      email: customer.email || '',
      phone: customer.phone || '',
      taxNo: customer.taxNo || '',
      address: customer.address || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  // Filter customers
  const filteredCustomers = customers
    .filter((c) => {
      if (filterType !== 'all' && c.type !== filterType) return false
      return (
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxNo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

  const totalCustomers = customers.filter((c) => c.type === 'CUSTOMER').length
  const totalSuppliers = customers.filter((c) => c.type === 'SUPPLIER').length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
            <p className="text-2xl font-bold text-success">{totalCustomers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
            <p className="text-2xl font-bold text-primary">{totalSuppliers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          All ({customers.length})
        </Button>
        <Button
          variant={filterType === 'CUSTOMER' ? 'default' : 'outline'}
          onClick={() => setFilterType('CUSTOMER')}
        >
          Customers ({totalCustomers})
        </Button>
        <Button
          variant={filterType === 'SUPPLIER' ? 'default' : 'outline'}
          onClick={() => setFilterType('SUPPLIER')}
        >
          Suppliers ({totalSuppliers})
        </Button>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or tax no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Tax No</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No contacts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <Badge variant={customer.type === 'CUSTOMER' ? 'default' : 'secondary'}>
                        {customer.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.email || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.phone || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.taxNo || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(customer.id, customer.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>Create a new customer or supplier.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input id="create-name" {...createForm.register('name')} />
              {createForm.formState.errors.name && (
                <p className="text-sm text-destructive">{createForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-type">Type *</Label>
              <select
                id="create-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...createForm.register('type')}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input id="create-email" type="email" {...createForm.register('email')} />
              {createForm.formState.errors.email && (
                <p className="text-sm text-destructive">{createForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input id="create-phone" {...createForm.register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-taxNo">Tax No</Label>
                <Input id="create-taxNo" {...createForm.register('taxNo')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-address">Address</Label>
              <Input id="create-address" {...createForm.register('address')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>Update contact information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input id="edit-name" {...editForm.register('name')} />
              {editForm.formState.errors.name && (
                <p className="text-sm text-destructive">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type *</Label>
              <select
                id="edit-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...editForm.register('type')}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="SUPPLIER">Supplier</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" {...editForm.register('email')} />
              {editForm.formState.errors.email && (
                <p className="text-sm text-destructive">{editForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone</Label>
                <Input id="edit-phone" {...editForm.register('phone')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-taxNo">Tax No</Label>
                <Input id="edit-taxNo" {...editForm.register('taxNo')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" {...editForm.register('address')} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
