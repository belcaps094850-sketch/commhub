import { communications, templates, activityLog } from '../data/sampleData'

export default function Dashboard({ onNavigate }) {
  const totalSent = communications.reduce((s, c) => s + c.sent, 0)
  const totalDelivered = communications.reduce((s, c) => s + c.delivered, 0)
  const totalFailed = communications.reduce((s, c) => s + c.failed, 0)
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0
  const activeTemplates = templates.filter(t => t.status === 'Active').length
  const scheduled = communications.filter(c => c.status === 'Scheduled').length
  const inProgress = communications.filter(c => c.status === 'In Progress').length

  const stats = [
    { label: 'Total Sent', value: totalSent.toLocaleString(), sub: 'All time' },
    { label: 'Delivered', value: `${deliveryRate}%`, sub: `${totalDelivered.toLocaleString()} of ${totalSent.toLocaleString()}` },
    { label: 'Failed', value: totalFailed.toLocaleString(), sub: 'Requires attention' },
    { label: 'Active Templates', value: activeTemplates, sub: `${templates.length} total` },
    { label: 'Scheduled', value: scheduled, sub: 'Upcoming batches' },
    { label: 'In Progress', value: inProgress, sub: 'Currently sending' },
  ]

  const portalStats = ['EE Portal', 'ER Portal', 'GI Commissions', 'GI OSGLI'].map(portal => {
    const portalComms = communications.filter(c => c.portal === portal)
    const sent = portalComms.reduce((s, c) => s + c.sent, 0)
    const delivered = portalComms.reduce((s, c) => s + c.delivered, 0)
    const rate = sent > 0 ? ((delivered / sent) * 100).toFixed(1) : '—'
    return { portal, sent, delivered, rate, batches: portalComms.length }
  })

  const channelBreakdown = {}
  communications.forEach(c => {
    if (!channelBreakdown[c.channel]) channelBreakdown[c.channel] = { sent: 0, delivered: 0 }
    channelBreakdown[c.channel].sent += c.sent
    channelBreakdown[c.channel].delivered += c.delivered
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Dashboard</h1>
          <p style={{ color: '#999', fontSize: 13 }}>Communication overview across all portals</p>
        </div>
        <button
          onClick={() => onNavigate('compose')}
          style={{ padding: '8px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          + New Communication
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ border: '1px solid #eee', borderRadius: 6, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 'bold' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Portal Breakdown */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
          Portal Breakdown
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '8px 0', fontWeight: '600' }}>Portal</th>
              <th style={{ padding: '8px 0', fontWeight: '600' }}>Batches</th>
              <th style={{ padding: '8px 0', fontWeight: '600' }}>Sent</th>
              <th style={{ padding: '8px 0', fontWeight: '600' }}>Delivered</th>
              <th style={{ padding: '8px 0', fontWeight: '600' }}>Rate</th>
            </tr>
          </thead>
          <tbody>
            {portalStats.map(p => (
              <tr key={p.portal} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '8px 0', fontWeight: '500' }}>{p.portal}</td>
                <td style={{ padding: '8px 0' }}>{p.batches}</td>
                <td style={{ padding: '8px 0' }}>{p.sent.toLocaleString()}</td>
                <td style={{ padding: '8px 0' }}>{p.delivered.toLocaleString()}</td>
                <td style={{ padding: '8px 0' }}>{p.rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Channel Breakdown */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
          Channel Performance
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {Object.entries(channelBreakdown).map(([channel, data]) => (
            <div key={channel} style={{ border: '1px solid #eee', borderRadius: 6, padding: 14 }}>
              <div style={{ fontSize: 12, color: '#999' }}>{channel}</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', margin: '4px 0' }}>{data.sent.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#bbb' }}>
                {data.sent > 0 ? ((data.delivered / data.sent) * 100).toFixed(1) : 0}% delivery rate
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 10, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
          Recent Activity
        </h2>
        {activityLog.map(a => (
          <div key={a.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'flex-start' }}>
            <span style={{ fontSize: 14, marginTop: 2 }}>
              {a.type === 'edit' ? '✏️' : a.type === 'create' ? '🆕' : '⚙️'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13 }}>
                <strong>{a.user}</strong> — {a.action}
              </div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{a.detail}</div>
            </div>
            <div style={{ fontSize: 11, color: '#bbb', whiteSpace: 'nowrap' }}>{a.time}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
