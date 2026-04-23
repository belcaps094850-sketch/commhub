import { useState } from 'react'

const typeIcon = { critical: '🔴', warning: '🟡', info: '🔵' }
const typeStyle = {
  critical: { bg: '#ffebee', border: '#ffcdd2' },
  warning: { bg: '#fff3e0', border: '#ffe0b2' },
  info: { bg: '#f5f5f5', border: '#eee' }
}

export function NotificationBell({ notifications, onClick }) {
  const unread = notifications.filter(n => !n.read).length
  return (
    <button onClick={onClick} style={{ position: 'relative', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: '4px 8px' }}>
      🔔
      {unread > 0 && (
        <span style={{
          position: 'absolute', top: 0, right: 2, background: '#c62828', color: '#fff',
          fontSize: 10, fontWeight: 'bold', borderRadius: '50%', width: 16, height: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {unread}
        </span>
      )}
    </button>
  )
}

export function NotificationDropdown({ notifications, onMarkRead, onMarkAllRead, onAction, onClose }) {
  return (
    <div style={{
      position: 'absolute', top: 44, right: 0, width: 380, maxHeight: 480, overflowY: 'auto',
      background: '#fff', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid #eee' }}>
        <span style={{ fontWeight: 'bold', fontSize: 14 }}>Notifications</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onMarkAllRead} style={{ background: 'none', border: 'none', color: '#666', fontSize: 11, cursor: 'pointer' }}>Mark all read</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', fontSize: 16, cursor: 'pointer' }}>×</button>
        </div>
      </div>
      {notifications.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: '#999', fontSize: 13 }}>No notifications</div>
      )}
      {notifications.map(n => (
        <div
          key={n.id}
          style={{
            padding: '10px 16px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
            background: n.read ? '#fff' : typeStyle[n.type].bg
          }}
          onClick={() => onMarkRead(n.id)}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 12, marginTop: 2 }}>{typeIcon[n.type]}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: n.read ? 'normal' : '600' }}>{n.title}</div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{n.message}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#bbb' }}>{n.time}</span>
                {n.action && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onAction(n) }}
                    style={{ fontSize: 11, padding: '2px 8px', background: '#333', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}
                  >
                    {n.action}
                  </button>
                )}
              </div>
            </div>
            {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#333', marginTop: 6, flexShrink: 0 }} />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function NotificationPage({ notifications, onMarkRead, onMarkAllRead }) {
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? notifications :
    filter === 'unread' ? notifications.filter(n => !n.read) :
    notifications.filter(n => n.type === filter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Notifications</h1>
          <p style={{ color: '#999', fontSize: 13 }}>{notifications.filter(n => !n.read).length} unread</p>
        </div>
        <button onClick={onMarkAllRead} style={{ padding: '6px 14px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
          Mark All Read
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'unread', 'critical', 'warning', 'info'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
            background: filter === f ? '#333' : '#fff', color: filter === f ? '#fff' : '#555',
            cursor: 'pointer', textTransform: 'capitalize'
          }}>{f}</button>
        ))}
      </div>

      {filtered.map(n => (
        <div key={n.id} style={{
          display: 'flex', gap: 12, padding: '14px 16px', marginBottom: 8,
          border: `1px solid ${n.read ? '#eee' : typeStyle[n.type].border}`,
          borderRadius: 6, background: n.read ? '#fff' : typeStyle[n.type].bg, cursor: 'pointer'
        }} onClick={() => onMarkRead(n.id)}>
          <span style={{ fontSize: 16 }}>{typeIcon[n.type]}</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, fontWeight: n.read ? 'normal' : '600' }}>{n.title}</span>
              <span style={{ fontSize: 11, color: '#bbb' }}>{n.time}</span>
            </div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{n.message}</div>
          </div>
          {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', marginTop: 4, flexShrink: 0 }} />}
        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>No notifications match this filter</div>
      )}
    </div>
  )
}
