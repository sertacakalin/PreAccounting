import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings, Save } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'

// Validation schema
const settingsSchema = z.object({
  defaultCurrency: z.string().min(1, 'Currency is required').max(10),
  vatRates: z.string().min(1, 'VAT rates are required'),
  invoiceNumberFormat: z.string().min(1, 'Invoice number format is required'),
  aiDailyLimit: z.string().min(1, 'AI daily limit is required'),
  aiMonthlyLimit: z.string().min(1, 'AI monthly limit is required'),
})

export function SystemSettingsPage() {
  const queryClient = useQueryClient()

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.get('/admin/settings')
      return response.data
    },
  })

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        defaultCurrency: data.defaultCurrency,
        vatRates: data.vatRates.split(',').map(v => parseInt(v.trim())),
        invoiceNumberFormat: data.invoiceNumberFormat,
        aiDailyLimit: parseInt(data.aiDailyLimit),
        aiMonthlyLimit: parseInt(data.aiMonthlyLimit),
      }
      const response = await api.put('/admin/settings', payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Settings updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    },
  })

  // Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(settingsSchema),
    values: settings ? {
      defaultCurrency: settings.defaultCurrency || 'USD',
      vatRates: settings.vatRates?.join(', ') || '0, 8, 18',
      invoiceNumberFormat: settings.invoiceNumberFormat || 'INV-{YYYY}-{####}',
      aiDailyLimit: settings.aiDailyLimit?.toString() || '10',
      aiMonthlyLimit: settings.aiMonthlyLimit?.toString() || '100',
    } : undefined,
  })

  const onSubmit = (data) => {
    updateMutation.mutate(data)
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Error loading settings: {error.message}</div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          System Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Settings Form */}
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* General Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">General Settings</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">
                  Default Currency <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="defaultCurrency"
                  placeholder="USD, EUR, TRY, etc."
                  {...register('defaultCurrency')}
                />
                {errors.defaultCurrency && (
                  <p className="text-sm text-red-500">{errors.defaultCurrency.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  The default currency code for transactions
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vatRates">
                  VAT Rates (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="vatRates"
                  placeholder="0, 8, 18"
                  {...register('vatRates')}
                />
                {errors.vatRates && (
                  <p className="text-sm text-red-500">{errors.vatRates.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Comma-separated VAT rate percentages
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Invoice Settings</h2>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumberFormat">
                Invoice Number Format <span className="text-red-500">*</span>
              </Label>
              <Input
                id="invoiceNumberFormat"
                placeholder="INV-{YYYY}-{####}"
                {...register('invoiceNumberFormat')}
              />
              {errors.invoiceNumberFormat && (
                <p className="text-sm text-red-500">{errors.invoiceNumberFormat.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Use placeholders: {'{YYYY}'} for year, {'{MM}'} for month, {'{####}'} for sequential number
              </p>
            </div>
          </div>

          {/* AI Assistant Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">AI Assistant Limits</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="aiDailyLimit">
                  Daily Query Limit <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="aiDailyLimit"
                  type="number"
                  min="1"
                  placeholder="10"
                  {...register('aiDailyLimit')}
                />
                {errors.aiDailyLimit && (
                  <p className="text-sm text-red-500">{errors.aiDailyLimit.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum AI queries per day per company
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiMonthlyLimit">
                  Monthly Query Limit <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="aiMonthlyLimit"
                  type="number"
                  min="1"
                  placeholder="100"
                  {...register('aiMonthlyLimit')}
                />
                {errors.aiMonthlyLimit && (
                  <p className="text-sm text-red-500">{errors.aiMonthlyLimit.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum AI queries per month per company
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Current Settings Summary */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Current Configuration</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Currency</div>
            <div className="text-lg font-medium">{settings?.defaultCurrency || 'Not set'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">VAT Rates</div>
            <div className="text-lg font-medium">
              {settings?.vatRates?.join(', ') || 'Not set'}%
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Invoice Format</div>
            <div className="text-lg font-medium font-mono">
              {settings?.invoiceNumberFormat || 'Not set'}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">AI Limits</div>
            <div className="text-lg font-medium">
              {settings?.aiDailyLimit || 0} daily / {settings?.aiMonthlyLimit || 0} monthly
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
