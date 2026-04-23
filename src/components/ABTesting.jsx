import { useState } from 'react'

const defaultTests = [
  {
    id: 'ab1', name: 'EOB Subject Line Test', template: 'Explanation of Benefits', status: 'completed',
    variantA: { name: 'Original', subject: 'Your Explanation of Benefits', sent: 1248, opened: 874, openRate: 70.0 },
    variantB: { name: 'Personalized', subject: '{{memberName}}, your claim summary is ready', sent: 1248, opened: 1048, openRate: 84.0 },
    winner: 'B', startDate: '2026-02-20', endDate: '2026-02-24', totalAudience: 12480, testPercent: 20,
  },
  {
    id: 'ab2', name: 'Premium Reminder — Urgency Test', template: 'Premium Due Reminder', status: 'completed',
    variantA: { name: 'Standard', subject: 'Payment Reminder', sent: 438, opened: 263, openRate: 60.0 },
    variantB: { name: 'Urgent', subject: 'Action Required: Payment Due {{dueDate}}', sent: 437, opened: 341, openRate: 78.0 },
    winner: 'B', startDate: '2026-02-25', endDate: '2026-03-01', totalAudience: 8750, testPercent: 10,
  },
  {
    id: 'ab3', name: 'Welcome Letter Format', template: 'Welcome Letter', status: 'running',
    variantA: { name: 'Long Form', subject: null, sent: 160, opened: null, openRate: null },
    variantB: { name: 'Checklist Style', subject: null, sent: 160, opened: null, openRate: null },
    winner: null, startDate: '2026-03-08', endDate: '2026-03-12', totalAudience: 3200, testPercent: 10,
  },
  {
    id: 'ab4', name: 'Denial Notice Tone', template: 'Claim Denial Notice', status: 'draft',
    variantA: { name: 'Formal', subject: 'Claim Decision Notice', sent: 0, opened: null, openRate: null },
    variantB: { name: 'Empathetic', subject: 'An update about your claim', sent: 0, opened: null, openRate: null },
    winner: null, startDate: null, endDate: null, totalAudience: 285, testPercent: 20,
  },
]

const statusConfig = {
  completed: { label: 'Completed', bg: '#e8f5e9', color: '#2e7d32' },
  running: { label: 'Running', bg: '#e3f2fd', color: '#1565c0' },
  draft: { label: 'Draft', bg: '#f5f5f5', color: '#999' },
}

export default function ABTesting() {
  const [tests] = useState(defaultTests)
  const [selected, setSelected] = useState(null)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>A/B Testing</h1>
          <p style={{ color: '#999', fontSize: 13 }}>{tests.length} tests · {tests.filter(t => t.status === 'running').length} running</p>
        </div>
        <button style={{ padding: '8px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          + New Test
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Tests Run', value: tests.filter(t => t.status === 'completed').length },
          { label: 'Avg Lift', value: '+18.5%', sub: 'Winner vs control' },
          { label: 'Running', value: tests.filter(t => t.status === 'running').length },
        ].map(s => (
          <div key={s.label} style={{ border: '1px solid #eee', borderRadius: 6, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#999' }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 'bold' }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 11, color: '#bbb' }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tests List */}
      {tests.map(test => {
        const sc = statusConfig[test.status]
        const isOpen = selected?.id === test.id
        return (
          <div key={test.id} style={{ border: '1px solid #eee', borderRadius: 6, marginBottom: 12, overflow: 'hidden' }}>
            <div
              onClick={() => setSelected(isOpen ? null : test)}
              style={{ padding: '14px 16px', cursor: 'pointer', background: isOpen ? '#fafafa' : '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: '500', fontSize: 14 }}>{test.name}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  {test.template} · {test.testPercent}% test split · {test.totalAudience.toLocaleString()} total audience
                </div>
              </div>
              {test.winner && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#2e7d32' }}>Winner: Variant {test.winner}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {test.winner === 'A' ? test.variantA.name : test.variantB.name}
                  </div>
                </div>
              )}
              <span style={{ color: '#999', fontSize: 16, marginLeft: 12 }}>{isOpen ? '▾' : '▸'}</span>
            </div>

            {isOpen && (
              <div style={{ padding: '0 16px 16px', borderTop: '1px solid #f0f0f0' }}>
                {/* Variant Comparison */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', gap: 0, marginTop: 16 }}>
                  {/* Variant A */}
                  <div style={{ border: '1px solid #eee', borderRadius: '6px 0 0 6px', padding: 16, background: test.winner === 'A' ? '#f1f8e9' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: '600' }}>Variant A</span>
                      {test.winner === 'A' && <span style={{ fontSize: 10, background: '#2e7d32', color: '#fff', padding: '1px 6px', borderRadius: 3 }}>WINNER</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>{test.variantA.name}</div>
                    {test.variantA.subject && <div style={{ fontSize: 12, color: '#666', marginBottom: 12, fontStyle: 'italic' }}>"{test.variantA.subject}"</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold' }}>{test.variantA.sent.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>Sent</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold' }}>{test.variantA.openRate !== null ? `${test.variantA.openRate}%` : '—'}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>Open Rate</div>
                      </div>
                    </div>
                  </div>

                  {/* VS */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontWeight: 'bold', fontSize: 13, color: '#999' }}>VS</div>

                  {/* Variant B */}
                  <div style={{ border: '1px solid #eee', borderRadius: '0 6px 6px 0', padding: 16, background: test.winner === 'B' ? '#f1f8e9' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: '600' }}>Variant B</span>
                      {test.winner === 'B' && <span style={{ fontSize: 10, background: '#2e7d32', color: '#fff', padding: '1px 6px', borderRadius: 3 }}>WINNER</span>}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>{test.variantB.name}</div>
                    {test.variantB.subject && <div style={{ fontSize: 12, color: '#666', marginBottom: 12, fontStyle: 'italic' }}>"{test.variantB.subject}"</div>}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold' }}>{test.variantB.sent.toLocaleString()}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>Sent</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 'bold' }}>{test.variantB.openRate !== null ? `${test.variantB.openRate}%` : '—'}</div>
                        <div style={{ fontSize: 10, color: '#999' }}>Open Rate</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lift indicator for completed tests */}
                {test.status === 'completed' && test.variantA.openRate && test.variantB.openRate && (
                  <div style={{ marginTop: 12, textAlign: 'center', padding: 10, background: '#f9f9f9', borderRadius: 4 }}>
                    <span style={{ fontSize: 13 }}>
                      Variant {test.winner} outperformed by{' '}
                      <strong style={{ color: '#2e7d32' }}>
                        +{Math.abs(test.variantB.openRate - test.variantA.openRate).toFixed(1)}%
                      </strong>
                      {' '}open rate
                    </span>
                    <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                      Winner auto-sent to remaining {(test.totalAudience - test.variantA.sent - test.variantB.sent).toLocaleString()} recipients
                    </div>
                  </div>
                )}

                {test.status === 'running' && (
                  <div style={{ marginTop: 12, textAlign: 'center', padding: 10, background: '#e3f2fd', borderRadius: 4, fontSize: 12, color: '#1565c0' }}>
                    ⏳ Test running — results expected by {test.endDate}
                  </div>
                )}

                {test.startDate && (
                  <div style={{ marginTop: 8, fontSize: 11, color: '#bbb', textAlign: 'center' }}>
                    {test.startDate} → {test.endDate || 'TBD'}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
