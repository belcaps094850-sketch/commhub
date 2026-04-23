import { roles } from '../data/notifications'

const navSections = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: '📊' },
      { key: 'notifications', label: 'Notifications', icon: '🔔' },
    ]
  },
  {
    label: 'Content',
    items: [
      { key: 'templates', label: 'Templates', icon: '📄' },
      { key: 'editor', label: 'Template Editor', icon: '🖊️' },
      { key: 'designer', label: 'Visual Designer', icon: '🎨' },
      { key: 'approvals', label: 'Approvals', icon: '✅', permission: 'approve_template' },
    ]
  },
  {
    label: 'Delivery',
    items: [
      { key: 'communications', label: 'Communications', icon: '📬' },
      { key: 'compose', label: 'Compose', icon: '✏️', permission: 'create_comm' },
      { key: 'recipients', label: 'Recipients', icon: '👥' },
      { key: 'segments', label: 'Segments', icon: '🎯' },
      { key: 'abtesting', label: 'A/B Testing', icon: '🧪' },
    ]
  },
  {
    label: 'Insights',
    items: [
      { key: 'analytics', label: 'Analytics', icon: '📈' },
      { key: 'reports', label: 'Scheduled Reports', icon: '📋' },
      { key: 'archive', label: 'Archive & Search', icon: '🗄️' },
      { key: 'audit', label: 'Audit Trail', icon: '🔒', permission: 'view_audit' },
      { key: 'journey', label: 'Journey Map', icon: '🗺️' },
    ]
  },
  {
    label: 'Admin',
    items: [
      { key: 'access', label: 'Access Control', icon: '🛡️', permission: 'manage_roles' },
    ]
  }
]

export default function Sidebar({ active, onNavigate, currentRole }) {
  const currentPerms = roles[currentRole]?.permissions || []

  return (
    <div style={{
      width: 220,
      minHeight: '100vh',
      borderRight: '1px solid #eee',
      padding: '20px 0',
      background: '#fafafa',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ padding: '0 20px 20px', borderBottom: '1px solid #eee', marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 'bold' }}>CommHub</div>
        <div style={{ fontSize: 11, color: '#999' }}>Communication Automation</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {navSections.map(section => {
          const visibleItems = section.items.filter(item =>
            !item.permission || currentPerms.includes(item.permission)
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={section.label} style={{ marginBottom: 4 }}>
              <div style={{ padding: '10px 20px 4px', fontSize: 10, fontWeight: '600', color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {section.label}
              </div>
              {visibleItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => onNavigate(item.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '8px 20px',
                    border: 'none',
                    background: active === item.key ? '#333' : 'transparent',
                    color: active === item.key ? '#fff' : '#555',
                    fontSize: 13,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: 14 }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '12px 20px', borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: 10, color: '#bbb', textTransform: 'uppercase', marginBottom: 6 }}>Portals</div>
        {['EE Portal', 'ER Portal', 'GI Commissions', 'GI OSGLI'].map(p => (
          <div key={p} style={{ padding: '2px 0', color: '#888', fontSize: 11 }}>• {p}</div>
        ))}
      </div>
    </div>
  )
}
