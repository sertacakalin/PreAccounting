/**
 * Invoice Operations Page
 * UI-only workflow for list, create/edit, and detail views
 */

import { useMemo, useState } from 'react'
import { Plus, ArrowLeft, FileText, Download, Pencil, Ban, CheckCircle2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'CANCELLED'

type LineItem = {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
}

type Invoice = {
  id: number
  invoiceNumber: string
  invoiceDate: string
  customerName: string
  customerAddress: string
  taxOffice: string
  taxNumber: string
  status: InvoiceStatus
  lineItems: LineItem[]
  notes: string
}

const buildLineItem = (): LineItem => ({
  id: `line-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  vatRate: 20,
})

const buildInvoiceNumber = () => `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now()}`

const initialInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2025-0001',
    invoiceDate: '2025-01-10',
    customerName: 'Marmara Trade Ltd.',
    customerAddress: 'Kadikoy, Istanbul',
    taxOffice: 'Kadikoy',
    taxNumber: '1234567890',
    status: 'ISSUED',
    lineItems: [
      {
        id: 'line-1',
        name: 'Monthly Subscription',
        description: 'Accounting SaaS subscription',
        quantity: 1,
        unitPrice: 2500,
        vatRate: 20,
      },
    ],
    notes: 'Paid via bank transfer.',
  },
  {
    id: 2,
    invoiceNumber: 'INV-2025-0002',
    invoiceDate: '2025-01-12',
    customerName: 'Ege Supplies',
    customerAddress: 'Bornova, Izmir',
    taxOffice: 'Bornova',
    taxNumber: '9988776655',
    status: 'DRAFT',
    lineItems: [
      {
        id: 'line-2',
        name: 'Consulting Hours',
        description: 'Implementation support',
        quantity: 6,
        unitPrice: 450,
        vatRate: 20,
      },
      {
        id: 'line-3',
        name: 'Report Template',
        description: 'Custom invoice template',
        quantity: 1,
        unitPrice: 900,
        vatRate: 20,
      },
    ],
    notes: '',
  },
]

const formatCurrency = (value: number) => `$${value.toFixed(2)}`

const toAscii = (text: string) => text.replace(/[^\x20-\x7E]/g, '?')

const escapePdfText = (text: string) => toAscii(text).replace(/[()\\]/g, '\\$&')

const calculateTotals = (items: LineItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const vatTotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (item.vatRate / 100), 0)
  return {
    subtotal,
    vatTotal,
    grandTotal: subtotal + vatTotal,
  }
}

const buildInvoicePdf = (invoice: Invoice) => {
  const totals = calculateTotals(invoice.lineItems)
  const lines = [
    'Invoice',
    `Invoice Number: ${invoice.invoiceNumber}`,
    `Invoice Date: ${invoice.invoiceDate}`,
    '',
    'Company Information:',
    'Your Company Name',
    'Your Company Address',
    '',
    'Customer Information:',
    `Customer: ${invoice.customerName}`,
    `Address: ${invoice.customerAddress}`,
    `Tax Office/Number: ${invoice.taxOffice} / ${invoice.taxNumber}`,
    '',
    'Line Items:',
    ...invoice.lineItems.map((item) => {
      const lineTotal = item.quantity * item.unitPrice
      return `${item.name} | Qty ${item.quantity} x ${item.unitPrice.toFixed(2)} | VAT ${item.vatRate}% | ${lineTotal.toFixed(2)}`
    }),
    '',
    `Subtotal: ${totals.subtotal.toFixed(2)}`,
    `VAT Total: ${totals.vatTotal.toFixed(2)}`,
    `Grand Total: ${totals.grandTotal.toFixed(2)}`,
  ]

  const contentLines = lines.map((line, index) => {
    const yOffset = index === 0 ? 0 : -16
    const escaped = escapePdfText(line)
    return `${index === 0 ? '' : `${yOffset} Td `}(${escaped}) Tj`
  })
  const stream = `BT /F1 12 Tf 50 750 Td ${contentLines.join(' ')} ET`

  const objects = [
    { id: 1, content: '<< /Type /Catalog /Pages 2 0 R >>' },
    { id: 2, content: '<< /Type /Pages /Kids [3 0 R] /Count 1 >>' },
    {
      id: 3,
      content:
        '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    },
    { id: 4, content: `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream` },
    { id: 5, content: '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>' },
  ]

  let pdf = '%PDF-1.4\n'
  const offsets: number[] = []
  objects.forEach((obj) => {
    offsets[obj.id] = pdf.length
    pdf += `${obj.id} 0 obj\n${obj.content}\nendobj\n`
  })

  const xrefStart = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i <= objects.length; i += 1) {
    const offset = offsets[i].toString().padStart(10, '0')
    pdf += `${offset} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`

  return new Blob([pdf], { type: 'application/pdf' })
}

const downloadPdf = (invoice: Invoice) => {
  const blob = buildInvoicePdf(invoice)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${invoice.invoiceNumber || 'invoice'}.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function InvoicesPage() {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list')
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null)
  const [formInvoice, setFormInvoice] = useState<Invoice>(() => ({
    id: Date.now(),
    invoiceNumber: buildInvoiceNumber(),
    invoiceDate: new Date().toISOString().slice(0, 10),
    customerName: '',
    customerAddress: '',
    taxOffice: '',
    taxNumber: '',
    status: 'DRAFT',
    lineItems: [buildLineItem()],
    notes: '',
  }))

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices
    const term = searchTerm.toLowerCase()
    return invoices.filter((invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(term) ||
      invoice.customerName.toLowerCase().includes(term)
    )
  }, [invoices, searchTerm])

  const selectedInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === selectedInvoiceId) || null,
    [invoices, selectedInvoiceId]
  )

  const handleCreate = () => {
    setFormInvoice({
      id: Date.now(),
      invoiceNumber: buildInvoiceNumber(),
      invoiceDate: new Date().toISOString().slice(0, 10),
      customerName: '',
      customerAddress: '',
      taxOffice: '',
      taxNumber: '',
      status: 'DRAFT',
      lineItems: [buildLineItem()],
      notes: '',
    })
    setView('form')
  }

  const handleEdit = (invoice: Invoice) => {
    setFormInvoice({ ...invoice, lineItems: invoice.lineItems.map((item) => ({ ...item })) })
    setSelectedInvoiceId(invoice.id)
    setView('form')
  }

  const handleSave = () => {
    setInvoices((prev) => {
      const exists = prev.find((invoice) => invoice.id === formInvoice.id)
      if (exists) {
        return prev.map((invoice) => (invoice.id === formInvoice.id ? formInvoice : invoice))
      }
      return [formInvoice, ...prev]
    })
    setView('list')
  }

  const handleView = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id)
    setView('detail')
  }

  const handleStatusChange = (invoiceId: number, status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((invoice) => (invoice.id === invoiceId ? { ...invoice, status } : invoice))
    )
  }

  const handleLineUpdate = (lineId: string, field: keyof LineItem, value: string | number) => {
    setFormInvoice((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((line) =>
        line.id === lineId ? { ...line, [field]: value } : line
      ),
    }))
  }

  const totals = calculateTotals(formInvoice.lineItems)

  if (view === 'detail' && selectedInvoice) {
    const detailTotals = calculateTotals(selectedInvoice.lineItems)
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setView('list')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
              </Button>
              <div>
                <h1 className="text-lg font-bold">Invoice Detail</h1>
                <p className="text-xs text-muted-foreground">{selectedInvoice.invoiceNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleEdit(selectedInvoice)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={() => handleStatusChange(selectedInvoice.id, 'ISSUED')}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Issue Invoice
              </Button>
              <Button variant="outline" onClick={() => handleStatusChange(selectedInvoice.id, 'CANCELLED')}>
                <Ban className="mr-2 h-4 w-4" />
                Cancel Invoice
              </Button>
              <Button onClick={() => downloadPdf(selectedInvoice)}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Invoice Information</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Invoice Number</p>
                      <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Invoice Date</p>
                      <p className="font-semibold">{selectedInvoice.invoiceDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customer Name</p>
                      <p className="font-semibold">{selectedInvoice.customerName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Customer Address</p>
                      <p className="font-semibold">{selectedInvoice.customerAddress}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax Office</p>
                      <p className="font-semibold">{selectedInvoice.taxOffice}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tax Number</p>
                      <p className="font-semibold">{selectedInvoice.taxNumber}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">Line Items</p>
                  <Table className="mt-3">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product / Service</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>VAT %</TableHead>
                        <TableHead>Line Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.lineItems.map((line) => {
                        const lineTotal = line.quantity * line.unitPrice
                        return (
                          <TableRow key={line.id}>
                            <TableCell className="font-medium">{line.name}</TableCell>
                            <TableCell className="text-muted-foreground">{line.description || '—'}</TableCell>
                            <TableCell>{line.quantity}</TableCell>
                            <TableCell>{formatCurrency(line.unitPrice)}</TableCell>
                            <TableCell>{line.vatRate}%</TableCell>
                            <TableCell>{formatCurrency(lineTotal)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className="mt-2" variant={selectedInvoice.status === 'ISSUED' ? 'default' : 'secondary'}>
                    {selectedInvoice.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Totals</p>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">{formatCurrency(detailTotals.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">VAT Total</span>
                      <span className="font-semibold">{formatCurrency(detailTotals.vatTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Grand Total</span>
                      <span className="font-semibold">{formatCurrency(detailTotals.grandTotal)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notes</p>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedInvoice.notes || 'No notes.'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setView('list')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to list
              </Button>
              <div>
                <h1 className="text-lg font-bold">Create / Edit Invoice</h1>
                <p className="text-xs text-muted-foreground">Invoice information and line items</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setFormInvoice((prev) => ({
                ...prev,
                invoiceNumber: buildInvoiceNumber(),
              }))}>
                Auto Number
              </Button>
              <Button onClick={handleSave}>Save Invoice</Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto p-6 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Invoice Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Invoice Number</label>
                  <Input
                    value={formInvoice.invoiceNumber}
                    onChange={(event) =>
                      setFormInvoice((prev) => ({ ...prev, invoiceNumber: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Invoice Date</label>
                  <Input
                    type="date"
                    value={formInvoice.invoiceDate}
                    onChange={(event) =>
                      setFormInvoice((prev) => ({ ...prev, invoiceDate: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Customer Name</label>
                  <Input
                    value={formInvoice.customerName}
                    onChange={(event) =>
                      setFormInvoice((prev) => ({ ...prev, customerName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Customer Address</label>
                  <Input
                    value={formInvoice.customerAddress}
                    onChange={(event) =>
                      setFormInvoice((prev) => ({ ...prev, customerAddress: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Tax Office</label>
                  <Input
                    value={formInvoice.taxOffice}
                    onChange={(event) =>
                      setFormInvoice((prev) => ({ ...prev, taxOffice: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Tax Number</label>
                  <Input
                    value={formInvoice.taxNumber}
                    onChange={(event) =>
                      setFormInvoice((prev) => ({ ...prev, taxNumber: event.target.value }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">Line Items</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormInvoice((prev) => ({
                      ...prev,
                      lineItems: [...prev.lineItems, buildLineItem()],
                    }))
                  }
                >
                  Add Line
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product / Service</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead>VAT %</TableHead>
                    <TableHead>Line Total</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formInvoice.lineItems.map((line) => {
                    const lineTotal = line.quantity * line.unitPrice
                    return (
                      <TableRow key={line.id}>
                        <TableCell>
                          <Input
                            value={line.name}
                            onChange={(event) => handleLineUpdate(line.id, 'name', event.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={line.description}
                            onChange={(event) => handleLineUpdate(line.id, 'description', event.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.quantity}
                            onChange={(event) =>
                              handleLineUpdate(line.id, 'quantity', Number(event.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.unitPrice}
                            onChange={(event) =>
                              handleLineUpdate(line.id, 'unitPrice', Number(event.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={line.vatRate}
                            onChange={(event) =>
                              handleLineUpdate(line.id, 'vatRate', Number(event.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(lineTotal)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setFormInvoice((prev) => ({
                                ...prev,
                                lineItems: prev.lineItems.filter((item) => item.id !== line.id),
                              }))
                            }
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <p className="text-sm font-medium text-muted-foreground">Totals</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-lg font-semibold">{formatCurrency(totals.subtotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">VAT Total</p>
                  <p className="text-lg font-semibold">{formatCurrency(totals.vatTotal)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-lg font-semibold">{formatCurrency(totals.grandTotal)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <textarea
                rows={4}
                value={formInvoice.notes}
                onChange={(event) => setFormInvoice((prev) => ({ ...prev, notes: event.target.value }))}
                className="flex w-full rounded-md border border-input bg-muted/40 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Invoice Operations</h1>
              <p className="text-xs text-muted-foreground">Track, issue, and manage invoices</p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search by invoice number or customer..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Invoice Date</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grand Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => {
                    const grandTotal = calculateTotals(invoice.lineItems).grandTotal
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>{invoice.invoiceDate}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>
                          <Badge variant={invoice.status === 'ISSUED' ? 'default' : 'secondary'}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(grandTotal)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(invoice)}>
                              <Eye className="mr-1 h-4 w-4" />
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(invoice)}>
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(invoice.id, 'ISSUED')}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Issue
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(invoice.id, 'CANCELLED')}
                            >
                              <Ban className="mr-1 h-4 w-4" />
                              Cancel
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => downloadPdf(invoice)}>
                              <Download className="mr-1 h-4 w-4" />
                              PDF
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
