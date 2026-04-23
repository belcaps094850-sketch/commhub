import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { communications, templates, activityLog } from '../data/sampleData'
import { defaultNotifications } from '../data/notifications'

const availableWidgets = [
  { id: 'delivery', label: 'Delivery Stats', icon: '📬', size: 'half' },
  { id: 'channels', label: 'Channel Breakdown', icon: '📡', size: 'half' },
  { id: 'portals', label: 'Portal Overview', icon: '🏢', size: 'half' },
  { id: 'templates', label: 'Template Activity', icon: '📄', size: 'half' },
  { id: 'alerts', label: 'Recent Alerts', icon: '⚠️', size: 'half' },
  { id: 'activity', label: 'Activity Feed', icon: '📋', size: 'half' },
  { id: 'pipeline', label: 'Batch Pipeline', icon: '🔄', size: 'full' },
  { id: 'weekly', label: 'Weekly Trend', icon: '📈', size: 'full' },
]

const weeklyData = [
  { week: 'Feb 10', sent: 8200 },
  { week: 'Feb 17', sent: 9500 },
  { week: 'Feb 24', sent: 7800 },
  { week: 'Mar 3', sent: 16130 },
  { week: 'Mar 10', sent: 1935 },
]

function DeliveryWidget() {
  const totalSent = communications.reduce((s, c) => s + c.sent, 0)
  const totalDelivered = communications.reduce((s, c) => s + c.delivered, 0)
  const totalFailed = communications.reduce((s, c) => s + c.failed, 0)
  const rate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 'bold' }}>{totalSent.toLocaleString()}</div><div style={{ fontSize: 10, color: '#999' }}>Sent</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 'bold' }}>{rate}%</div><div style={{ fontSize: 10, color: '#999' }}>Delivered</div></div>
        <div style={{ textAlign: 'center' }}><div style={{ fontSize: 22, fontWeight: 'bold', color: totalFailed > 0 ? '#c62828' : '#333' }}>{totalFailed}</div><div style={{ fontSize: 10, color: '#999' }}>Failed</div></div>
      </div>
    </div>
  )
}

