import { communications } from '../data/sampleData'

export default function Analytics() {
  const completed = communications.filter(c => c.status === 'Completed')
  const totalSent = completed.reduce((s, c) => s + c.sent, 0)
  const totalDelivered = completed.reduce((s, c) => s + c.delivered, 0)
  const totalOpened = completed.reduce((s, c) => s + (c.opened || 0), 0)
  const totalFailed = completed.reduce((s, c) => s + c.failed, 0)

  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0
  const openRate = totalDelivered > 0 ? ((totalOpened / totalDelivered) * 100).toFixed(1) : 0
  const failureRate = totalSent > 0 ? ((totalFailed / totalSent) * 100).toFixed(1) : 0

  // Simulated weekly data
  const weeklyData = [
    { week: 'Feb 10', sent: 8200, delivered: 8100, opened: 5800 },
    { week: 'Feb 17', sent: 9500, delivered: 9380, opened: 6700 },
    { week: 'Feb 24', sent: 7800, delivered: 7720, opened: 5500 },
    { week: 'Mar 3', sent: 16130, delivered: 15976, opened: 9337 },
    { week: 'Mar 10', sent: 1935, delivered: 1922, opened: 1000 },
  ]
  const maxSent = Math.max(...weeklyData.map(w => w.sent))

  // Template performance
  const templatePerf = {}
  completed.forEach(c => {
    if (!templatePerf[c.template]) templatePerf[c.template] = { sent: 0, delivered: 0, opened: 0, failed: 0, batches: 0 }
    templatePerf[c.template].sent += c.sent
    templatePerf[c.template].delivered += c.delivered
    templatePerf[c.template].opened += c.opened || 0
    templatePerf[c.template].failed += c.failed
    templatePerf[c.template].batches += 1
  })

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>Analytics</h1>
      <p style={{ color: '#999', fontSize: 13, marginBottom: 24 }}>Communication performance metrics</p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Delivery Rate', value: `${deliveryRate}%`, sub: `${totalDelivered.toLocaleString()} delivered`, good: true },
          { label: 'Open Rate', value: `${openRate}%`, sub: `${totalOpened.toLocaleString()} opened`, good: parseFloat(openRate) > 50 },
          { label: 'Failure Rate', value: `${failureRate}%`, sub: `${totalFailed.toLocaleString()} failed`, good: parseFloat(failureRate) < 2 },
          { label: 'Total Batches', value: completed.length, sub: `${communications.length} all time`, good: true },
        ].map(kpi => (
          <div key={kpi.label} style={{ border: '1px solid #eee', borderRadius: 6, padding: 16 }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: kpi.good ? '#333' : '#c62828' }}>{kpi.value}</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly Trend (bar chart) */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
          Weekly Volume
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 160, padding: '0 10px' }}>
          {weeklyData.map(w => (
            <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 11, color: '#999' }}>{w.sent.toLocaleString()}</div>
              <div style={{
                width: '100%', maxWidth: 60,
                height: `${(w.sent / maxSent) * 120}px`,
                background: '#333',
                borderRadius: '3px 3px 0 0'
              }} />
              <div style={{ fontSize: 11, color: '#666' }}>{w.week}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Performance */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
          Template Performance
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '10px 0', fontWeight: '600' }}>Template</th>
              <th style={{ padding: '10px 0', fontWeight: '600' }}>Batches</th>
              <th style={{ padding: '10px 0', fontWeight: '600' }}>Total Sent</th>
              <th style={{ padding: '10px 0', fontWeight: '600' }}>Delivery Rate</th>
              <th style={{ padding: '10px 0', fontWeight: '600' }}>Open Rate</th>
              <th style={{ padding: '10px 0', fontWeight: '600' }}>Failed</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(templatePerf).map(([name, data]) => (
              <tr key={name} style={{ borderBottom: '1px solid #f5f5f5' }}>
                <td style={{ padding: '10px 0', fontWeight: '500' }}>{name}</td>
                <td style={{ padding: '10px 0' }}>{data.batches}</td>
                <td style={{ padding: '10px 0' }}>{data.sent.toLocaleString()}</td>
                <td style={{ padding: '10px 0' }}>
                  {data.sent > 0 ? ((data.delivered / data.sent) * 100).toFixed(1) : '—'}%
                </td>
                <td style={{ padding: '10px 0' }}>
                  {data.delivered > 0 && data.opened > 0 ? ((data.opened / data.delivered) * 100).toFixed(1) : '—'}%
                </td>
                <td style={{ padding: '10px 0', color: data.failed > 10 ? '#c62828' : '#333' }}>
                  {data.failed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div>
        <h2 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 6 }}>
          Insights
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ border: '1px solid #eee', borderRadius: 4, padding: '12px 16px', display: 'flex', gap: 10 }}>
            <span>📈</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: '500' }}>Volume spike in Week of Mar 3</div>
              <div style={{ fontSize: 12, color: '#888' }}>16,130 communications sent — 90% higher than previous week. Driven by Q1 EOB batch (12,480) and Welcome Letters (3,200).</div>
            </div>
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: 4, padding: '12px 16px', display: 'flex', gap: 10 }}>
            <span>⚠️</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: '500' }}>EOB batch had 168 delivery failures</div>
              <div style={{ fontSize: 12, color: '#888' }}>1.3% failure rate — within acceptable range but worth investigating. Most failures were bounced email addresses in EE Portal.</div>
            </div>
          </div>
          <div style={{ border: '1px solid #eee', borderRadius: 4, padding: '12px 16px', display: 'flex', gap: 10 }}>
            <span>✅</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: '500' }}>Password Reset emails have highest open rate</div>
              <div style={{ fontSize: 12, color: '#888' }}>87.5% open rate — transactional emails consistently outperform batch communications. Consider adding account recovery to SMS channel.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
