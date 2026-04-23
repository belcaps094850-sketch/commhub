import { useState } from 'react'

const auditEntries = [
  { id: 'au1', timestamp: '2026-03-09 14:22:05', user: 'Bel Capistrano', action: 'Template Modified', category: 'Template', resource: 'Password Reset Email', detail: 'Updated reset link expiration from 12h to 24h. Version bumped 1.7 → 1.8', severity: 'info', ip: '10.0.1.42' },
  { id: 'au2', timestamp: '2026-03-09 13:15:32', user: 'System', action: 'Batch Completed', category: 'Communication', resource: 'Denial Notices — Week 10', detail: '280 of 285 delivered (98.2%). 5 failures: 3 invalid addresses, 2 mailbox full', severity: 'info', ip: 'system' },
  { id: 'au3', timestamp: '2026-03-09 11:00:14', user: 'Bel Capistrano', action: 'Communication Created', category: 'Communication', resource: 'Registration Confirmations — OSGLI', detail: 'New batch created for 1,200 recipients via Email channel. Template: Registration Confirmation v2.0', severity: 'info', ip: '10.0.1.42' },
  { id: 'au4', timestamp: '2026-03-08 16:45:00', user: 'System', action: 'Batch Started', category: 'Communication', resource: 'Registration Confirmations — OSGLI', detail: 'Processing started. Estimated completion: 2026-03-09 08:00', severity: 'info', ip: 'system' },
  { id: 'au5', timestamp: '2026-03-08 10:30:22', user: 'Bel Capistrano', action: 'Template Created', category: 'Template', resource: 'Annual Benefits Statement', detail: 'New template created as Draft. Version 1.0. Category: Benefits', severity: 'info', ip: '10.0.1.42' },
  { id: 'au6', timestamp: '2026-03-07 09:00:00', user: 'System', action: 'Communication Scheduled', category: 'Communication', resource: 'Premium Reminders — March', detail: 'Queued for 2026-03-15. 8,750 recipients via Email + SMS', severity: 'info', ip: 'system' },
  { id: 'au7', timestamp: '2026-03-06 14:12:45', user: 'Bel Capistrano', action: 'Template Approved', category: 'Template', resource: 'Registration Confirmation', detail: 'Template moved from Draft to Active. Compliance review completed. Approved by: Bel Capistrano', severity: 'info', ip: '10.0.1.42' },
  { id: 'au8', timestamp: '2026-03-06 11:30:00', user: 'System', action: 'Delivery Failure Alert', category: 'Communication', resource: 'Q1 EOB Batch — EE Portal', detail: '168 delivery failures detected (1.3%). Threshold: 2%. No escalation required. Root cause: 142 bounced emails, 26 invalid addresses', severity: 'warning', ip: 'system' },
  { id: 'au9', timestamp: '2026-03-05 15:20:33', user: 'Bel Capistrano', action: 'Template Modified', category: 'Template', resource: 'Password Reset Email', detail: 'Updated email subject line. Added branding footer. Version bumped 1.6 → 1.7', severity: 'info', ip: '10.0.1.42' },
  { id: 'au10', timestamp: '2026-03-05 09:45:00', user: 'System', action: 'Compliance Scan', category: 'System', resource: 'All Active Templates', detail: 'Automated compliance scan completed. 7 templates scanned. 0 issues found. PHI handling: compliant. Appeal rights language: present in denial notices', severity: 'info', ip: 'system' },
  { id: 'au11', timestamp: '2026-03-04 16:00:12', user: 'Bel Capistrano', action: 'Recipient Import', category: 'Recipient', resource: 'GI OSGLI Members', detail: 'CSV import: 1,200 records added. 0 duplicates. 0 validation errors. Source: osgli-members-march.csv', severity: 'info', ip: '10.0.1.42' },
  { id: 'au12', timestamp: '2026-03-03 08:15:00', user: 'System', action: 'Batch Completed', category: 'Communication', resource: 'March Welcome Letters', detail: '3,184 of 3,200 delivered (99.5%). 16 failures: undeliverable addresses. Print channel.', severity: 'info', ip: 'system' },
  { id: 'au13', timestamp: '2026-03-01 12:00:00', user: 'System', action: 'Batch Completed', category: 'Communication', resource: 'Q1 EOB Batch — EE Portal', detail: '12,312 of 12,480 delivered (98.7%). Print + Email dual channel. Processing time: 4h 23m', severity: 'info', ip: 'system' },
  { id: 'au14', timestamp: '2026-03-01 07:30:00', user: 'System', action: 'Batch Started', category: 'Communication', resource: 'Q1 EOB Batch — EE Portal', detail: 'Processing started for 12,480 recipients. Template: Explanation of Benefits v5.1. Estimated completion: 12:00', severity: 'info', ip: 'system' },
  { id: 'au15', timestamp: '2026-02-28 14:00:00', user: 'Bel Capistrano', action: 'Template Approved', category: 'Template', resource: 'Explanation of Benefits', detail: 'Template v5.1 approved after compliance review. Changes: updated appeal rights language per 2026 regulatory requirements', severity: 'info', ip: '10.0.1.42' },
  { id: 'au16', timestamp: '2026-02-28 10:00:00', user: 'System', action: 'Regulatory Alert', category: 'System', resource: 'Denial Notice Template', detail: 'State regulation update detected: NY requires 60-day appeal window (was 45 days). Template flagged for review.', severity: 'critical', ip: 'system' },
  { id: 'au17', timestamp: '2026-02-27 09:00:00', user: 'Bel Capistrano', action: 'Access Granted', category: 'Security', resource: 'Template Editor', detail: 'User granted editor access to Claims category templates. Approved by: Admin. Role: Template Manager', severity: 'info', ip: '10.0.1.42' },
  { id: 'au18', timestamp: '2026-02-25 11:30:00', user: 'System', action: 'Data Retention', category: 'System', resource: 'Communication Archives', detail: 'Automated archival: 45 communication records older than 90 days moved to cold storage. Retention policy: 7 years', severity: 'info', ip: 'system' },
]

