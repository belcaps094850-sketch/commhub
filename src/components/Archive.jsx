import { useState } from 'react'

const archivedComms = [
  { id: 'ar1', recipientName: 'Sarah Johnson', memberId: 'EE-10042', template: 'Explanation of Benefits', portal: 'EE Portal', channel: 'Print + Email', sentDate: '2026-03-01', batch: 'Q1 EOB Batch', status: 'Delivered',
    content: 'EXPLANATION OF BENEFITS\n\nMember: Sarah Johnson\nMember ID: EE-10042\nClaim Number: CLM-2026-00145\n\nDate of Service: February 15, 2026\nProvider: Dr. Michael Chen\n\nAmount Billed: $1,250.00\nAmount Allowed: $980.00\nYour Responsibility: $196.00\n\nThis is not a bill.' },
  { id: 'ar2', recipientName: 'Sarah Johnson', memberId: 'EE-10042', template: 'Welcome Letter', portal: 'EE Portal', channel: 'Print', sentDate: '2026-01-15', batch: 'January Welcome Letters', status: 'Delivered',
    content: 'Dear Sarah Johnson,\n\nWelcome to your Gold PPO plan, effective January 1, 2026.\n\nYour Member ID: EE-10042\nGroup Number: GRP-7890\n\nYour insurance ID card will arrive within 7-10 business days.' },
  { id: 'ar3', recipientName: 'Sarah Johnson', memberId: 'EE-10042', template: 'Registration Confirmation', portal: 'EE Portal', channel: 'Email', sentDate: '2026-01-10', batch: 'January Registrations', status: 'Delivered',
    content: 'Hi Sarah Johnson,\n\nYour member portal account has been created.\n\nPortal: https://portal.example.com\nUsername: sjohnson42\n\nLog in to view your benefits, find providers, and track claims.' },
  { id: 'ar4', recipientName: 'Michael Chen', memberId: 'EE-10089', template: 'Explanation of Benefits', portal: 'EE Portal', channel: 'Print + Email', sentDate: '2026-03-01', batch: 'Q1 EOB Batch', status: 'Delivered',
    content: 'EXPLANATION OF BENEFITS\n\nMember: Michael Chen\nMember ID: EE-10089\nClaim Number: CLM-2026-00198\n\nDate of Service: February 20, 2026\nProvider: Dr. Amanda Foster\n\nAmount Billed: $850.00\nAmount Allowed: $720.00\nYour Responsibility: $144.00' },
  { id: 'ar5', recipientName: 'Lisa Rodriguez', memberId: 'ER-20015', template: 'Claim Denial Notice', portal: 'ER Portal', channel: 'Print + Email', sentDate: '2026-03-06', batch: 'Denial Notices — Week 10', status: 'Delivered',
    content: 'CLAIM DENIAL NOTICE\n\nDear Lisa Rodriguez,\n\nClaim Number: CLM-2026-00212\nDate of Service: February 25, 2026\nProvider: City Medical Center\n\nReason for Denial: Service not covered under current plan.\n\nYou have the right to appeal by May 1, 2026.' },
  { id: 'ar6', recipientName: 'James Williams', memberId: 'GC-30021', template: 'Password Reset Email', portal: 'GI Commissions', channel: 'Email', sentDate: '2026-03-07', batch: 'Password Reset — GI Commissions', status: 'Delivered',
    content: 'Hi James Williams,\n\nWe received a request to reset your password.\n\nClick here to create a new password: https://portal.example.com/reset/xyz789\n\nThis link expires in 24 hours.' },
  { id: 'ar7', recipientName: 'Emily Davis', memberId: 'OS-40033', template: 'Registration Confirmation', portal: 'GI OSGLI', channel: 'Email', sentDate: '2026-03-09', batch: 'Registration Confirmations — OSGLI', status: 'Delivered',
    content: 'Hi Emily Davis,\n\nYour OSGLI portal account has been created.\n\nPortal: https://osgli.example.com\nUsername: edavis88\n\nLog in to manage your OSGLI coverage.' },
  { id: 'ar8', recipientName: 'Robert Kim', memberId: 'EE-10156', template: 'Premium Due Reminder', portal: 'EE Portal', channel: 'Email', sentDate: '2026-02-20', batch: 'Feb Premium Reminders', status: 'Delivered',
    content: 'Dear Robert Kim,\n\nYour premium payment of $425.00 is due by February 28, 2026.\n\nPay online: https://portal.example.com/pay' },
  { id: 'ar9', recipientName: 'Amanda Foster', memberId: 'EE-10203', template: 'Explanation of Benefits', portal: 'EE Portal', channel: 'Print + Email', sentDate: '2026-03-01', batch: 'Q1 EOB Batch', status: 'Failed',
    content: null, failureReason: 'Email bounced — invalid address afoster_old@email.com' },
  { id: 'ar10', recipientName: 'Thomas Brown', memberId: 'OS-40071', template: 'Registration Confirmation', portal: 'GI OSGLI', channel: 'Email', sentDate: '2026-03-09', batch: 'Registration Confirmations — OSGLI', status: 'Pending',
    content: null },
]

