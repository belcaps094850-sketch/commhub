import { useState } from 'react'

const defaultReports = [
  { id: 'rp1', name: 'Weekly Delivery Summary', type: 'Delivery Summary', frequency: 'Weekly', day: 'Monday', time: '08:00', recipients: ['bel@company.com', 'mtorres@company.com'], portal: 'All', enabled: true, lastSent: '2026-03-03 08:00', nextSend: '2026-03-10 08:00' },
  { id: 'rp2', name: 'Monthly Template Usage', type: 'Template Usage', frequency: 'Monthly', day: '1st', time: '09:00', recipients: ['bel@company.com'], portal: 'All', enabled: true, lastSent: '2026-03-01 09:00', nextSend: '2026-04-01 09:00' },
  { id: 'rp3', name: 'Daily Failure Analysis', type: 'Failure Analysis', frequency: 'Daily', day: null, time: '07:00', recipients: ['bel@company.com', 'lpark@company.com'], portal: 'All', enabled: true, lastSent: '2026-03-09 07:00', nextSend: '2026-03-10 07:00' },
  { id: 'rp4', name: 'Compliance Status — EE Portal', type: 'Compliance Status', frequency: 'Weekly', day: 'Friday', time: '16:00', recipients: ['bel@company.com', 'mtorres@company.com', 'schen@company.com'], portal: 'EE Portal', enabled: true, lastSent: '2026-03-07 16:00', nextSend: '2026-03-14 16:00' },
  { id: 'rp5', name: 'Quarterly Exec Summary', type: 'Delivery Summary', frequency: 'Quarterly', day: '1st', time: '09:00', recipients: ['bel@company.com'], portal: 'All', enabled: false, lastSent: '2026-01-01 09:00', nextSend: '2026-04-01 09:00' },
]

const reportTypes = ['Delivery Summary', 'Template Usage', 'Compliance Status', 'Failure Analysis']
const frequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly']

const samplePreview = {
  'Delivery Summary': {
    title: 'Weekly Delivery Summary — All Portals',
    period: 'March 3-9, 2026',
    rows: [
      { metric: 'Total Sent', value: '17,015' },
      { metric: 'Delivered', value: '16,824 (98.9%)' },
      { metric: 'Failed', value: '191 (1.1%)' },
      { metric: 'Open Rate', value: '72.4%' },
      { metric: 'Top Template', value: 'Explanation of Benefits (12,480)' },
      { metric: 'Most Active Portal', value: 'EE Portal (15,680)' },
    ]
  },
  'Template Usage': {
    title: 'Monthly Template Usage Report',
    period: 'March 2026',
    rows: [
      { metric: 'Active Templates', value: '6 of 8' },
      { metric: 'Most Used', value: 'Explanation of Benefits (3 batches)' },
      { metric: 'Least Used', value: 'ID Card Reprint (0 batches)' },
      { metric: 'Templates Modified', value: '2 (Password Reset, Registration)' },
      { metric: 'Pending Approvals', value: '1 (Annual Benefits Statement)' },
      { metric: 'Version Changes', value: '4 total' },
    ]
  },
  'Compliance Status': {
    title: 'Weekly Compliance Status — EE Portal',
    period: 'March 3-9, 2026',
    rows: [
      { metric: 'Templates Scanned', value: '6' },
      { metric: 'Passing', value: '5' },
      { metric: 'Flagged', value: '1 (Claim Denial — appeal window)' },
      { metric: 'Regulatory Updates', value: '1 (NY 60-day appeal)' },
      { metric: 'Approval Queue', value: '1 pending, 0 overdue' },
      { metric: 'Audit Events', value: '18 this week' },
    ]
  },
  'Failure Analysis': {
    title: 'Daily Failure Analysis',
    period: 'March 9, 2026',
    rows: [
      { metric: 'Total Failures', value: '6' },
      { metric: 'Bounced Email', value: '4 (66.7%)' },
      { metric: 'Invalid Address', value: '2 (33.3%)' },
      { metric: 'Affected Batch', value: 'Registration Confirmations — OSGLI' },
      { metric: 'Retry Status', value: '2 auto-retried, 4 permanent' },
      { metric: 'Action Required', value: 'Update 4 email addresses' },
    ]
  }
}

export default function ScheduledReports() {
  const [reports, setReports] = useState(defaultReports)
  const [selected, setSelected] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  const toggleEnabled = (id) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Scheduled Reports</h1>
          <p style={{ color: '#999', fontSize: 13 }}>{reports.filter(r => r.enabled).length} active · {reports.length} total</p>
        </div>
        <button style={{ padding: '8px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          + New Report
        </button>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Report List */}
        <div style={{ flex: 1 }}>
          {reports.map(r => (
            <div key={r.id} onClick={() => { setSelected(r); setShowPreview(false); }} style={{
              padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
              background: selected?.id === r.id ? '#f9f9f9' : '#fff', opacity: r.enabled ? 1 : 0.5
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: '500', fontSize: 14 }}>{r.name}</span>
                  {!r.enabled && <span style={{ fontSize: 10, padding: '1px 6px', background: '#f5f5f5', borderRadius: 3, color: '#999' }}>Paused</span>}
                </div>
                <label onClick={e => e.stopPropagation()} style={{ cursor: 'pointer' }}>
                  <input type="checkbox" checked={r.enabled} onChange={() => toggleEnabled(r.id)} style={{ cursor: 'pointer' }} />
                </label>
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {r.type} · {r.frequency}{r.day ? ` (${r.day})` : ''} at {r.time} · {r.recipients.length} recipient{r.recipients.length !== 1 ? 's' : ''}
              </div>
              {r.nextSend && r.enabled && (
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>Next: {r.nextSend}</div>
              )}
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{ width: 380, border: '1px solid #eee', borderRadius: 6, padding: 20, alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>

            <div style={{ fontSize: 13, marginBottom: 16 }}>
              {[
                ['Type', selected.type],
                ['Frequency', `${selected.frequency}${selected.day ? ` (${selected.day})` : ''}`],
                ['Time', selected.time],
                ['Portal', selected.portal],
                ['Status', selected.enabled ? 'Active' : 'Paused'],
                ['Last Sent', selected.lastSent],
                ['Next Send', selected.enabled ? selected.nextSend : 'Paused'],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#999' }}>{l}</span><span>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Recipients</div>
              {selected.recipients.map(r => (
                <div key={r} style={{ fontSize: 12, padding: '2px 0' }}>📧 {r}</div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setShowPreview(!showPreview)} style={{ flex: 1, padding: '8px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                {showPreview ? 'Hide Preview' : 'Preview Report'}
              </button>
              <button style={{ flex: 1, padding: '8px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                Send Now
              </button>
            </div>

            {/* Report Preview */}
            {showPreview && samplePreview[selected.type] && (
              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 14 }}>
                <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 2 }}>{samplePreview[selected.type].title}</div>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 10 }}>Period: {samplePreview[selected.type].period}</div>
                {samplePreview[selected.type].rows.map(row => (
                  <div key={row.metric} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
                    <span style={{ color: '#666' }}>{row.metric}</span>
                    <span style={{ fontWeight: '500' }}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
