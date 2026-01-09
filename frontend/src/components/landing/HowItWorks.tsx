import { Card, CardContent } from '@/components/ui/card'
import { UserPlus, Settings, TrendingUp, CheckCircle } from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your account and get access to the system.',
      step: '01',
    },
    {
      icon: Settings,
      title: 'Set Up Your Business',
      description: 'Add your company details and configure system settings.',
      step: '02',
    },
    {
      icon: TrendingUp,
      title: 'Track & Manage',
      description: 'Record transactions, create invoices, and manage finances.',
      step: '03',
    },
    {
      icon: CheckCircle,
      title: 'Analyze & Report',
      description: 'Generate reports and gain insights into your business.',
      step: '04',
    },
  ]

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/50">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started with PreAccounting in four simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <Card className="relative h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 mt-4 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <step.icon className="h-7 w-7" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>

              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-primary/30" />
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
