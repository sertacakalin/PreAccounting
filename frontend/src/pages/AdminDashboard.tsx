/**
 * Admin Dashboard Page
 * System-wide overview and management
 */

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { adminService } from '@/services/admin.service'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  LogOut,
  Users,
  Building2,
  ShieldCheck,
  UserCheck,
  Activity,
  Settings,
} from 'lucide-react'
import { format } from 'date-fns'

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
]

// ✅ Safe date helpers (prevents "Invalid time value" crash)
const safeDate = (value?: string | null) => {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const formatDate = (value?: string | null) => {
  const d = safeDate(value)
  return d ? format(d, 'MMM dd, yyyy') : 'N/A'
}

export function AdminDashboard() {
  const { user, logout } = useAuth()

  // Fetch data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getAllUsers(),
  })

  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => adminService.getAllCompanies(),
  })

  const { isLoading: customersLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: adminService.getAllCustomers,
  })

  // Calculate statistics
  const totalUsers = users.length
  const adminUsers = users.filter((u) => u.role === 'ADMIN').length
  const customerUsers = users.filter((u) => u.role === 'CUSTOMER').length

  const totalCompanies = companies.length
  const activeCompanies = companies.filter((c) => c.status === 'ACTIVE').length
  const inactiveCompanies = companies.filter((c) => c.status === 'INACTIVE').length
  const suspendedCompanies = companies.filter((c) => c.status === 'SUSPENDED').length

  // User role distribution for chart
  const userRoleData = [
    { name: 'Admin', value: adminUsers },
    { name: 'Customer', value: customerUsers },
  ]

  // Company status distribution for chart
  const companyStatusData = [
    { name: 'Active', value: activeCompanies },
    { name: 'Inactive', value: inactiveCompanies },
    { name: 'Suspended', value: suspendedCompanies },
  ]

  // Recent users (last 5) - ✅ safe sort
  const recentUsers = [...users]
      .sort((a, b) => {
        const ta = safeDate(a.createdAt)?.getTime() ?? 0
        const tb = safeDate(b.createdAt)?.getTime() ?? 0
        return tb - ta
      })
      .slice(0, 5)

  // Recent companies (last 5) - ✅ safe sort
  const recentCompanies = [...companies]
      .sort((a, b) => {
        const ta = safeDate(a.createdAt)?.getTime() ?? 0
        const tb = safeDate(b.createdAt)?.getTime() ?? 0
        return tb - ta
      })
      .slice(0, 5)

  const isLoading = usersLoading || companiesLoading || customersLoading

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground">System Overview & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{user?.username}</span>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{totalUsers}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {adminUsers} admin • {customerUsers} customer
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Companies */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Companies</p>
                    <p className="text-2xl font-bold">{totalCompanies}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activeCompanies} active</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <Building2 className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Companies */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Companies</p>
                    <p className="text-2xl font-bold text-success">{activeCompanies}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalCompanies > 0 ? ((activeCompanies / totalCompanies) * 100).toFixed(0) : '0'}% of total
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <UserCheck className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">System Status</p>
                    <p className="text-2xl font-bold text-success">Healthy</p>
                    <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                    <Activity className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Role Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                        data={userRoleData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                      {userRoleData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Company Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Company Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={companyStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Users */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No users yet</p>
                ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {user.customerName || 'N/A'}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {formatDate(user.createdAt)}
                              </TableCell>
                            </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" disabled>
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Companies
                </Button>
                <Button className="w-full" variant="outline" disabled>
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>

                <div className="rounded-lg bg-muted/50 p-4 mt-4">
                  <p className="text-sm font-semibold mb-2">Coming Soon:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• User Management Interface</li>
                    <li>• Company Management</li>
                    <li>• System Configuration</li>
                    <li>• Audit Logs</li>
                    <li>• Financial Reports</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Companies</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCompanies.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No companies yet</p>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Tax No</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentCompanies.map((company) => (
                          <TableRow key={company.id}>
                            <TableCell className="font-medium">{company.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{company.email}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {company.taxNo || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                  variant={
                                    company.status === 'ACTIVE'
                                        ? 'default'
                                        : company.status === 'INACTIVE'
                                            ? 'secondary'
                                            : 'destructive'
                                  }
                              >
                                {company.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(company.createdAt)}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