export default function Archive() {
  const [search, setSearch] = useState('')
  const [portalFilter, setPortalFilter] = useState('All')
  const [templateFilter, setTemplateFilter] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selected, setSelected] = useState(null)

  const portals = ['All', ...new Set(archivedComms.map(c => c.portal))]
  const templateNames = ['All', ...new Set(archivedComms.map(c => c.template))]

  const filtered = archivedComms.filter(c => {
    const matchSearch = !search ||
      c.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      c.memberId.toLowerCase().includes(search.toLowerCase()) ||
      c.template.toLowerCase().includes(search.toLowerCase()) ||
      c.batch.toLowerCase().includes(search.toLowerCase())
    const matchPortal = portalFilter === 'All' || c.portal === portalFilter
    const matchTemplate = templateFilter === 'All' || c.template === templateFilter
    const matchFrom = !dateFrom || c.sentDate >= dateFrom
    const matchTo = !dateTo || c.sentDate <= dateTo
    return matchSearch && matchPortal && matchTemplate && matchFrom && matchTo
  })

  const statusStyle = (s) => {
    if (s === 'Delivered') return { background: '#e8f5e9', color: '#2e7d32' }
    if (s === 'Failed') return { background: '#ffebee', color: '#c62828' }
    return { background: '#fff3e0', color: '#e65100' }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Archive & Search</h1>
          <p style={{ color: '#999', fontSize: 13 }}>Search all sent communications · 7-year retention</p>
        </div>
        <button style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          Export Results
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, member ID, template, batch..."
          style={{ flex: 1, minWidth: 240, padding: '7px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }}
        />
        <select value={portalFilter} onChange={e => setPortalFilter(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
          {portals.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={templateFilter} onChange={e => setTemplateFilter(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
          {templateNames.map(t => <option key={t}>{t}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#999' }}>From:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#999' }}>To:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''} found
        {search && ` for "${search}"`}
      </div>

      {/* Results */}
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Recipient</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Member ID</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Template</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Portal</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Channel</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c)}
                  style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: selected?.id === c.id ? '#fafafa' : '#fff' }}
                >
                  <td style={{ padding: '10px 0', fontWeight: '500' }}>{c.recipientName}</td>
                  <td style={{ padding: '10px 0', fontFamily: 'monospace', fontSize: 12 }}>{c.memberId}</td>
                  <td style={{ padding: '10px 0', color: '#666' }}>{c.template}</td>
                  <td style={{ padding: '10px 0', color: '#666' }}>{c.portal}</td>
                  <td style={{ padding: '10px 0', color: '#666' }}>{c.channel}</td>
                  <td style={{ padding: '10px 0', color: '#999' }}>{c.sentDate}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, ...statusStyle(c.status) }}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>No archived communications match your search</div>
          )}
        </div>

        {/* Preview Panel */}
        {selected && (
          <div style={{ width: 380, border: '1px solid #eee', borderRadius: 6, padding: 20, alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>Communication Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>

            <div style={{ fontSize: 13, marginBottom: 16 }}>
              {[
                ['Recipient', selected.recipientName],
                ['Member ID', selected.memberId],
                ['Template', selected.template],
                ['Portal', selected.portal],
                ['Channel', selected.channel],
                ['Batch', selected.batch],
                ['Sent', selected.sentDate],
                ['Status', selected.status],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#999' }}>{label}</span>
                  <span style={{ fontWeight: label === 'Status' ? '500' : 'normal' }}>{value}</span>
                </div>
              ))}
            </div>

            {selected.failureReason && (
              <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 4, padding: 10, marginBottom: 16, fontSize: 12, color: '#c62828' }}>
                <strong>Failure Reason:</strong> {selected.failureReason}
              </div>
            )}

            {selected.content ? (
              <div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Rendered Content</div>
                <div style={{
                  background: '#fafafa', border: '1px solid #eee', borderRadius: 4, padding: 14,
                  fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif',
                  maxHeight: 300, overflowY: 'auto'
                }}>
                  {selected.content}
                </div>
              </div>
            ) : selected.status === 'Pending' ? (
              <div style={{ background: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: 4, padding: 10, fontSize: 12, color: '#e65100' }}>
                Communication is queued and has not been sent yet.
              </div>
            ) : null}

            <div style={{ marginTop: 16, padding: 10, background: '#f9f9f9', borderRadius: 4, fontSize: 11, color: '#999' }}>
              📋 Retention: This record will be retained until {parseInt(selected.sentDate.slice(0, 4)) + 7}-{selected.sentDate.slice(5, 10)} per regulatory policy.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