export default function AuditTrail() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [expanded, setExpanded] = useState(null)
  const [exportFormat, setExportFormat] = useState(null)

  const categories = ['All', 'Template', 'Communication', 'Recipient', 'Security', 'System']
  const severities = ['All', 'info', 'warning', 'critical']

  const filtered = auditEntries.filter(e => {
    const matchSearch = !search ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      e.resource.toLowerCase().includes(search.toLowerCase()) ||
      e.detail.toLowerCase().includes(search.toLowerCase()) ||
      e.user.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'All' || e.category === categoryFilter
    const matchSeverity = severityFilter === 'All' || e.severity === severityFilter
    const matchFrom = !dateRange.from || e.timestamp >= dateRange.from
    const matchTo = !dateRange.to || e.timestamp <= dateRange.to + ' 23:59:59'
    return matchSearch && matchCategory && matchSeverity && matchFrom && matchTo
  })

  const severityIcon = (s) => {
    if (s === 'critical') return '🔴'
    if (s === 'warning') return '🟡'
    return '🟢'
  }

  const severityStyle = (s) => {
    if (s === 'critical') return { background: '#ffebee', color: '#c62828' }
    if (s === 'warning') return { background: '#fff3e0', color: '#e65100' }
    return { background: '#f5f5f5', color: '#666' }
  }

  const handleExport = (format) => {
    setExportFormat(format)
    setTimeout(() => setExportFormat(null), 2000)
  }

  // Stats
  const totalEvents = auditEntries.length
  const criticalCount = auditEntries.filter(e => e.severity === 'critical').length
  const warningCount = auditEntries.filter(e => e.severity === 'warning').length
  const uniqueUsers = new Set(auditEntries.map(e => e.user)).size
  const templateChanges = auditEntries.filter(e => e.category === 'Template').length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Audit Trail</h1>
          <p style={{ color: '#999', fontSize: 13 }}>Complete compliance log of all system actions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => handleExport('csv')}
            style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: exportFormat === 'csv' ? '#2e7d32' : '#333' }}
          >
            {exportFormat === 'csv' ? '✓ Exported' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: exportFormat === 'pdf' ? '#2e7d32' : '#333' }}
          >
            {exportFormat === 'pdf' ? '✓ Exported' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Events', value: totalEvents },
          { label: 'Critical', value: criticalCount, color: criticalCount > 0 ? '#c62828' : '#333' },
          { label: 'Warnings', value: warningCount, color: warningCount > 0 ? '#e65100' : '#333' },
          { label: 'Users', value: uniqueUsers },
          { label: 'Template Changes', value: templateChanges },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#999' }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: s.color || '#333' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search actions, resources, users..."
          style={{ flex: 1, minWidth: 200, padding: '7px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
          {severities.map(s => <option key={s} value={s}>{s === 'All' ? 'All Severities' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#999' }}>From:</label>
          <input type="date" value={dateRange.from} onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#999' }}>To:</label>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))} style={{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>Showing {filtered.length} of {auditEntries.length} events</div>

      {/* Audit Log */}
      {filtered.map(entry => (
        <div
          key={entry.id}
          onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
          style={{ borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: expanded === entry.id ? '#fafafa' : '#fff' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
            <span style={{ fontSize: 12 }}>{severityIcon(entry.severity)}</span>
            <span style={{ fontSize: 12, color: '#999', fontFamily: 'monospace', width: 145, flexShrink: 0 }}>{entry.timestamp}</span>
            <span style={{ fontSize: 12, width: 120, flexShrink: 0, color: entry.user === 'System' ? '#999' : '#333' }}>{entry.user}</span>
            <span style={{ fontSize: 12, fontWeight: '500', width: 180, flexShrink: 0 }}>{entry.action}</span>
            <span style={{ fontSize: 12, color: '#666', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.resource}</span>
            <span style={{ ...severityStyle(entry.severity), fontSize: 10, padding: '2px 6px', borderRadius: 3, textTransform: 'uppercase' }}>{entry.severity}</span>
            <span style={{ fontSize: 10, padding: '2px 6px', background: '#f5f5f5', borderRadius: 3, color: '#999' }}>{entry.category}</span>
          </div>

          {expanded === entry.id && (
            <div style={{ padding: '0 0 12px 22px', fontSize: 12 }}>
              <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 4, padding: 12 }}>
                <div style={{ marginBottom: 8, color: '#444', lineHeight: 1.5 }}>{entry.detail}</div>
                <div style={{ display: 'flex', gap: 16, color: '#999', fontSize: 11 }}>
                  <span>IP: {entry.ip}</span>
                  <span>Event ID: {entry.id}</span>
                  <span>Category: {entry.category}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No audit entries match your filters</div>
      )}

      {/* Compliance Footer */}
      <div style={{ marginTop: 28, padding: 16, background: '#fafafa', border: '1px solid #eee', borderRadius: 6, fontSize: 12, color: '#888' }}>
        <div style={{ fontWeight: 'bold', marginBottom: 6, color: '#666' }}>Compliance Information</div>
        <div>• All communication events are logged with immutable timestamps and user attribution</div>
        <div>• Audit records are retained for 7 years per regulatory requirements</div>
        <div>• Template changes require version tracking — no overwrites, all versions preserved</div>
        <div>• PHI handling follows HIPAA minimum necessary standard</div>
        <div>• Automated compliance scans run weekly on all active templates</div>
        <div>• Export audit trail for regulatory review using CSV or PDF export</div>
      </div>
    </div>
  )
}
