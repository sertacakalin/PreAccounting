import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Search, TrendingUp, TrendingDown, Edit, Trash2, DollarSign } from 'lucide-react'
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
const incomeExpenseSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().max(500).optional(),
  categoryId: z.coerce.number().min(1, 'Category is required'),
})

export function IncomeExpensePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // all, income, expense
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const queryClient = useQueryClient()

  // Fetch income/expenses
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['income-expenses'],
    queryFn: async () => {
      const response = await api.get('/income-expenses')
      return response.data
    },
  })

  // Fetch income categories
  const { data: incomeCategories = [] } = useQuery({
    queryKey: ['income-categories'],
    queryFn: async () => {
      const response = await api.get('/admin/categories/income')
      return response.data
    },
  })

  // Fetch expense categories
  const { data: expenseCategories = [] } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const response = await api.get('/admin/categories/expense')
      return response.data
    },
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/income-expenses', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses'] })
      toast.success('Record created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create record')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await api.put(`/income-expenses/${id}`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses'] })
      toast.success('Record updated successfully')
      setIsEditDialogOpen(false)
      setEditingItem(null)
      editForm.reset()
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update record')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/income-expenses/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income-expenses'] })
      toast.success('Record deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete record')
    },
  })

  // Create form
  const createForm = useForm({
    resolver: zodResolver(incomeExpenseSchema),
    defaultValues: {
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      categoryId: '',
    },
  })

  // Edit form
  const editForm = useForm({
    resolver: zodResolver(incomeExpenseSchema),
    defaultValues: {
      amount: '',
      date: '',
      description: '',
      categoryId: '',
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
      amount: item.amount,
      date: item.date,
      description: item.description || '',
      categoryId: item.categoryId,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id, description) => {
    if (window.confirm(`Are you sure you want to delete "${description || 'this record'}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  // Filter items
  const filteredItems = items
    .filter((item) => {
      if (filterType === 'income') return item.categoryType === 'INCOME'
      if (filterType === 'expense') return item.categoryType === 'EXPENSE'
      return true
    })
    .filter(
      (item) =>
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    )

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading data: {error.message}</div>
      </div>
    )
  }

  const FormFields = ({ form, isEdit = false }) => {
    const selectedCategoryId = form.watch('categoryId')
    const selectedCategory = [...incomeCategories, ...expenseCategories].find(
      (cat) => cat.id === parseInt(selectedCategoryId)
    )
    const categoryType = selectedCategory?.type

    return (
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">
            Category <span className="text-red-500">*</span>
          </Label>
          <select
            id="categoryId"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...form.register('categoryId')}
          >
            <option value="">Select a category</option>
            <optgroup label="Income Categories">
              {incomeCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Expense Categories">
              {expenseCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </optgroup>
          </select>
          {form.formState.errors.categoryId && (
            <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
          )}
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
          <Label htmlFor="date">
            Date <span className="text-red-500">*</span>
          </Label>
          <Input id="date" type="date" {...form.register('date')} />
          {form.formState.errors.date && <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...form.register('description')}
          />
          {form.formState.errors.description && (
            <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
          )}
        </div>
      </div>
    )
  }

  // Calculate totals
  const totalIncome = items
    .filter((i) => i.categoryType === 'INCOME')
    .reduce((sum, i) => sum + (i.amount || 0), 0)
  const totalExpense = items
    .filter((i) => i.categoryType === 'EXPENSE')
    .reduce((sum, i) => sum + (i.amount || 0), 0)
  const netProfit = totalIncome - totalExpense

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Income & Expense
          </h1>
          <p className="text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Record</DialogTitle>
              <DialogDescription>Create a new income or expense record.</DialogDescription>
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
                    <TableCell>{item.categoryName}</TableCell>
                    <TableCell>{item.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={item.categoryType === 'INCOME' ? 'success' : 'destructive'}>
                        {item.categoryType === 'INCOME' ? (
                          <TrendingUp className="h-3 w-3 mr-1 inline" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1 inline" />
                        )}
                        {item.categoryType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={item.categoryType === 'INCOME' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}
                      >
                        {item.categoryType === 'INCOME' ? '+' : '-'}${item.amount?.toFixed(2)}
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
        </div>
      </Card>

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
          <div className="text-2xl font-bold mt-1">{items.length}</div>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>Update the record information below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <FormFields form={editForm} isEdit={true} />
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
