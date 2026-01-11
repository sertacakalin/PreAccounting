/**
 * User Management Page
 * Full CRUD operations for users
 */

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { userService } from '@/services/user.service'
import { companyService } from '@/services/company.service'
import type { User } from '@/types/user.types'
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

// Validation schema
const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'CUSTOMER']),
  companyId: z.number().optional(),
}).refine((data) => {
  if (data.role === 'CUSTOMER' && !data.companyId) {
    return false
  }
  return true
}, {
  message: 'Company is required for CUSTOMER role',
  path: ['companyId'],
})

type UserFormData = z.infer<typeof userSchema>

export function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const queryClient = useQueryClient()

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  })

  // Fetch companies for dropdown
  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: companyService.getAll,
  })

  // Forms
  const createForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      role: 'CUSTOMER',
    },
  })

  const editForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  })

  // Watch role to show/hide company field
  const createRole = createForm.watch('role')
  const editRole = editForm.watch('role')

  // Mutations
  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
      setIsCreateDialogOpen(false)
      createForm.reset()
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create user')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<UserFormData> }) =>
      userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated successfully')
      setIsEditDialogOpen(false)
      setEditingUser(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    },
  })

  // Handlers
  const onCreateSubmit = (data: UserFormData) => {
    const payload = {
      username: data.username,
      password: data.password,
      role: data.role,
      ...(data.role === 'CUSTOMER' && data.companyId && { companyId: data.companyId }),
    }
    createMutation.mutate(payload)
  }

  const onEditSubmit = (data: UserFormData) => {
    if (editingUser) {
      const payload = {
        username: data.username,
        role: data.role,
        ...(data.password && { password: data.password }),
        ...(data.role === 'CUSTOMER' && data.companyId && { companyId: data.companyId }),
      }
      updateMutation.mutate({ id: editingUser.id, data: payload })
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    editForm.reset({
      username: user.username,
      password: '',
      role: user.role,
      companyId: user.companyId,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number, username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and permissions</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">
              {users.filter((u) => u.role === 'ADMIN').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Customer Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              {users.filter((u) => u.role === 'CUSTOMER').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.companyName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id, user.username)}
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
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the system. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-username">Username *</Label>
              <Input id="create-username" {...createForm.register('username')} />
              {createForm.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-password">Password *</Label>
              <Input
                id="create-password"
                type="password"
                {...createForm.register('password')}
              />
              {createForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-role">Role *</Label>
              <Select
                value={createRole}
                onValueChange={(value) =>
                  createForm.setValue('role', value as 'ADMIN' | 'CUSTOMER')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
              {createForm.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {createForm.formState.errors.role.message}
                </p>
              )}
            </div>

            {createRole === 'CUSTOMER' && (
              <div className="space-y-2">
                <Label htmlFor="create-company">Company *</Label>
                <Select
                  value={createForm.watch('companyId')?.toString()}
                  onValueChange={(value) =>
                    createForm.setValue('companyId', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {createForm.formState.errors.companyId && (
                  <p className="text-sm text-destructive">
                    {createForm.formState.errors.companyId.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Leave password empty to keep current password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username *</Label>
              <Input id="edit-username" {...editForm.register('username')} />
              {editForm.formState.errors.username && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave empty to keep current"
                {...editForm.register('password')}
              />
              {editForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={editRole}
                onValueChange={(value) =>
                  editForm.setValue('role', value as 'ADMIN' | 'CUSTOMER')
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
              {editForm.formState.errors.role && (
                <p className="text-sm text-destructive">
                  {editForm.formState.errors.role.message}
                </p>
              )}
            </div>

            {editRole === 'CUSTOMER' && (
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company *</Label>
                <Select
                  value={editForm.watch('companyId')?.toString()}
                  onValueChange={(value) =>
                    editForm.setValue('companyId', parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editForm.formState.errors.companyId && (
                  <p className="text-sm text-destructive">
                    {editForm.formState.errors.companyId.message}
                  </p>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
