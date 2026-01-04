import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  CreditCard,
  Bot,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function DashboardLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const adminLinks = [
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
    { to: '/admin/audit', icon: FileText, label: 'Audit Logs' },
  ]

  const customerLinks = [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/app/items', icon: Package, label: 'Items' },
    { to: '/app/customers', icon: Users, label: 'Customers' },
    { to: '/app/invoices', icon: FileText, label: 'Invoices' },
    { to: '/app/income-expense', icon: DollarSign, label: 'Income/Expense' },
    { to: '/app/payments', icon: CreditCard, label: 'Payments' },
    { to: '/app/ai', icon: Bot, label: 'AI Assistant' },
  ]

  const links = isAdmin ? adminLinks : customerLinks

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0 lg:static`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b">
          <h1 className="text-xl font-bold">PreAccounting</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              )
            })}
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="mb-2 px-3 text-sm text-muted-foreground">
            {user?.username} ({user?.role})
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-card px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
