import { Card, CardContent } from '@/components/ui/card'
import {
  TrendingUp,
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Globe
} from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Income & Expense Tracking',
      description: 'Monitor all your financial transactions in real-time with detailed categorization.',
    },
    {
      icon: FileText,
      title: 'Invoice Management',
      description: 'Create, send, and track invoices with automated reminders and payment tracking.',
    },
    {
      icon: Users,
      title: 'Customer & Supplier Management',
      description: 'Maintain comprehensive databases of your business contacts and relationships.',
    },
    {
      icon: CreditCard,
      title: 'Payment Processing',
      description: 'Track payments, manage receivables, and reconcile accounts efficiently.',
    },
    {
      icon: BarChart3,
      title: 'Financial Reports',
      description: 'Generate detailed financial reports and insights to drive business decisions.',
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Bank-level security with encrypted data storage and compliance standards.',
    },
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description: 'Lightning-fast performance with intuitive workflows to save you time.',
    },
    {
      icon: Globe,
      title: 'Multi-Company Support',
      description: 'Manage multiple businesses from a single dashboard with ease.',
    },
  ]

  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed to simplify your financial management and help your business grow.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