function ChannelWidget() {
  const channels = {}
  communications.forEach(c => {
    if (!channels[c.channel]) channels[c.channel] = 0
    channels[c.channel] += c.sent
  })
  const total = Object.values(channels).reduce((a, b) => a + b, 0)
  return (
    <div>
      {Object.entries(channels).map(([ch, count]) => (
        <div key={ch} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
            <span>{ch}</span><span>{total > 0 ? ((count / total) * 100).toFixed(0) : 0}%</span>
          </div>
          <div style={{ height: 6, background: '#eee', borderRadius: 3 }}>
            <div style={{ height: 6, background: '#333', borderRadius: 3, width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function PortalWidget() {
  return (
    <div>
      {['EE Portal', 'ER Portal', 'GI Commissions', 'GI OSGLI'].map(portal => {
        const comms = communications.filter(c => c.portal === portal)
        const sent = comms.reduce((s, c) => s + c.sent, 0)
        return (
          <div key={portal} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5', fontSize: 12 }}>
            <span>{portal}</span>
            <span style={{ fontWeight: '500' }}>{sent.toLocaleString()}</span>
          </div>
        )
      })}
    </div>
  )
}

function TemplateWidget() {
  return (
    <div>
      {templates.slice(0, 5).map(t => (
        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f5f5f5' }}>
          <span style={{ fontSize: 12 }}>{t.name}</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 3, background: t.status === 'Active' ? '#e8f5e9' : '#fff3e0', color: t.status === 'Active' ? '#2e7d32' : '#e65100' }}>{t.status}</span>
        </div>
      ))}
    </div>
  )
}

function AlertsWidget() {
  const alerts = defaultNotifications.filter(n => n.type !== 'info').slice(0, 4)
  return (
    <div>
      {alerts.length === 0 && <div style={{ fontSize: 12, color: '#ccc', textAlign: 'center', padding: 12 }}>No alerts</div>}
      {alerts.map(a => (
        <div key={a.id} style={{ display: 'flex', gap: 6, padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
          <span style={{ fontSize: 10 }}>{a.type === 'critical' ? '🔴' : '🟡'}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: '500' }}>{a.title}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{a.time}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ActivityWidget() {
  return (
    <div>
      {activityLog.slice(0, 4).map(a => (
        <div key={a.id} style={{ padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
          <div style={{ fontSize: 12 }}><strong>{a.user}</strong> — {a.action}</div>
          <div style={{ fontSize: 10, color: '#999' }}>{a.time}</div>
        </div>
      ))}
    </div>
  )
}

function PipelineWidget() {
  const statuses = ['Scheduled', 'In Progress', 'Completed']
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {statuses.map(s => {
        const count = communications.filter(c => c.status === s).length
        const total = communications.filter(c => c.status === s).reduce((sum, c) => sum + c.recipients, 0)
        return (
          <div key={s} style={{ flex: 1, textAlign: 'center', padding: 12, background: '#f9f9f9', borderRadius: 4 }}>
            <div style={{ fontSize: 18, fontWeight: 'bold' }}>{count}</div>
            <div style={{ fontSize: 12, fontWeight: '500' }}>{s}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{total.toLocaleString()} recipients</div>
          </div>
        )
      })}
    </div>
  )
}

function WeeklyWidget() {
  const max = Math.max(...weeklyData.map(w => w.sent))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100 }}>
      {weeklyData.map(w => (
        <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: '#999' }}>{w.sent.toLocaleString()}</div>
          <div style={{ width: '100%', height: `${(w.sent / max) * 80}px`, background: '#333', borderRadius: '3px 3px 0 0' }} />
          <div style={{ fontSize: 10, color: '#666' }}>{w.week}</div>
        </div>
      ))}
    </div>
  )
}

const widgetComponents = {
  delivery: DeliveryWidget,
  channels: ChannelWidget,
  portals: PortalWidget,
  templates: TemplateWidget,
  alerts: AlertsWidget,
  activity: ActivityWidget,
  pipeline: PipelineWidget,
  weekly: WeeklyWidget,
}

export default function DashboardWidgets({ onNavigate }) {
  const store = useStore()
  const [activeWidgets, setActiveWidgets] = useState(store.dashboardWidgets)
  const [editing, setEditing] = useState(false)

  const toggleWidget = (id) => {
    setActiveWidgets(prev => {
      const next = prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]
      store.update('dashboardWidgets', next)
      return next
    })
  }

  const moveWidget = (idx, dir) => {
    setActiveWidgets(prev => {
      const arr = [...prev]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= arr.length) return arr
      ;[arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]]
      store.update('dashboardWidgets', arr)
      return arr
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Dashboard</h1>
          <p style={{ color: '#999', fontSize: 13 }}>Customizable communication overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEditing(!editing)} style={{
            padding: '6px 16px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
            background: editing ? '#333' : '#fff', color: editing ? '#fff' : '#333', cursor: 'pointer'
          }}>
            {editing ? '✓ Done' : '⚙ Customize'}
          </button>
          <button onClick={() => onNavigate('compose')} style={{ padding: '6px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            + New Communication
          </button>
        </div>
      </div>

      {/* Widget Selector */}
      {editing && (
        <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 16, marginBottom: 20, background: '#fafafa' }}>
          <div style={{ fontSize: 12, fontWeight: '600', marginBottom: 8 }}>Available Widgets</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {availableWidgets.map(w => (
              <button key={w.id} onClick={() => toggleWidget(w.id)} style={{
                padding: '6px 12px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
                background: activeWidgets.includes(w.id) ? '#333' : '#fff',
                color: activeWidgets.includes(w.id) ? '#fff' : '#555', cursor: 'pointer'
              }}>
                {w.icon} {w.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Widget Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {activeWidgets.map((widgetId, idx) => {
          const widget = availableWidgets.find(w => w.id === widgetId)
          const Component = widgetComponents[widgetId]
          if (!widget || !Component) return null
          return (
            <div key={widgetId} style={{
              border: '1px solid #eee', borderRadius: 6, padding: 16,
              gridColumn: widget.size === 'full' ? 'span 2' : 'span 1',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: '600' }}>{widget.icon} {widget.label}</span>
                {editing && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {idx > 0 && <button onClick={() => moveWidget(idx, -1)} style={{ width: 20, height: 20, border: '1px solid #ddd', background: '#fff', borderRadius: 3, cursor: 'pointer', fontSize: 10 }}>←</button>}
                    {idx < activeWidgets.length - 1 && <button onClick={() => moveWidget(idx, 1)} style={{ width: 20, height: 20, border: '1px solid #ddd', background: '#fff', borderRadius: 3, cursor: 'pointer', fontSize: 10 }}>→</button>}
                    <button onClick={() => toggleWidget(widgetId)} style={{ width: 20, height: 20, border: '1px solid #ffcdd2', background: '#ffebee', borderRadius: 3, cursor: 'pointer', fontSize: 10, color: '#c62828' }}>×</button>
                  </div>
                )}
              </div>
              <Component />
            </div>
          )
        })}
      </div>

      {activeWidgets.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#ccc', fontSize: 13 }}>
          No widgets selected. Click "Customize" to add widgets.
        </div>
      )}
    </div>
  )
}
