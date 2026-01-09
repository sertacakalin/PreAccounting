interface HeaderProps {
  onLoginClick?: () => void
}

export function Header({ onLoginClick: _onLoginClick }: HeaderProps) {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <h1 className="text-xl font-bold">Pre-Accounting App</h1>
      </div>
    </header>
  )
}
