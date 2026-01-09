interface HeroProps {
  onGetStarted?: () => void
}

export function Hero({ onGetStarted: _onGetStarted }: HeroProps) {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-4xl font-bold mb-4">Welcome to Pre-Accounting</h2>
      <p className="text-xl text-muted-foreground">Manage your finances with ease</p>
    </section>
  )
}
