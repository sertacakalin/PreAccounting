/**
 * Items (Products/Services) Page
 * Full CRUD operations
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, Edit, Trash2, Package, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { itemService } from '@/services/item.service'
import type { Item } from '@/types/item.types'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
const itemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().max(500).optional().or(z.literal('')),
  type: z.enum(['PRODUCT', 'SERVICE']),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  stock: z.number().min(0, 'Stock cannot be negative').optional(),
  salePrice: z.number().min(0, 'Sale price must be positive'),
  purchasePrice: z.number().min(0, 'Purchase price must be positive'),
  status: z.enum(['ACTIVE', 'PASSIVE']),
}).superRefine((data, ctx) => {
  if (data.type === 'PRODUCT' && (data.stock === undefined || Number.isNaN(data.stock))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Stock is required for products',
      path: ['stock'],
    })
  }
})

type ItemFormData = z.infer<typeof itemSchema>

export function ItemsPage() {
  const { logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const queryClient = useQueryClient()

  // Fetch items
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => itemService.getAll(),
  })

  // Forms
  const createForm = useForm<ItemFormData>({
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

  const editForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: itemService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create item')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemFormData }) =>
      itemService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update item')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: itemService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] })
      toast.success('Item deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete item')
    },
  })

  // Handlers
  const onCreateSubmit = (data: ItemFormData) => {
    const payload = {
      ...data,
      description: data.description === '' ? undefined : data.description,
      stock: data.type === 'SERVICE' ? undefined : data.stock ?? 0,
    }
    createMutation.mutate(payload)
  }

  const onEditSubmit = (data: ItemFormData) => {
    if (editingItem) {
      const payload = {
        ...data,
        description: data.description === '' ? undefined : data.description,
        stock: data.type === 'SERVICE' ? undefined : data.stock ?? 0,
      }
      updateMutation.mutate({ id: editingItem.id, data: payload })
    }
  }

  const handleEdit = (item: Item) => {
    setEditingItem(item)
    editForm.reset({
      name: item.name,
      description: item.description || '',
      type: item.type,
      category: item.category,
      stock: item.stock ?? 0,
      salePrice: item.salePrice,
      purchasePrice: item.purchasePrice,
      status: item.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  // Filter items
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const totalItems = items.length
  const totalValue = items.reduce((sum, item) => sum + (item.salePrice * (item.stock || 0)), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading items...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Items Management</h1>
              <p className="text-xs text-muted-foreground">Products & Services</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Inventory Value</p>
              <p className="text-2xl font-bold text-primary">${totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
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
                  <TableHead>Category</TableHead>
                  <TableHead>Sale Price</TableHead>
                  <TableHead>Purchase Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-primary font-semibold">${item.salePrice.toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">${item.purchasePrice.toFixed(2)}</TableCell>
                      <TableCell>{item.stock || 0}</TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                            onClick={() => handleDelete(item.id, item.name)}
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
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription>Create a new product or service.</DialogDescription>
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
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-category">Category *</Label>
              <Input id="create-category" {...createForm.register('category')} />
              {createForm.formState.errors.category && (
                <p className="text-sm text-destructive">{createForm.formState.errors.category.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-salePrice">Sale Price *</Label>
                <Input
                  id="create-salePrice"
                  type="number"
                  step="0.01"
                  {...createForm.register('salePrice', { valueAsNumber: true })}
                />
                {createForm.formState.errors.salePrice && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.salePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-purchasePrice">Purchase Price *</Label>
                <Input
                  id="create-purchasePrice"
                  type="number"
                  step="0.01"
                  {...createForm.register('purchasePrice', { valueAsNumber: true })}
                />
                {createForm.formState.errors.purchasePrice && (
                  <p className="text-sm text-destructive">{createForm.formState.errors.purchasePrice.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-stock">Stock</Label>
              <Input
                id="create-stock"
                type="number"
                disabled={createForm.watch('type') === 'SERVICE'}
                {...createForm.register('stock', { valueAsNumber: true })}
              />
              {createForm.formState.errors.stock && (
                <p className="text-sm text-destructive">{createForm.formState.errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-status">Status *</Label>
              <select
                id="create-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...createForm.register('status')}
              >
                <option value="ACTIVE">Active</option>
                <option value="PASSIVE">Passive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Input id="create-description" {...createForm.register('description')} />
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
            <DialogTitle>Edit Item</DialogTitle>
            <DialogDescription>Update item information.</DialogDescription>
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
                <option value="PRODUCT">Product</option>
                <option value="SERVICE">Service</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Input id="edit-category" {...editForm.register('category')} />
              {editForm.formState.errors.category && (
                <p className="text-sm text-destructive">{editForm.formState.errors.category.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-salePrice">Sale Price *</Label>
                <Input
                  id="edit-salePrice"
                  type="number"
                  step="0.01"
                  {...editForm.register('salePrice', { valueAsNumber: true })}
                />
                {editForm.formState.errors.salePrice && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.salePrice.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-purchasePrice">Purchase Price *</Label>
                <Input
                  id="edit-purchasePrice"
                  type="number"
                  step="0.01"
                  {...editForm.register('purchasePrice', { valueAsNumber: true })}
                />
                {editForm.formState.errors.purchasePrice && (
                  <p className="text-sm text-destructive">{editForm.formState.errors.purchasePrice.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input
                id="edit-stock"
                type="number"
                disabled={editForm.watch('type') === 'SERVICE'}
                {...editForm.register('stock', { valueAsNumber: true })}
              />
              {editForm.formState.errors.stock && (
                <p className="text-sm text-destructive">{editForm.formState.errors.stock.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status *</Label>
              <select
                id="edit-status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                {...editForm.register('status')}
              >
                <option value="ACTIVE">Active</option>
                <option value="PASSIVE">Passive</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" {...editForm.register('description')} />
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
