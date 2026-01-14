import { NavLink } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { ROUTES } from '@/config/routes'
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  LogOut,
  DollarSign,
  Coins,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AdminSidebar() {
  const { user, logout } = useAuth()

  const navItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: ROUTES.ADMIN_DASHBOARD,
    },
    {
      label: 'Users',
      icon: Users,
      path: ROUTES.ADMIN_USERS,
    },
    {
      label: 'Companies',
      icon: Building2,
      path: ROUTES.ADMIN_COMPANIES,
    },
    {
      label: 'Currencies',
      icon: Coins,
      path: ROUTES.ADMIN_CURRENCIES,
    },
    {
      label: 'Settings',
      icon: Settings,
      path: ROUTES.ADMIN_SETTINGS,
    },
  ]

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <DollarSign className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold">PreAccounting</h1>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-muted/50 p-3">
          <p className="text-xs font-medium text-muted-foreground">Logged in as</p>
          <p className="text-sm font-semibold">{user?.username}</p>
          <p className="text-xs text-muted-foreground">{user?.role}</p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )
}
