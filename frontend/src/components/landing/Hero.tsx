import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface HeroProps {
  onGetStarted?: () => void
}

export function Hero({ onGetStarted }: HeroProps) {
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
            Complete financial management solution for your business. Track income, expenses, invoices, and payments efficiently.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-base" onClick={onGetStarted}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-base" onClick={onGetStarted}>
              Sign In
            </Button>
          </div>
        </div>

        {/* Hero Image/Mockup Placeholder */}
        <div className="mt-16 mx-auto max-w-5xl">
          <div className="relative rounded-xl border bg-background shadow-2xl">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-4">
              <div className="h-full w-full rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center">
                <div className="text-center">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground/40" />
                  <p className="text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
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

function DollarSign({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
