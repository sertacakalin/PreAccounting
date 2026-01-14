export function Hero() {
  return (
    <section className="relative overflow-hidden gradient-finance">
      <div className="container px-4 py-20 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main Heading */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Pre-Accounting
            <span className="block text-primary">Management System</span>
          </h1>

          {/* Description */}
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl md:text-2xl max-w-2xl mx-auto">
            Complete financial management solution for your business, now integrated with AI to automate insights and workflows.
          </p>

        </div>
      </div>

      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 blur-3xl opacity-20">
          <div className="aspect-square w-[800px] rounded-full bg-gradient-to-br from-primary to-secondary" />
        </div>
      </div>
    </section>
  )
}
