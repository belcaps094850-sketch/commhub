import { useState } from 'react'

const sampleRecipients = [
  { id: 'r1', name: 'Sarah Johnson', email: 'sarah.j@email.com', memberId: 'EE-10042', portal: 'EE Portal', plan: 'Gold PPO', status: 'Active', lastComm: '2026-03-01' },
  { id: 'r2', name: 'Michael Chen', email: 'mchen@email.com', memberId: 'EE-10089', portal: 'EE Portal', plan: 'Silver HMO', status: 'Active', lastComm: '2026-03-01' },
  { id: 'r3', name: 'Lisa Rodriguez', email: 'lrodriguez@email.com', memberId: 'ER-20015', portal: 'ER Portal', plan: 'Enterprise', status: 'Active', lastComm: '2026-03-06' },
  { id: 'r4', name: 'James Williams', email: 'jwilliams@email.com', memberId: 'GC-30021', portal: 'GI Commissions', plan: 'Agent Tier 1', status: 'Active', lastComm: '2026-03-07' },
  { id: 'r5', name: 'Emily Davis', email: 'edavis@email.com', memberId: 'OS-40033', portal: 'GI OSGLI', plan: 'OSGLI Standard', status: 'Active', lastComm: '2026-03-09' },
  { id: 'r6', name: 'Robert Kim', email: 'rkim@email.com', memberId: 'EE-10156', portal: 'EE Portal', plan: 'Bronze HDHP', status: 'Inactive', lastComm: '2026-02-15' },
  { id: 'r7', name: 'Amanda Foster', email: 'afoster@email.com', memberId: 'EE-10203', portal: 'EE Portal', plan: 'Gold PPO', status: 'Active', lastComm: '2026-03-01' },
  { id: 'r8', name: 'David Park', email: 'dpark@email.com', memberId: 'ER-20087', portal: 'ER Portal', plan: 'Enterprise', status: 'Active', lastComm: '2026-03-06' },
  { id: 'r9', name: 'Maria Gonzalez', email: 'mgonzalez@email.com', memberId: 'GC-30055', portal: 'GI Commissions', plan: 'Agent Tier 2', status: 'Active', lastComm: '2026-03-07' },
  { id: 'r10', name: 'Thomas Brown', email: 'tbrown@email.com', memberId: 'OS-40071', portal: 'GI OSGLI', plan: 'OSGLI Standard', status: 'Pending', lastComm: null },
]

export default function Recipients() {
  const [search, setSearch] = useState('')
  const [portalFilter, setPortalFilter] = useState('All')

  const portals = ['All', 'EE Portal', 'ER Portal', 'GI Commissions', 'GI OSGLI']

  const filtered = sampleRecipients.filter(r => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.memberId.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
    const matchPortal = portalFilter === 'All' || r.portal === portalFilter
    return matchSearch && matchPortal
  })

  const statusStyle = (s) => {
    if (s === 'Active') return { background: '#e8f5e9', color: '#2e7d32' }
    if (s === 'Inactive') return { background: '#ffebee', color: '#c62828' }
    return { background: '#fff3e0', color: '#e65100' }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Recipients</h1>
          <p style={{ color: '#999', fontSize: 13 }}>{sampleRecipients.length} total · {sampleRecipients.filter(r => r.status === 'Active').length} active</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '8px 16px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
            Import CSV
          </button>
          <button style={{ padding: '8px 16px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
            Export
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or member ID..."
          style={{ flex: 1, padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
        />
        <select
          value={portalFilter}
          onChange={e => setPortalFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, background: '#fff' }}
        >
          {portals.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Name</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Email</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Member ID</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Portal</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Plan</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Status</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Last Comm</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(r => {
            const ss = statusStyle(r.status)
            return (
              <tr key={r.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 0', fontWeight: '500' }}>{r.name}</td>
                <td style={{ padding: '10px 0', color: '#666' }}>{r.email}</td>
                <td style={{ padding: '10px 0', fontFamily: 'monospace', fontSize: 12 }}>{r.memberId}</td>
                <td style={{ padding: '10px 0', color: '#666' }}>{r.portal}</td>
                <td style={{ padding: '10px 0', color: '#666' }}>{r.plan}</td>
                <td style={{ padding: '10px 0' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, ...ss }}>{r.status}</span>
                </td>
                <td style={{ padding: '10px 0', color: '#999' }}>{r.lastComm || '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>No recipients found</div>
      )}
    </div>
  )
}
