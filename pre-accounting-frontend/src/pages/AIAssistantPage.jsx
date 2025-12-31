import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AIAssistantPage() {
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const messagesEndRef = useRef(null)

  // Fetch usage stats
  const { data: stats } = useQuery({
    queryKey: ['ai-usage-stats'],
    queryFn: async () => {
      const response = await api.get('/ai/usage-stats')
      return response.data
    },
  })

  // AI query mutation
  const queryMutation = useMutation({
    mutationFn: async (queryText) => {
      const response = await api.post('/ai/query', { query: queryText })
      return response.data
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp,
          remainingDaily: data.remainingDailyQueries,
          remainingMonthly: data.remainingMonthlyQueries,
        },
      ])
    },
    onError: (error) => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'error',
          content: error.response?.data?.message || 'Failed to get response. Please try again.',
        },
      ])
    },
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim() || queryMutation.isPending) return

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: query }])
    queryMutation.mutate(query)
    setQuery('')
  }

  const exampleQueries = [
    'What is my total revenue this month?',
    'Show me my top expenses',
    'How many unpaid invoices do I have?',
    'Summarize my financial status',
  ]

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-purple-500" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground mt-1">Ask questions about your financial data</p>
        </div>
        {stats && (
          <div className="flex gap-2">
            <Badge variant="outline">Daily: {stats.dailyRemaining ?? 'N/A'}</Badge>
            <Badge variant="outline">Monthly: {stats.monthlyRemaining ?? 'N/A'}</Badge>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Bot className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">How can I help you today?</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Ask me anything about your income, expenses, invoices, or financial trends.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {exampleQueries.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery(q)}
                    className="text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role !== 'user' && (
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        msg.role === 'error' ? 'bg-red-100' : 'bg-purple-100'
                      }`}
                    >
                      {msg.role === 'error' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Bot className="h-4 w-4 text-purple-600" />
                      )}
                    </div>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : msg.role === 'error'
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              {queryMutation.isPending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="bg-muted rounded-lg px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about your finances..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={queryMutation.isPending}
            />
            <Button type="submit" disabled={!query.trim() || queryMutation.isPending}>
              {queryMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
