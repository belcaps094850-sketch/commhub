import { useState } from 'react'
import { communications as initialComms } from '../data/sampleData'

export default function Communications() {
  const [comms] = useState(initialComms)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const statuses = ['All', 'Completed', 'In Progress', 'Scheduled']
  const filtered = filter === 'All' ? comms : comms.filter(c => c.status === filter)

  const statusColor = (s) => {
    if (s === 'Completed') return { bg: '#e8f5e9', color: '#2e7d32' }
    if (s === 'In Progress') return { bg: '#e3f2fd', color: '#1565c0' }
    if (s === 'Scheduled') return { bg: '#fff3e0', color: '#e65100' }
    return { bg: '#f5f5f5', color: '#999' }
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Communications</h1>
        <p style={{ color: '#999', fontSize: 13 }}>{comms.length} batches · {comms.filter(c => c.status === 'Completed').length} completed</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: '5px 14px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
              background: filter === s ? '#333' : '#fff', color: filter === s ? '#fff' : '#555', cursor: 'pointer'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Name</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Template</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Portal</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Channel</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Recipients</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Delivered</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Status</th>
            <th style={{ padding: '10px 0', fontWeight: '600' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(c => {
            const sc = statusColor(c.status)
            return (
              <tr
                key={c.id}
                onClick={() => setSelected(selected?.id === c.id ? null : c)}
                style={{ borderBottom: '1px solid #f5f5f5', cursor: 'pointer', background: selected?.id === c.id ? '#fafafa' : '#fff' }}
              >
                <td style={{ padding: '10px 0', fontWeight: '500' }}>{c.name}</td>
                <td style={{ padding: '10px 0', color: '#666' }}>{c.template}</td>
                <td style={{ padding: '10px 0', color: '#666' }}>{c.portal}</td>
                <td style={{ padding: '10px 0', color: '#666' }}>{c.channel}</td>
                <td style={{ padding: '10px 0' }}>{c.recipients.toLocaleString()}</td>
                <td style={{ padding: '10px 0' }}>
                  {c.sent > 0 ? `${((c.delivered / c.sent) * 100).toFixed(1)}%` : '—'}
                </td>
                <td style={{ padding: '10px 0' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: sc.bg, color: sc.color }}>
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '10px 0', color: '#999' }}>{c.sentDate}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Detail Panel */}
      {selected && (
        <div style={{ marginTop: 20, border: '1px solid #eee', borderRadius: 6, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>{selected.name}</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#999' }}>Recipients</div>
              <div style={{ fontSize: 22, fontWeight: 'bold' }}>{selected.recipients.toLocaleString()}</div>
            </div>
            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#999' }}>Sent</div>
              <div style={{ fontSize: 22, fontWeight: 'bold' }}>{selected.sent.toLocaleString()}</div>
            </div>
            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#999' }}>Delivered</div>
              <div style={{ fontSize: 22, fontWeight: 'bold' }}>{selected.delivered.toLocaleString()}</div>
            </div>
            <div style={{ border: '1px solid #eee', borderRadius: 4, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#999' }}>Failed</div>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: selected.failed > 0 ? '#c62828' : '#333' }}>{selected.failed.toLocaleString()}</div>
            </div>
          </div>

          {/* Progress Bar */}
          {selected.sent > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span>Delivery Progress</span>
                <span>{((selected.delivered / selected.recipients) * 100).toFixed(1)}%</span>
              </div>
              <div style={{ height: 6, background: '#eee', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: 6, borderRadius: 3,
                  width: `${(selected.delivered / selected.recipients) * 100}%`,
                  background: selected.failed > 10 ? '#e65100' : '#333'
                }} />
              </div>
            </div>
          )}

          {selected.opened !== null && selected.sent > 0 && (
            <div style={{ fontSize: 13, color: '#666' }}>
              📨 Open rate: <strong>{((selected.opened / selected.delivered) * 100).toFixed(1)}%</strong> ({selected.opened.toLocaleString()} opened)
            </div>
          )}
        </div>
      )}
    </div>
  )
}
