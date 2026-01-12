/**
 * AI Template Management Page
 * Full CRUD operations for AI prompt templates (Admin only)
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { aiTemplateService } from '@/services/ai-template.service'
import type { AITemplate } from '@/types/ai.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Validation schemas
const createTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  description: z.string().optional(),
  promptTemplate: z.string().min(10, 'Prompt template must be at least 10 characters'),
})

const updateTemplateSchema = z.object({
  name: z.string().min(2, 'Template name must be at least 2 characters'),
  description: z.string().optional(),
  promptTemplate: z.string().min(10, 'Prompt template must be at least 10 characters'),
  active: z.boolean(),
})

type CreateTemplateFormData = z.infer<typeof createTemplateSchema>
type UpdateTemplateFormData = z.infer<typeof updateTemplateSchema>

export function AITemplateManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<AITemplate | null>(null)
  const queryClient = useQueryClient()

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['ai-templates'],
    queryFn: aiTemplateService.getAll,
  })

  // Forms
  const createForm = useForm<CreateTemplateFormData>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      promptTemplate: '',
    },
  })

  const editForm = useForm<UpdateTemplateFormData>({
    resolver: zodResolver(updateTemplateSchema),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: aiTemplateService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-templates'] })
      toast.success('Template created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create template')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UpdateTemplateFormData> }) =>
      aiTemplateService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-templates'] })
      toast.success('Template updated successfully')
      setIsEditDialogOpen(false)
      setEditingTemplate(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update template')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: aiTemplateService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-templates'] })
      toast.success('Template deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete template')
    },
  })

  // Handlers
  const onCreateSubmit = (data: CreateTemplateFormData) => {
    createMutation.mutate(data)
  }

  const onEditSubmit = (data: UpdateTemplateFormData) => {
    if (editingTemplate) {
      updateMutation.mutate({ id: editingTemplate.id, data })
    }
  }

  const handleEdit = (template: AITemplate) => {
    setEditingTemplate(template)
    editForm.reset({
      name: template.name,
      description: template.description || '',
      promptTemplate: template.promptTemplate,
      active: template.active,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete template "${name}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  // Calculate stats
  const activeCount = templates.filter((t) => t.active).length
  const inactiveCount = templates.filter((t) => !t.active).length

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Template Management</h1>
          <p className="text-muted-foreground">Manage AI prompt templates</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{templates.length}</p>
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground">
              No templates found. Create your first AI template to get started.
            </CardContent>
          </Card>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">{template.name}</CardTitle>
                  </div>
                  <Badge variant={template.active ? 'default' : 'secondary'}>
                    {template.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                {template.description && (
                  <CardDescription>{template.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-xs text-muted-foreground mb-1">Prompt Template:</p>
                    <p className="text-sm line-clamp-3">{template.promptTemplate}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(template.id, template.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New AI Template</DialogTitle>
            <DialogDescription>
              Create a new AI prompt template for common queries.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Template Name *</Label>
              <Input
                id="create-name"
                placeholder="e.g., Monthly Summary Report"
                {...createForm.register('name')}
              />
              {createForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Input
                id="create-description"
                placeholder="Describe what this template does"
                {...createForm.register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-promptTemplate">Prompt Template *</Label>
              <textarea
                id="create-promptTemplate"
                placeholder="Enter the AI prompt template. Use {variable} for dynamic values."
                className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...createForm.register('promptTemplate')}
              />
              {createForm.formState.errors.promptTemplate && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.promptTemplate.message}
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
                {createMutation.isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit AI Template</DialogTitle>
            <DialogDescription>Update the AI template details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Template Name *</Label>
              <Input id="edit-name" {...editForm.register('name')} />
              {editForm.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input id="edit-description" {...editForm.register('description')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-promptTemplate">Prompt Template *</Label>
              <textarea
                id="edit-promptTemplate"
                className="w-full min-h-[120px] px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...editForm.register('promptTemplate')}
              />
              {editForm.formState.errors.promptTemplate && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.promptTemplate.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-active"
                {...editForm.register('active')}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="edit-active" className="cursor-pointer">
                Active
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
