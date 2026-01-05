import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Package, Edit, Trash2, Power, PowerOff } from 'lucide-react'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Validation schema for items
const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  type: z.enum(['PRODUCT', 'SERVICE'], { required_error: 'Item type is required' }),
  category: z.string().min(1, 'Category is required').max(100),
  stock: z.number().min(0, 'Stock cannot be negative').optional().nullable(),
  salePrice: z.number().min(0, 'Sale price cannot be negative'),
  purchasePrice: z.number().min(0, 'Purchase price cannot be negative'),
  status: z.enum(['ACTIVE', 'PASSIVE']).optional(),
})

export function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, PRODUCT, SERVICE
  const [filterStatus, setFilterStatus] = useState('all') // all, ACTIVE, PASSIVE
  const [filterCategory, setFilterCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const queryClient = useQueryClient()

  // Create form
  const createForm = useForm({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'PRODUCT',
      category: '',
      stock: 0,
      salePrice: 0,
      purchasePrice: 0,
      status: 'ACTIVE',
    },
  })

  // Edit form
  const editForm = useForm({
    resolver: zodResolver(itemSchema),
  })

  // Watch type field to conditionally show/hide stock
  const watchTypeCreate = createForm.watch('type')
  const watchTypeEdit = editForm.watch('type')

  // Fetch items
  const { data: itemsData, isLoading, error } = useQuery({
    queryKey: ['items', searchTerm, filterType, filterStatus, filterCategory, sortBy, sortDirection],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: 0,
        size: 100,
        sortBy: sortBy,
        sortDirection: sortDirection,
      })

      if (searchTerm) params.append('search', searchTerm)
      if (filterType !== 'all') params.append('type', filterType)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterCategory !== 'all') params.append('category', filterCategory)

      const response = await api.get(`/items?${params.toString()}`)
      return response.data
    },
  })

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['item-categories'],
    queryFn: async () => {
      const response = await api.get('/items/categories')
      return response.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      // If type is SERVICE, set stock to null
      const payload = {
        ...data,
        stock: data.type === 'SERVICE' ? null : data.stock,
      }
      const response = await api.post('/items', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item-categories'] })
      toast.success('Item created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create item')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // If type is SERVICE, set stock to null
      const payload = {
        ...data,
        stock: data.type === 'SERVICE' ? null : data.stock,
      }
      const response = await api.put(`/items/${id}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item-categories'] })
      toast.success('Item updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      editForm.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update item')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/items/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      queryClient.invalidateQueries({ queryKey: ['item-categories'] })
      toast.success('Item deleted successfully')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete item')
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    },
  })

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (item) => {
      const endpoint = item.status === 'ACTIVE' ? 'deactivate' : 'activate'
      const response = await api.patch(`/items/${item.id}/${endpoint}`)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item status updated')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status')
    },
  })

  const handleCreate = (data) => {
    createMutation.mutate(data)
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    editForm.reset({
      name: item.name,
      description: item.description || '',
      type: item.type,
      category: item.category,
      stock: item.stock || 0,
      salePrice: item.salePrice,
      purchasePrice: item.purchasePrice,
      status: item.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = (data) => {
    if (!editingItem) return
    updateMutation.mutate({ id: editingItem.id, data })
  }

  const handleDeleteClick = (item) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id)
    }
  }

  const handleToggleStatus = (item) => {
    toggleStatusMutation.mutate(item)
  }

  const items = itemsData?.content || []

  // Get category badge color
  const getCategoryColor = (category) => {
    const colors = {
      Electronics: 'bg-blue-100 text-blue-800',
      Services: 'bg-purple-100 text-purple-800',
      Office: 'bg-green-100 text-green-800',
      Software: 'bg-indigo-100 text-indigo-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <p className="text-red-500">Error loading items: {error.message}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8" />
            Items (Inventory)
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your products and services
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Item
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Item</DialogTitle>
              <DialogDescription>
                Add a new product or service to your inventory
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="create-name">Name *</Label>
                  <Input
                    id="create-name"
                    {...createForm.register('name')}
                    placeholder="Item name"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-sm text-red-500 mt-1">
                      {createForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <Label htmlFor="create-description">Description</Label>
                  <Input
                    id="create-description"
                    {...createForm.register('description')}
                    placeholder="Short description"
                  />
                  {createForm.formState.errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {createForm.formState.errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="create-type">Type *</Label>
                  <Select
                    value={watchTypeCreate}
                    onValueChange={(value) => createForm.setValue('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCT">Product</SelectItem>
                      <SelectItem value="SERVICE">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="create-category">Category *</Label>
                  <Input
                    id="create-category"
                    {...createForm.register('category')}
                    placeholder="e.g., Electronics, Services"
                  />
                  {createForm.formState.errors.category && (
                    <p className="text-sm text-red-500 mt-1">
                      {createForm.formState.errors.category.message}
                    </p>
                  )}
                </div>

                {watchTypeCreate === 'PRODUCT' && (
                  <div>
                    <Label htmlFor="create-stock">Stock</Label>
                    <Input
                      id="create-stock"
                      type="number"
                      step="0.01"
                      {...createForm.register('stock', { valueAsNumber: true })}
                      placeholder="0"
                    />
                    {createForm.formState.errors.stock && (
                      <p className="text-sm text-red-500 mt-1">
                        {createForm.formState.errors.stock.message}
                      </p>
                    )}
                  </div>
                )}

                {watchTypeCreate === 'SERVICE' && (
                  <div>
                    <Label>Stock</Label>
                    <Input value="N/A" disabled className="bg-gray-50" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Services cannot have stock
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="create-salePrice">Sale Price *</Label>
                  <Input
                    id="create-salePrice"
                    type="number"
                    step="0.01"
                    {...createForm.register('salePrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {createForm.formState.errors.salePrice && (
                    <p className="text-sm text-red-500 mt-1">
                      {createForm.formState.errors.salePrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="create-purchasePrice">Purchase Price *</Label>
                  <Input
                    id="create-purchasePrice"
                    type="number"
                    step="0.01"
                    {...createForm.register('purchasePrice', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {createForm.formState.errors.purchasePrice && (
                    <p className="text-sm text-red-500 mt-1">
                      {createForm.formState.errors.purchasePrice.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false)
                    createForm.reset()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Item'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PRODUCT">Products</SelectItem>
                <SelectItem value="SERVICE">Services</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="PASSIVE">Passive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Items Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => {
                setSortBy('name')
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }}>
                Item Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => {
                setSortBy('stock')
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }}>
                Stock {sortBy === 'stock' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right cursor-pointer" onClick={() => {
                setSortBy('salePrice')
                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
              }}>
                Sale Price {sortBy === 'salePrice' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead className="text-right">Purchase Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading items...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.status === 'PASSIVE' ? 'opacity-50' : ''}
                >
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {item.type === 'SERVICE' ? (
                      <span className="text-muted-foreground">N/A</span>
                    ) : (
                      item.stock?.toFixed(2) || '0.00'
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${item.salePrice?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    ${item.purchasePrice?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(item)}
                        disabled={toggleStatusMutation.isPending}
                        title={item.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      >
                        {item.status === 'ACTIVE' ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>
              Update item information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  {...editForm.register('name')}
                  placeholder="Item name"
                />
                {editForm.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">
                    {editForm.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  {...editForm.register('description')}
                  placeholder="Short description"
                />
              </div>

              <div>
                <Label htmlFor="edit-type">Type *</Label>
                <Select
                  value={watchTypeEdit}
                  onValueChange={(value) => editForm.setValue('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCT">Product</SelectItem>
                    <SelectItem value="SERVICE">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Input
                  id="edit-category"
                  {...editForm.register('category')}
                  placeholder="e.g., Electronics, Services"
                />
              </div>

              {watchTypeEdit === 'PRODUCT' && (
                <div>
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    step="0.01"
                    {...editForm.register('stock', { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              )}

              {watchTypeEdit === 'SERVICE' && (
                <div>
                  <Label>Stock</Label>
                  <Input value="N/A" disabled className="bg-gray-50" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Services cannot have stock
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="edit-salePrice">Sale Price *</Label>
                <Input
                  id="edit-salePrice"
                  type="number"
                  step="0.01"
                  {...editForm.register('salePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="edit-purchasePrice">Purchase Price *</Label>
                <Input
                  id="edit-purchasePrice"
                  type="number"
                  step="0.01"
                  {...editForm.register('purchasePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select
                  value={editForm.watch('status')}
                  onValueChange={(value) => editForm.setValue('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PASSIVE">Passive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingItem(null)
                  editForm.reset()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{itemToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
