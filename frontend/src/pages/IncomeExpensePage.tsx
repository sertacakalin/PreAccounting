/**
 * Income & Expense Page
 * Full CRUD with category management
 */

import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, TrendingUp, TrendingDown, Edit, Trash2, DollarSign, FolderPlus, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { incomeExpenseService } from '@/services/income-expense.service'
import type { IncomeExpense, CategoryType } from '@/types/income-expense.types'
import { useAuth } from '@/contexts/AuthContext'
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

// Validation schemas
const incomeExpenseSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500).or(z.literal('')),
  categoryId: z.number().min(1, 'Category is required'),
})

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  type: z.enum(['INCOME', 'EXPENSE']),
})

type IncomeExpenseFormData = z.infer<typeof incomeExpenseSchema>
type CategoryFormData = z.infer<typeof categorySchema>

export function IncomeExpensePage() {
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<IncomeExpense | null>(null)
  const queryClient = useQueryClient()

  // Fetch income/expenses
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['income-expenses'],
    queryFn: incomeExpenseService.getAll,
  })

  // Fetch categories
  const { data: incomeCategories = [] } = useQuery({
    queryKey: ['income-categories'],
    queryFn: incomeExpenseService.getIncomeCategories,
  })

  const { data: expenseCategories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: incomeExpenseService.getExpenseCategories,
  })

  // Forms
  const createForm = useForm<IncomeExpenseFormData>({
    resolver: zodResolver(incomeExpenseSchema),
    defaultValues: {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      description: '',
      categoryId: 0,
    },
  })

  const editForm = useForm<IncomeExpenseFormData>({
    resolver: zodResolver(incomeExpenseSchema),
  })

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'INCOME',
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: incomeExpenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses'] })
      toast.success('Record created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create record')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IncomeExpenseFormData }) =>
      incomeExpenseService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses'] })
      toast.success('Record updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      editForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update record')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: incomeExpenseService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses'] })
      toast.success('Record deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete record')
    },
  })

  const createCategoryMutation = useMutation({
    mutationFn: incomeExpenseService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-categories'] })
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
      toast.success('Category created successfully')
      setIsCategoryDialogOpen(false)
      categoryForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category')
    },
  })

  // Handlers
  const onCreateSubmit = (data: IncomeExpenseFormData) => {
    const cleanedData = {
      ...data,
      description: data.description === '' ? undefined : data.description,
    }
    createMutation.mutate(cleanedData)
  }

  const onEditSubmit = (data: IncomeExpenseFormData) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data })
    }
  }

  const handleEdit = (item: IncomeExpense) => {
    setEditingItem(item)
    editForm.reset({
      amount: item.amount,
      date: item.date,
      description: item.description || '',
      categoryId: item.categoryId,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number, description?: string) => {
    if (window.confirm(`Are you sure you want to delete "${description || 'this record'}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  const categoryById = useMemo(() => {
    const map = new Map<number, (typeof incomeCategories)[number] | (typeof expenseCategories)[number]>()
    incomeCategories.forEach((cat) => map.set(cat.id, cat))
    expenseCategories.forEach((cat) => map.set(cat.id, cat))
    return map
  }, [incomeCategories, expenseCategories])

  const enrichedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      category: item.category ?? categoryById.get(item.categoryId),
    }))
  }, [items, categoryById])

  // Filter items
  const filteredItems = enrichedItems
    .filter((item) => {
      if (filterType === 'income') return item.category?.type === 'INCOME'
      if (filterType === 'expense') return item.category?.type === 'EXPENSE'
      return true
    })
    .filter((item) =>
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  const getAmount = (value: number | string | null | undefined) => {
    const parsed = typeof value === 'number' ? value : Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }

  // Calculate totals
  const totalIncome = enrichedItems
    .filter((i) => i.category?.type === 'INCOME')
    .reduce((sum, i) => sum + getAmount(i.amount), 0)

  const totalExpense = enrichedItems
    .filter((i) => i.category?.type === 'EXPENSE')
    .reduce((sum, i) => sum + getAmount(i.amount), 0)

  const netProfit = totalIncome - totalExpense

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 max-w-md">
          <p className="text-destructive">Error loading data: {(error as Error).message}</p>
        </Card>
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
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Income & Expense</h1>
              <p className="text-xs text-muted-foreground">Welcome, {user?.username}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Income</div>
            <div className="text-2xl font-bold mt-1 text-green-600">${totalIncome.toFixed(2)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Expense</div>
            <div className="text-2xl font-bold mt-1 text-red-600">${totalExpense.toFixed(2)}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Net Profit/Loss</div>
            <div className={`text-2xl font-bold mt-1 ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${netProfit.toFixed(2)}
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Records</div>
            <div className="text-2xl font-bold mt-1">{enrichedItems.length}</div>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button
                variant={filterType === 'income' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('income')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Income
              </Button>
              <Button
                variant={filterType === 'expense' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('expense')}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                Expense
              </Button>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description or category..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Table */}
        <Card>
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
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.category?.name}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.category?.type === 'INCOME' ? 'success' : 'destructive'}>
                        {item.category?.type === 'INCOME' ? (
                          <TrendingUp className="h-3 w-3 mr-1 inline" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1 inline" />
                        )}
                        {item.category?.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={item.category?.type === 'INCOME' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}
                      >
                        {item.category?.type === 'INCOME' ? '+' : '-'}${getAmount(item.amount).toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id, item.description)}
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
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Record</DialogTitle>
            <DialogDescription>Create a new income or expense record.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="create-category">Category</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCategoryDialogOpen(true)}
                  className="h-auto p-1 text-xs"
                >
                  <FolderPlus className="h-3 w-3 mr-1" />
                  New Category
                </Button>
              </div>
              <select
                id="create-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...createForm.register('categoryId', { valueAsNumber: true })}
              >
                <option value="">Select a category</option>
                {incomeCategories.length > 0 && (
                  <optgroup label="Income Categories">
                    {incomeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {expenseCategories.length > 0 && (
                  <optgroup label="Expense Categories">
                    {expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {createForm.formState.errors.categoryId && (
                <p className="text-sm text-destructive">{createForm.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-amount">Amount</Label>
              <Input
                id="create-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...createForm.register('amount', { valueAsNumber: true })}
              />
              {createForm.formState.errors.amount && (
                <p className="text-sm text-destructive">{createForm.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-date">Date</Label>
              <Input id="create-date" type="date" {...createForm.register('date')} />
              {createForm.formState.errors.date && (
                <p className="text-sm text-destructive">{createForm.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description (Optional)</Label>
              <textarea
                id="create-description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...createForm.register('description')}
              />
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
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>Update the record information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <select
                id="edit-category"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...editForm.register('categoryId', { valueAsNumber: true })}
              >
                <option value="">Select a category</option>
                {incomeCategories.length > 0 && (
                  <optgroup label="Income Categories">
                    {incomeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {expenseCategories.length > 0 && (
                  <optgroup label="Expense Categories">
                    {expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {editForm.formState.errors.categoryId && (
                <p className="text-sm text-destructive">{editForm.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...editForm.register('amount', { valueAsNumber: true })}
              />
              {editForm.formState.errors.amount && (
                <p className="text-sm text-destructive">{editForm.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" type="date" {...editForm.register('date')} />
              {editForm.formState.errors.date && (
                <p className="text-sm text-destructive">{editForm.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <textarea
                id="edit-description"
                rows={3}
                className="flex w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...editForm.register('description')}
              />
            </div>

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

      {/* Create Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create Category</DialogTitle>
            <DialogDescription>Add a new income or expense category.</DialogDescription>
          </DialogHeader>
          <form onSubmit={categoryForm.handleSubmit((data) => createCategoryMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g., Sales, Rent, Utilities"
                {...categoryForm.register('name')}
              />
              {categoryForm.formState.errors.name && (
                <p className="text-sm text-destructive">{categoryForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-type">Type</Label>
              <Select
                value={categoryForm.watch('type')}
                onValueChange={(value) => categoryForm.setValue('type', value as CategoryType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                      Income
                    </div>
                  </SelectItem>
                  <SelectItem value="EXPENSE">
                    <div className="flex items-center">
                      <TrendingDown className="h-4 w-4 mr-2 text-red-600" />
                      Expense
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {categoryForm.formState.errors.type && (
                <p className="text-sm text-destructive">{categoryForm.formState.errors.type.message}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCategoryDialogOpen(false)
                  categoryForm.reset()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
