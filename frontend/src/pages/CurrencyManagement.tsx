/**
 * Currency Management Page
 * Full CRUD operations for currencies, exchange rates, and currency converter
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, RefreshCw, ArrowRightLeft } from 'lucide-react'
import { toast } from 'sonner'
import { currencyService } from '@/services/currency.service'
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

// Validation schemas
const createCurrencySchema = z.object({
  code: z.string().min(3).max(3, 'Currency code must be exactly 3 characters'),
  name: z.string().min(2, 'Currency name must be at least 2 characters'),
  symbol: z.string().min(1, 'Currency symbol is required'),
})

const converterSchema = z.object({
  fromCurrency: z.string().min(3, 'Please select source currency'),
  toCurrency: z.string().min(3, 'Please select target currency'),
  amount: z.number().positive('Amount must be positive'),
})

type CreateCurrencyFormData = z.infer<typeof createCurrencySchema>
type ConverterFormData = z.infer<typeof converterSchema>

export function CurrencyManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isConverterOpen, setIsConverterOpen] = useState(false)
  const [conversionResult, setConversionResult] = useState<{
    fromAmount: number
    toAmount: number
    rate: number
    fromCurrency: string
    toCurrency: string
  } | null>(null)
  const queryClient = useQueryClient()

  // Fetch all currencies (admin view)
  const { data: currencies = [], isLoading } = useQuery({
    queryKey: ['admin-currencies'],
    queryFn: currencyService.getAllCurrencies,
  })

  // Forms
  const createForm = useForm<CreateCurrencyFormData>({
    resolver: zodResolver(createCurrencySchema),
    defaultValues: {
      code: '',
      name: '',
      symbol: '',
    },
  })

  const converterForm = useForm<ConverterFormData>({
    resolver: zodResolver(converterSchema),
    defaultValues: {
      fromCurrency: '',
      toCurrency: '',
      amount: 0,
    },
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: currencyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] })
      toast.success('Currency created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create currency')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      currencyService.updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] })
      toast.success('Currency status updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status')
    },
  })

  const updateRatesMutation = useMutation({
    mutationFn: currencyService.updateRates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] })
      toast.success('Exchange rates updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update exchange rates')
    },
  })

  const updateAllRatesMutation = useMutation({
    mutationFn: currencyService.updateAllRates,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-currencies'] })
      toast.success('All exchange rates updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update all exchange rates')
    },
  })

  const convertMutation = useMutation({
    mutationFn: ({ from, to, amount }: { from: string; to: string; amount: number }) =>
      currencyService.convert(from, to, amount),
    onSuccess: (data) => {
      setConversionResult(data)
      toast.success('Currency converted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to convert currency')
    },
  })

  // Handlers
  const onCreateSubmit = (data: CreateCurrencyFormData) => {
    createMutation.mutate(data)
  }

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    updateStatusMutation.mutate({ id, isActive: !currentStatus })
  }

  const handleUpdateRates = (baseCurrency: string) => {
    updateRatesMutation.mutate(baseCurrency)
  }

  const handleUpdateAllRates = () => {
    updateAllRatesMutation.mutate()
  }

  const onConvertSubmit = (data: ConverterFormData) => {
    convertMutation.mutate({
      from: data.fromCurrency,
      to: data.toCurrency,
      amount: data.amount,
    })
  }

  // Calculate stats
  const activeCount = currencies.filter((c) => c.isActive).length
  const inactiveCount = currencies.filter((c) => !c.isActive).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading currencies...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Currency Management</h1>
          <p className="text-muted-foreground">Manage currencies and exchange rates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsConverterOpen(true)}>
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Currency Converter
          </Button>
          <Button variant="outline" onClick={handleUpdateAllRates}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Update All Rates
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Currency
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Currencies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currencies.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-500">{inactiveCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Currency Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No currencies found
                  </TableCell>
                </TableRow>
              ) : (
                currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">{currency.code}</TableCell>
                    <TableCell>{currency.name}</TableCell>
                    <TableCell>{currency.symbol}</TableCell>
                    <TableCell>
                      <Badge variant={currency.isActive ? 'default' : 'secondary'}>
                        {currency.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateRates(currency.code)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Update Rates
                        </Button>
                        <Button
                          variant={currency.isActive ? 'secondary' : 'default'}
                          size="sm"
                          onClick={() => handleToggleStatus(currency.id, currency.isActive)}
                        >
                          {currency.isActive ? 'Deactivate' : 'Activate'}
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
            <DialogTitle>Add New Currency</DialogTitle>
            <DialogDescription>
              Add a new currency to the system. Exchange rates will be fetched automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-code">Currency Code *</Label>
              <Input
                id="create-code"
                placeholder="USD"
                maxLength={3}
                {...createForm.register('code')}
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase()
                  createForm.setValue('code', e.target.value)
                }}
              />
              {createForm.formState.errors.code && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-name">Currency Name *</Label>
              <Input
                id="create-name"
                placeholder="US Dollar"
                {...createForm.register('name')}
              />
              {createForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-symbol">Currency Symbol *</Label>
              <Input
                id="create-symbol"
                placeholder="$"
                {...createForm.register('symbol')}
              />
              {createForm.formState.errors.symbol && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.symbol.message}
                </p>
              )}
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
                {createMutation.isPending ? 'Adding...' : 'Add Currency'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Currency Converter Dialog */}
      <Dialog open={isConverterOpen} onOpenChange={setIsConverterOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Currency Converter</DialogTitle>
            <DialogDescription>
              Convert between different currencies using current exchange rates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={converterForm.handleSubmit(onConvertSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-currency">From Currency *</Label>
                <Select
                  value={converterForm.watch('fromCurrency')}
                  onValueChange={(value) => converterForm.setValue('fromCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies
                      .filter((c) => c.isActive)
                      .map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {converterForm.formState.errors.fromCurrency && (
                  <p className="text-sm text-destructive">
                    {converterForm.formState.errors.fromCurrency.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="to-currency">To Currency *</Label>
                <Select
                  value={converterForm.watch('toCurrency')}
                  onValueChange={(value) => converterForm.setValue('toCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies
                      .filter((c) => c.isActive)
                      .map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {converterForm.formState.errors.toCurrency && (
                  <p className="text-sm text-destructive">
                    {converterForm.formState.errors.toCurrency.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...converterForm.register('amount', { valueAsNumber: true })}
              />
              {converterForm.formState.errors.amount && (
                <p className="text-sm text-destructive">
                  {converterForm.formState.errors.amount.message}
                </p>
              )}
            </div>

            {conversionResult && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">From:</span>
                      <span className="font-medium">
                        {conversionResult.fromAmount.toFixed(2)} {conversionResult.fromCurrency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Exchange Rate:</span>
                      <span className="font-medium">{conversionResult.rate.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium">To:</span>
                      <span className="text-lg font-bold text-primary">
                        {conversionResult.toAmount.toFixed(2)} {conversionResult.toCurrency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsConverterOpen(false)
                  setConversionResult(null)
                  converterForm.reset()
                }}
              >
                Close
              </Button>
              <Button type="submit" disabled={convertMutation.isPending}>
                {convertMutation.isPending ? 'Converting...' : 'Convert'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
