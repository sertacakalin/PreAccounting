/**
 * Admin Settings Page
 * System-wide configuration and settings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { systemSettingsService } from '@/services/system-settings.service'
import { currencyService } from '@/services/currency.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Validation schema
const settingsSchema = z.object({
  defaultCurrency: z.string().optional(),
  vatRates: z.array(z.object({ value: z.number().min(0).max(100) })),
  invoiceNumberFormat: z.string().optional(),
  aiDailyLimit: z.number().min(1).optional(),
  aiMonthlyLimit: z.number().min(1).optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

// Transform function to convert between API format and form format
const toFormData = (vatRates: number[]): { value: number }[] =>
  vatRates.map(rate => ({ value: rate }))

const toApiData = (vatRates: { value: number }[]): number[] =>
  vatRates.map(item => item.value)

export function AdminSettings() {
  const queryClient = useQueryClient()

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: systemSettingsService.getSettings,
  })

  // Fetch currencies for dropdown
  const { data: currencies = [] } = useQuery({
    queryKey: ['currencies'],
    queryFn: currencyService.getAll,
  })

  // Form
  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    values: settings ? {
      defaultCurrency: settings.defaultCurrency || '',
      vatRates: toFormData(settings.vatRates || []),
      invoiceNumberFormat: settings.invoiceNumberFormat || '',
      aiDailyLimit: settings.aiDailyLimit || 10,
      aiMonthlyLimit: settings.aiMonthlyLimit || 300,
    } : undefined,
  })

  const { fields, append, remove } = useFieldArray<SettingsFormData>({
    control: form.control,
    name: 'vatRates',
  })

  // Mutation
  const updateMutation = useMutation({
    mutationFn: systemSettingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] })
      toast.success('Settings updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings')
    },
  })

  const onSubmit = (data: SettingsFormData) => {
    updateMutation.mutate({
      ...data,
      vatRates: toApiData(data.vatRates),
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Configure system-wide settings and preferences</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure general system preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select
                value={form.watch('defaultCurrency')}
                onValueChange={(value) => form.setValue('defaultCurrency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                The default currency used for new invoices and transactions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumberFormat">Invoice Number Format</Label>
              <Input
                id="invoiceNumberFormat"
                placeholder="e.g., INV-{YYYY}-{MM}-{####}"
                {...form.register('invoiceNumberFormat')}
              />
              <p className="text-sm text-muted-foreground">
                Format for generating invoice numbers. Use {'{YYYY}'} for year, {'{MM}'} for month, {'{####}'} for sequence
              </p>
            </div>
          </CardContent>
        </Card>

        {/* VAT Rates */}
        <Card>
          <CardHeader>
            <CardTitle>VAT Rates</CardTitle>
            <CardDescription>
              Configure available VAT rates for invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="VAT Rate (%)"
                  {...form.register(`vatRates.${index}.value`, { valueAsNumber: true })}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ value: 0 })}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add VAT Rate
            </Button>
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI Assistant Settings</CardTitle>
            <CardDescription>
              Configure AI assistant usage limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aiDailyLimit">Daily Query Limit</Label>
                <Input
                  id="aiDailyLimit"
                  type="number"
                  min="1"
                  placeholder="10"
                  {...form.register('aiDailyLimit', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum queries per user per day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aiMonthlyLimit">Monthly Query Limit</Label>
                <Input
                  id="aiMonthlyLimit"
                  type="number"
                  min="1"
                  placeholder="300"
                  {...form.register('aiMonthlyLimit', { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum queries per user per month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </form>
    </div>
  )
}
