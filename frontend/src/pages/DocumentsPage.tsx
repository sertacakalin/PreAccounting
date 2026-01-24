import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '@/services/document.service'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Upload,
  FileText,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Document, DocumentFields, DocumentStatus } from '@/types/document'

export function DocumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showExtractedData, setShowExtractedData] = useState(false)
  const queryClient = useQueryClient()

  // Fetch all documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.getAll(),
  })

  // Upload and process mutation
  const uploadMutation = useMutation({
    mutationFn: (file: File) => documentService.uploadAndProcess(file),
    onSuccess: (result) => {
      toast.success('Document processed successfully!', {
        description: `OCR confidence: ${(result.ocrConfidence! * 100).toFixed(0)}% | Provider: ${result.ocrProvider}`,
      })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setSelectedFile(null)
    },
    onError: (error: any) => {
      toast.error('Upload failed', {
        description: error?.response?.data?.message || error.message,
      })
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => documentService.delete(id),
    onSuccess: () => {
      toast.success('Document deleted')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      setSelectedDocument(null)
      setShowExtractedData(false)
    },
    onError: (error: any) => {
      toast.error('Delete failed', {
        description: error?.response?.data?.message || error.message,
      })
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload an image (JPEG, PNG, TIFF) or PDF file',
        })
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File too large', {
          description: 'Maximum file size is 10MB',
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile)
    }
  }

  const viewDocument = (doc: Document) => {
    setSelectedDocument(doc)
    setShowExtractedData(true)
  }

  const getStatusBadge = (status: DocumentStatus) => {
    const variants: Record<DocumentStatus, { variant: any; label: string; icon: any }> = {
      UPLOADED: { variant: 'secondary', label: 'Uploaded', icon: Upload },
      PROCESSING: { variant: 'default', label: 'Processing...', icon: Loader2 },
      PROCESSED: { variant: 'default', label: 'Processed', icon: CheckCircle },
      VERIFIED: { variant: 'default', label: 'Verified', icon: CheckCircle },
      ERROR: { variant: 'destructive', label: 'Error', icon: XCircle },
    }

    const config = variants[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
        {config.label}
      </Badge>
    )
  }

  const parseExtractedData = (jsonString?: string): DocumentFields | null => {
    if (!jsonString) return null
    try {
      return JSON.parse(jsonString)
    } catch {
      return null
    }
  }

  const formatConfidence = (confidence?: number) => {
    if (confidence === undefined) return 'N/A'
    return `${(confidence * 100).toFixed(0)}%`
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Document Processing</h1>
        <p className="text-muted-foreground">
          Upload documents for AI-powered OCR and data extraction
        </p>
      </div>

      {/* Upload Section */}
      <Card className="mb-8 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Upload New Document</h2>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />

            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={uploadMutation.isPending}
                className="flex items-center gap-2"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload & Process
                  </>
                )}
              </Button>
            )}
          </div>

          {selectedFile && (
            <div className="text-sm text-muted-foreground">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </div>
          )}
        </div>
      </Card>

      {/* Documents List */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Your Documents</h2>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-lg font-medium">No documents yet</p>
            <p className="text-sm text-muted-foreground">
              Upload your first document to get started
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{doc.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          Uploaded {new Date(doc.createdAt).toLocaleDateString()} at{' '}
                          {new Date(doc.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {doc.documentType && (
                      <Badge variant="outline">{doc.documentType}</Badge>
                    )}

                    {getStatusBadge(doc.status)}

                    {doc.ocrConfidence !== undefined && (
                      <Badge variant="secondary">
                        Confidence: {formatConfidence(doc.ocrConfidence)}
                      </Badge>
                    )}

                    <div className="flex gap-2">
                      {doc.status === 'PROCESSED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewDocument(doc)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteMutation.mutate(doc.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>

                {doc.processingError && (
                  <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    Error: {doc.processingError}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Data Modal */}
      {showExtractedData && selectedDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-h-[90vh] w-full max-w-4xl overflow-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Extracted Data</h2>
                <p className="text-sm text-muted-foreground">{selectedDocument.filename}</p>
              </div>
              <Button variant="ghost" onClick={() => setShowExtractedData(false)}>
                ✕
              </Button>
            </div>

            {(() => {
              const data = parseExtractedData(selectedDocument.extractedData)

              return data ? (
                <div className="space-y-6">
                  {/* Overall Confidence */}
                  {data.overallConfidence !== undefined && (
                    <div className="rounded-lg bg-primary/10 p-4">
                      <p className="text-sm font-medium">Overall Confidence</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatConfidence(data.overallConfidence)}
                      </p>
                    </div>
                  )}

                  {/* Extracted Fields */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.companyName && (
                      <FieldDisplay
                        label="Company Name"
                        value={data.companyName}
                        confidence={data.companyNameConfidence}
                      />
                    )}
                    {data.date && (
                      <FieldDisplay
                        label="Date"
                        value={data.date}
                        confidence={data.dateConfidence}
                      />
                    )}
                    {data.documentNumber && (
                      <FieldDisplay
                        label="Document Number"
                        value={data.documentNumber}
                        confidence={data.documentNumberConfidence}
                      />
                    )}
                    {data.totalAmount !== undefined && (
                      <FieldDisplay
                        label="Total Amount"
                        value={`${data.totalAmount.toFixed(2)} ${data.currency || ''}`}
                        confidence={data.totalAmountConfidence}
                      />
                    )}
                    {data.vatAmount !== undefined && (
                      <FieldDisplay
                        label="VAT Amount"
                        value={`${data.vatAmount.toFixed(2)} ${data.currency || ''}`}
                        confidence={data.vatAmountConfidence}
                      />
                    )}
                    {data.taxId && (
                      <FieldDisplay
                        label="Tax ID"
                        value={data.taxId}
                        confidence={data.taxIdConfidence}
                      />
                    )}
                    {data.address && (
                      <FieldDisplay
                        label="Address"
                        value={data.address}
                        confidence={data.addressConfidence}
                        fullWidth
                      />
                    )}
                  </div>

                  {/* Items */}
                  {data.items && data.items.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Line Items</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border">
                          <thead className="bg-muted">
                            <tr>
                              <th className="border p-2 text-left">Name</th>
                              <th className="border p-2 text-right">Quantity</th>
                              <th className="border p-2 text-right">Unit Price</th>
                              <th className="border p-2 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.items.map((item, idx) => (
                              <tr key={idx}>
                                <td className="border p-2">{item.name}</td>
                                <td className="border p-2 text-right">{item.quantity}</td>
                                <td className="border p-2 text-right">
                                  {item.unitPrice?.toFixed(2)}
                                </td>
                                <td className="border p-2 text-right">
                                  {item.totalPrice?.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* OCR Text */}
                  {selectedDocument.ocrText && (
                    <div>
                      <h3 className="mb-2 text-lg font-semibold">Raw OCR Text</h3>
                      <pre className="max-h-60 overflow-auto rounded-lg bg-muted p-4 text-sm">
                        {selectedDocument.ocrText}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No extracted data available</p>
              )
            })()}
          </Card>
        </div>
      )}
    </div>
  )
}

// Helper component for displaying fields
function FieldDisplay({
  label,
  value,
  confidence,
  fullWidth = false,
}: {
  label: string
  value: string
  confidence?: number
  fullWidth?: boolean
}) {
  const getConfidenceColor = (conf?: number) => {
    if (!conf) return 'text-muted-foreground'
    if (conf >= 0.8) return 'text-green-600'
    if (conf >= 0.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={fullWidth ? 'md:col-span-2' : ''}>
      <div className="rounded-lg border p-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {confidence !== undefined && (
            <span className={`text-xs font-medium ${getConfidenceColor(confidence)}`}>
              {(confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
        <p className="mt-1 font-medium">{value}</p>
      </div>
    </div>
  )
}
