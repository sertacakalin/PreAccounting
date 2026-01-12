/**
 * AI Assistant Component
 * Chat interface for AI-powered accounting assistance
 */

import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { aiService } from '@/services/ai.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const querySchema = z.object({
  query: z.string().min(1, 'Please enter a question'),
})

type QueryFormData = z.infer<typeof querySchema>

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI accounting assistant. I can help you with questions about your finances, invoices, expenses, and more. How can I assist you today?',
      timestamp: new Date(),
    },
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Fetch usage stats
  const { data: usageStats } = useQuery({
    queryKey: ['ai-usage-stats'],
    queryFn: aiService.getUsageStats,
    enabled: isOpen,
  })

  // Form
  const form = useForm<QueryFormData>({
    resolver: zodResolver(querySchema),
    defaultValues: {
      query: '',
    },
  })

  // Mutation
  const queryMutation = useMutation({
    mutationFn: aiService.query,
    onSuccess: (data) => {
      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
        },
      ])

      // Show limit warning if approaching limit
      if (data.limitReached) {
        toast.warning('AI query limit reached. Please contact your administrator.')
      } else if (data.remainingDailyQueries !== undefined && data.remainingDailyQueries < 5) {
        toast.warning(`Only ${data.remainingDailyQueries} daily queries remaining.`)
      }

      // Refresh usage stats
      queryClient.invalidateQueries({ queryKey: ['ai-usage-stats'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to get AI response')
      // Remove the pending message on error
      setMessages((prev) => prev.slice(0, -1))
    },
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = (data: QueryFormData) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: data.query,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Clear input
    form.reset()

    // Send query
    queryMutation.mutate(data.query)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <Bot className="h-6 w-6" />
        </Button>
      )}

      {/* AI Assistant Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-background border-l shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">AI Assistant</h2>
                <p className="text-xs text-muted-foreground">Powered by AI</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Usage Stats */}
          {usageStats && (
            <div className="p-4 border-b bg-muted/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Queries Today:</span>
                <Badge variant="secondary">
                  {usageStats.dailyUsed || 0} / {usageStats.dailyLimit || 'Unlimited'}
                </Badge>
              </div>
              {usageStats.monthlyLimit && (
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Queries This Month:</span>
                  <Badge variant="secondary">
                    {usageStats.monthlyUsed || 0} / {usageStats.monthlyLimit}
                  </Badge>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.type === 'user'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {queryMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="p-4 border-t">
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
              <Input
                placeholder="Ask a question..."
                {...form.register('query')}
                disabled={queryMutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={queryMutation.isPending || !form.watch('query')}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {form.formState.errors.query && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.query.message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
