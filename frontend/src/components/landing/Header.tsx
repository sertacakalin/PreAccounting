import { Button } from '@/components/ui/button'
import { DollarSign } from 'lucide-react'

interface HeaderProps {
  onLoginClick?: () => void
}

export function Header({ onLoginClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <DollarSign className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">PreAccounting</h1>
            <p className="text-xs text-muted-foreground">Financial Management</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onLoginClick}>
            Login
          </Button>
          <Button onClick={onLoginClick}>
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
