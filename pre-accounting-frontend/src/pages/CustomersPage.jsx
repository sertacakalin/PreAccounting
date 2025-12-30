import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Users, Edit, Trash2, User } from 'lucide-react'
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
const customerSupplierSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().max(20, 'Phone cannot exceed 20 characters').optional(),
  taxNo: z.string().max(20, 'Tax number cannot exceed 20 characters').optional(),
  address: z.string().max(200, 'Address cannot exceed 200 characters').optional(),
  isCustomer: z.boolean(),
})

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, customer, supplier
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const queryClient = useQueryClient()

  // Fetch customers and suppliers
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['customers-suppliers'],
    queryFn: async () => {
      const response = await api.get('/customers')
      return response.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/customers', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-suppliers'] })
      toast.success('Created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/customers/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-suppliers'] })
      toast.success('Updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      editForm.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/customers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers-suppliers'] })
      toast.success('Deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete')
    },
  })

  // Create form
  const createForm = useForm({
    resolver: zodResolver(customerSupplierSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      taxNo: '',
      address: '',
      isCustomer: true,
    },
  })

  // Edit form
  const editForm = useForm({
    resolver: zodResolver(customerSupplierSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      taxNo: '',
      address: '',
      isCustomer: true,
    },
  })

  const onCreateSubmit = (data) => {
    createMutation.mutate(data)
  }

  const onEditSubmit = (data) => {
    updateMutation.mutate({ id: editingItem.id, data })
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    editForm.reset({
      name: item.name,
      email: item.email || '',
      phone: item.phone || '',
      taxNo: item.taxNo || '',
      address: item.address || '',
      isCustomer: item.isCustomer,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  // Filter items
  const filteredItems = items
    .filter((item) => {
      if (filterType === 'customer') return item.isCustomer
      if (filterType === 'supplier') return !item.isCustomer
      return true
    })
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.taxNo?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading data: {error.message}</div>
      </div>
    )
  }

  const FormFields = ({ form }) => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input id="name" placeholder="Enter name" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" {...form.register('email')} />
        {form.formState.errors.email && (
          <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" placeholder="+1 234 567 8900" {...form.register('phone')} />
        {form.formState.errors.phone && (
          <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxNo">Tax Number</Label>
        <Input id="taxNo" placeholder="Tax number" {...form.register('taxNo')} />
        {form.formState.errors.taxNo && (
          <p className="text-sm text-red-500">{form.formState.errors.taxNo.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="Address" {...form.register('address')} />
        {form.formState.errors.address && (
          <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="isCustomer">
          Type <span className="text-red-500">*</span>
        </Label>
        <select
          id="isCustomer"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...form.register('isCustomer', { valueAsBoolean: true })}
        >
          <option value="true">Customer</option>
          <option value="false">Supplier</option>
        </select>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Customers & Suppliers
          </h1>
          <p className="text-muted-foreground mt-1">Manage your customers and suppliers</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New</DialogTitle>
              <DialogDescription>Add a new customer or supplier to your records.</DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <FormFields form={createForm} />
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
            variant={filterType === 'customer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('customer')}
          >
            Customers
          </Button>
          <Button
            variant={filterType === 'supplier' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('supplier')}
          >
            Suppliers
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or tax number..."
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
            <div className="p-8 text-center text-muted-foreground">Loading...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {searchTerm ? 'No records found matching your search.' : 'No records yet. Create your first entry!'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Tax No</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.email || '-'}</TableCell>
                    <TableCell>{item.phone || '-'}</TableCell>
                    <TableCell>{item.taxNo || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.isCustomer ? 'default' : 'secondary'}>
                        {item.isCustomer ? 'Customer' : 'Supplier'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.active ? 'success' : 'secondary'}>
                        {item.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-2xl font-bold mt-1">{items.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Customers</div>
          <div className="text-2xl font-bold mt-1 text-blue-600">
            {items.filter((i) => i.isCustomer).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Suppliers</div>
          <div className="text-2xl font-bold mt-1 text-purple-600">
            {items.filter((i) => !i.isCustomer).length}
          </div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit {editingItem?.isCustomer ? 'Customer' : 'Supplier'}</DialogTitle>
            <DialogDescription>Update the information below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <FormFields form={editForm} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingItem(null)
                }}
              >
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
