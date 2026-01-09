export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-16 bg-muted/50">
      <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
          <div>
            <h3 className="font-semibold mb-1">Sign Up</h3>
            <p className="text-muted-foreground">Create your account in seconds</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
          <div>
            <h3 className="font-semibold mb-1">Add Data</h3>
            <p className="text-muted-foreground">Input your financial information</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
          <div>
            <h3 className="font-semibold mb-1">Track & Manage</h3>
            <p className="text-muted-foreground">Monitor and manage your finances</p>
          </div>
        </div>
      </div>
    </section>
  )
}
