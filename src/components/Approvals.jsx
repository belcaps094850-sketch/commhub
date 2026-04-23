import { useState } from 'react'
import { useStore } from '../hooks/useStore'

const statusConfig = {
  pending: { label: 'Pending Review', bg: '#fff3e0', color: '#e65100' },
  changes_requested: { label: 'Changes Requested', bg: '#ffebee', color: '#c62828' },
  approved: { label: 'Approved', bg: '#e8f5e9', color: '#2e7d32' },
  rejected: { label: 'Rejected', bg: '#ffebee', color: '#c62828' }
}

export default function Approvals() {
  const store = useStore()
  const approvals = store.approvals
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [newComment, setNewComment] = useState('')

  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.status === filter)

  const addComment = (id) => {
    if (!newComment.trim()) return
    store.updateItem('approvals', id, (prev) => ({
      comments: [...prev.comments, { user: 'Bel Capistrano', time: new Date().toISOString().slice(0, 16).replace('T', ' '), text: newComment.trim() }]
    }))
    store.addActivity('Comment added', `Commented on ${selected?.template} approval`, 'edit')
    setNewComment('')
  }

  const updateStatus = (id, status) => {
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
    store.updateItem('approvals', id, { status, ...(status === 'approved' ? { approvedAt: now } : {}) })
    const item = approvals.find(a => a.id === id)
    store.addActivity(`Template ${status}`, `${item?.template} v${item?.version} — ${statusConfig[status]?.label}`, status === 'approved' ? 'create' : 'edit')
    store.addNotification('info', `Template ${statusConfig[status]?.label}`, `${item?.template} v${item?.version} has been ${status.replace('_', ' ')}.`)
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Approval Workflows</h1>
        <p style={{ color: '#999', fontSize: 13 }}>
          {approvals.filter(a => a.status === 'pending').length} pending · {approvals.filter(a => a.status === 'changes_requested').length} changes requested
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { status: 'pending', label: 'Pending Review', icon: '⏳' },
          { status: 'changes_requested', label: 'Changes Requested', icon: '🔄' },
          { status: 'approved', label: 'Approved', icon: '✅' }
        ].map(stage => (
          <div key={stage.status} style={{ border: '1px solid #eee', borderRadius: 6, padding: 14, textAlign: 'center' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{stage.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 'bold' }}>{approvals.filter(a => a.status === stage.status).length}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{stage.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'pending', 'changes_requested', 'approved'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '5px 14px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
            background: filter === f ? '#333' : '#fff', color: filter === f ? '#fff' : '#555', cursor: 'pointer'
          }}>{f === 'all' ? 'All' : statusConfig[f]?.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          {filtered.map(a => {
            const sc = statusConfig[a.status]
            return (
              <div key={a.id} onClick={() => setSelected(a)} style={{
                padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                background: selected?.id === a.id ? '#f9f9f9' : '#fff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '500', fontSize: 14 }}>{a.template}</span>
                    <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>v{a.version}</span>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, background: sc.bg, color: sc.color }}>{sc.label}</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  Submitted by {a.submittedBy} · {a.submittedAt} · {a.comments.length} comment{a.comments.length !== 1 ? 's' : ''}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#999', fontSize: 13 }}>No items</div>}
        </div>

        {selected && (
          <div style={{ width: 380, border: '1px solid #eee', borderRadius: 6, padding: 20, alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>{selected.template}</h3>
                <div style={{ fontSize: 12, color: '#999' }}>Version {selected.version} · {selected.category}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>

            <div style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, display: 'inline-block', marginBottom: 12, background: statusConfig[selected.status]?.bg, color: statusConfig[selected.status]?.color }}>
              {statusConfig[selected.status]?.label}
            </div>

            <div style={{ fontSize: 13, marginBottom: 16 }}>
              {[['Submitted by', selected.submittedBy], ['Submitted', selected.submittedAt], ['Reviewer', selected.reviewer], ...(selected.approvedAt ? [['Approved', selected.approvedAt]] : [])].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#999' }}>{l}</span><span>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>Changes</div>
              <div style={{ fontSize: 13, color: '#444', background: '#f9f9f9', padding: 10, borderRadius: 4 }}>{selected.changes}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Comments ({selected.comments.length})</div>
              {selected.comments.map((c, i) => (
                <div key={i} style={{ padding: '8px 10px', background: '#f9f9f9', borderRadius: 4, marginBottom: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: '600' }}>{c.user}</span>
                    <span style={{ fontSize: 11, color: '#bbb' }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#444' }}>{c.text}</div>
                </div>
              ))}
              {selected.comments.length === 0 && <div style={{ fontSize: 12, color: '#ccc', padding: 8 }}>No comments yet</div>}
            </div>

            {selected.status !== 'approved' && (
              <div style={{ marginBottom: 16 }}>
                <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." style={{ width: '100%', padding: 8, border: '1px solid #ddd', borderRadius: 4, fontSize: 12, minHeight: 60, resize: 'vertical' }} />
                <button onClick={() => addComment(selected.id)} disabled={!newComment.trim()} style={{ marginTop: 4, padding: '5px 14px', background: newComment.trim() ? '#333' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Comment</button>
              </div>
            )}

            {selected.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => updateStatus(selected.id, 'approved')} style={{ flex: 1, padding: '8px', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✓ Approve</button>
                <button onClick={() => updateStatus(selected.id, 'changes_requested')} style={{ flex: 1, padding: '8px', background: '#e65100', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>↩ Changes</button>
                <button onClick={() => updateStatus(selected.id, 'rejected')} style={{ flex: 1, padding: '8px', background: '#c62828', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>✕ Reject</button>
              </div>
            )}
            {selected.status === 'changes_requested' && (
              <button onClick={() => updateStatus(selected.id, 'pending')} style={{ width: '100%', padding: '8px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Resubmit for Review</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
