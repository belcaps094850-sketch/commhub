import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import { roles, allPermissions } from '../data/notifications'

export default function RoleAccess({ currentRole, onRoleChange }) {
  const store = useStore()
  const [activeTab, setActiveTab] = useState('users')
  const users = store.users
  const [selectedRole, setSelectedRole] = useState(null)

  const categories = [...new Set(allPermissions.map(p => p.category))]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Access Control</h1>
          <p style={{ color: '#999', fontSize: 13 }}>Manage roles, permissions, and user access</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#999' }}>Preview as:</label>
          <select
            value={currentRole}
            onChange={e => onRoleChange(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}
          >
            {Object.entries(roles).map(([key, role]) => (
              <option key={key} value={key}>{role.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Role Banner */}
      <div style={{ background: '#f9f9f9', border: '1px solid #eee', borderRadius: 6, padding: 14, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: '500' }}>Current Role: </span>
          <span style={{ fontSize: 13, padding: '2px 10px', background: '#333', color: '#fff', borderRadius: 3 }}>{roles[currentRole].label}</span>
          <span style={{ fontSize: 12, color: '#888', marginLeft: 10 }}>{roles[currentRole].description}</span>
        </div>
        <span style={{ fontSize: 12, color: '#999' }}>{roles[currentRole].permissions.length} permissions</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['users', 'roles', 'permissions'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '6px 16px', fontSize: 13, border: '1px solid #ddd', borderRadius: 4,
            background: activeTab === tab ? '#333' : '#fff', color: activeTab === tab ? '#fff' : '#555',
            cursor: 'pointer', textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Last Login</th>
                <th style={{ padding: '10px 0', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 0', fontWeight: '500' }}>{u.name}</td>
                  <td style={{ padding: '10px 0', color: '#666' }}>{u.email}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{ fontSize: 11, padding: '2px 8px', background: '#f5f5f5', borderRadius: 3 }}>{roles[u.role]?.label}</span>
                  </td>
                  <td style={{ padding: '10px 0', color: '#999', fontSize: 12 }}>{u.lastLogin}</td>
                  <td style={{ padding: '10px 0' }}>
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 3,
                      background: u.status === 'Active' ? '#e8f5e9' : '#ffebee',
                      color: u.status === 'Active' ? '#2e7d32' : '#c62828'
                    }}>{u.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ width: 240 }}>
            {Object.entries(roles).map(([key, role]) => (
              <div
                key={key}
                onClick={() => setSelectedRole(key)}
                style={{
                  padding: '12px 14px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                  background: selectedRole === key ? '#f9f9f9' : '#fff'
                }}
              >
                <div style={{ fontWeight: '500', fontSize: 14 }}>{role.label}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{role.description}</div>
                <div style={{ fontSize: 11, color: '#bbb', marginTop: 4 }}>{role.permissions.length} permissions · {users.filter(u => u.role === key).length} users</div>
              </div>
            ))}
          </div>

          {selectedRole && (
            <div style={{ flex: 1, border: '1px solid #eee', borderRadius: 6, padding: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>{roles[selectedRole].label}</h3>
              <p style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>{roles[selectedRole].description}</p>

              <div style={{ fontSize: 13, fontWeight: '600', marginBottom: 10 }}>Permissions</div>
              {categories.map(cat => {
                const catPerms = allPermissions.filter(p => p.category === cat)
                return (
                  <div key={cat} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' }}>{cat}</div>
                    {catPerms.map(p => {
                      const has = roles[selectedRole].permissions.includes(p.key)
                      return (
                        <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                          <span style={{ fontSize: 12 }}>{has ? '✅' : '⬜'}</span>
                          <span style={{ fontSize: 13, color: has ? '#333' : '#ccc' }}>{p.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )
              })}

              <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Users with this role:</div>
                {users.filter(u => u.role === selectedRole).map(u => (
                  <div key={u.id} style={{ fontSize: 13, padding: '3px 0' }}>{u.name} ({u.email})</div>
                ))}
                {users.filter(u => u.role === selectedRole).length === 0 && (
                  <div style={{ fontSize: 12, color: '#ccc' }}>No users assigned</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Permissions Matrix Tab */}
      {activeTab === 'permissions' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', minWidth: 160 }}>Permission</th>
                {Object.entries(roles).map(([key, role]) => (
                  <th key={key} style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', minWidth: 90 }}>{role.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <>
                  <tr key={cat}>
                    <td colSpan={Object.keys(roles).length + 1} style={{ padding: '8px', fontWeight: '600', fontSize: 11, color: '#999', background: '#fafafa', textTransform: 'uppercase' }}>
                      {cat}
                    </td>
                  </tr>
                  {allPermissions.filter(p => p.category === cat).map(p => (
                    <tr key={p.key} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '6px 8px' }}>{p.label}</td>
                      {Object.entries(roles).map(([key, role]) => (
                        <td key={key} style={{ padding: '6px 8px', textAlign: 'center' }}>
                          {role.permissions.includes(p.key) ? '✅' : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Management */}
      {activeTab === 'users' && (
        <div style={{ marginTop: 28, padding: 16, background: '#fafafa', border: '1px solid #eee', borderRadius: 6 }}>
          <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 10 }}>Data Management</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                const data = JSON.stringify({
                  templates: store.templates,
                  communications: store.communications,
                  approvals: store.approvals,
                  segments: store.segments,
                  abTests: store.abTests,
                  reports: store.reports,
                  notifications: store.notifications,
                  activityLog: store.activityLog,
                }, null, 2)
                const blob = new Blob([data], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url; a.download = `commhub-export-${new Date().toISOString().slice(0, 10)}.json`
                a.click(); URL.revokeObjectURL(url)
              }}
              style={{ padding: '8px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              📦 Export All Data
            </button>
            <button
              onClick={() => { if (confirm('Reset all data to defaults? This cannot be undone.')) store.resetAll() }}
              style={{ padding: '8px 16px', background: '#fff', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              🔄 Reset to Defaults
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 8 }}>
            Data is stored in your browser's localStorage. Export regularly to back up.
          </div>
        </div>
      )}
    </div>
  )
}
