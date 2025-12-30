import { useState } from 'react'
import { FileText, Info } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function AuditLogsPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Audit Logs
        </h1>
        <p className="text-muted-foreground mt-1">
          System activity tracking and audit trail
        </p>
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="space-y-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Audit Logging System
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              This page provides visibility into system activities and user actions.
              The following types of events are currently tracked:
            </p>
          </div>
        </div>
      </Card>

      {/* Tracked Events Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">AI Assistant Usage</h3>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            All AI queries, responses, and usage statistics are logged for compliance and monitoring.
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <strong>Logged data:</strong> Query text, response, timestamp, user, company
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">User Authentication</h3>
            <Badge variant="secondary">Planned</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Login attempts, successful logins, logouts, and password changes.
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <strong>Future feature:</strong> Login history, IP tracking, session management
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Data Modifications</h3>
            <Badge variant="secondary">Planned</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Create, update, and delete operations on invoices, payments, and other entities.
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <strong>Future feature:</strong> Change tracking, before/after values
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Company Management</h3>
            <Badge variant="secondary">Planned</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Company creation, status changes, and configuration updates.
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <strong>Future feature:</strong> Company lifecycle tracking
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">System Settings</h3>
            <Badge variant="secondary">Planned</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Changes to system configuration, VAT rates, and other settings.
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <strong>Future feature:</strong> Settings change history
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Role & Permission Changes</h3>
            <Badge variant="secondary">Planned</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            User role updates and permission modifications.
          </p>
          <div className="mt-3 text-xs text-muted-foreground">
            <strong>Future feature:</strong> Role assignment tracking
          </div>
        </Card>
      </div>

      {/* Current Capabilities */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Available Audit Data</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-green-700 dark:text-green-400">
              AI Assistant Logs
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Complete history of AI queries is stored in the <code className="bg-muted px-1 py-0.5 rounded">ai_audit_logs</code> table.
              This includes query text, response content, timestamps, and user attribution.
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold text-yellow-700 dark:text-yellow-400">
              Database Change Tracking
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              All entity modifications are tracked at the database level with timestamps.
              Future enhancements will provide a dedicated UI for viewing this data.
            </p>
          </div>
        </div>
      </Card>

      {/* Implementation Guide */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Extending Audit Logging</h2>
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-muted-foreground">
            To implement comprehensive audit logging, you can:
          </p>
          <ol className="text-muted-foreground space-y-2 ml-4">
            <li>
              <strong>Create an AuditLogController</strong> in the backend to expose audit log data via REST API
            </li>
            <li>
              <strong>Add filtering capabilities</strong> by date range, user, action type, and entity type
            </li>
            <li>
              <strong>Implement pagination</strong> for efficient handling of large audit log datasets
            </li>
            <li>
              <strong>Add export functionality</strong> to download audit logs in CSV or PDF format
            </li>
            <li>
              <strong>Create alerts</strong> for suspicious activities or critical system changes
            </li>
          </ol>
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-xs font-mono">
              Example endpoint: GET /api/admin/audit-logs?startDate=2025-01-01&endDate=2025-12-31&userId=1
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
