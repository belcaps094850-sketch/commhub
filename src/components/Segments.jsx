import { useState } from 'react'
import { useStore } from '../hooks/useStore'

const filterFields = ['plan', 'status', 'state', 'enrollDate', 'lastDelivery', 'email', 'age', 'portal', 'region']
const filterOps = ['equals', 'not_equals', 'contains', 'after', 'before', 'is_not_empty', 'greater_than', 'less_than']

export default function Segments() {
  const store = useStore()
  const segments = store.segments
  const [selected, setSelected] = useState(null)
  const [showBuilder, setShowBuilder] = useState(false)
  const [newSeg, setNewSeg] = useState({ name: '', portal: 'EE Portal', filters: [{ field: 'plan', op: 'equals', value: '' }] })

  const addFilter = () => setNewSeg(prev => ({ ...prev, filters: [...prev.filters, { field: 'status', op: 'equals', value: '' }] }))
  const removeFilter = (idx) => setNewSeg(prev => ({ ...prev, filters: prev.filters.filter((_, i) => i !== idx) }))
  const updateFilter = (idx, field, value) => setNewSeg(prev => ({ ...prev, filters: prev.filters.map((f, i) => i === idx ? { ...f, [field]: value } : f) }))

  const saveSegment = () => {
    if (!newSeg.name.trim()) return
    const segment = {
      id: 's' + Date.now(),
      ...newSeg,
      matchCount: Math.floor(Math.random() * 5000) + 100,
      createdBy: 'Bel Capistrano',
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: null,
      usedCount: 0
    }
    store.addItem('segments', segment)
    store.addActivity('Segment created', `"${segment.name}" — ${segment.filters.length} filters`, 'create')
    setShowBuilder(false)
    setNewSeg({ name: '', portal: 'EE Portal', filters: [{ field: 'plan', op: 'equals', value: '' }] })
  }

  const deleteSegment = (id) => {
    const seg = segments.find(s => s.id === id)
    store.removeItem('segments', id)
    store.addActivity('Segment deleted', `"${seg?.name}" removed`, 'edit')
    if (selected?.id === id) setSelected(null)
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Recipient Segments</h1>
          <p style={{ color: '#999', fontSize: 13 }}>{segments.length} saved segments</p>
        </div>
        <button onClick={() => setShowBuilder(!showBuilder)} style={{ padding: '8px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          {showBuilder ? 'Cancel' : '+ New Segment'}
        </button>
      </div>

      {showBuilder && (
        <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 20, marginBottom: 24, background: '#fafafa' }}>
          <h3 style={{ fontSize: 15, fontWeight: 'bold', marginBottom: 12 }}>Build Segment</h3>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Segment Name</label>
              <input value={newSeg.name} onChange={e => setNewSeg(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Gold PPO Members in NY" style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }} />
            </div>
            <div style={{ width: 180 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Portal</label>
              <select value={newSeg.portal} onChange={e => setNewSeg(prev => ({ ...prev, portal: e.target.value }))} style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, background: '#fff' }}>
                {['All', 'EE Portal', 'ER Portal', 'GI Commissions', 'GI OSGLI'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Filters:</div>
          {newSeg.filters.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
              {i > 0 && <span style={{ fontSize: 11, color: '#999', width: 30 }}>AND</span>}
              {i === 0 && <span style={{ width: 30 }} />}
              <select value={f.field} onChange={e => updateFilter(i, 'field', e.target.value)} style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
                {filterFields.map(ff => <option key={ff}>{ff}</option>)}
              </select>
              <select value={f.op} onChange={e => updateFilter(i, 'op', e.target.value)} style={{ padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
                {filterOps.map(o => <option key={o}>{o.replace(/_/g, ' ')}</option>)}
              </select>
              {f.op !== 'is_not_empty' && <input value={f.value} onChange={e => updateFilter(i, 'value', e.target.value)} placeholder="Value" style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12 }} />}
              <button onClick={() => removeFilter(i)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={addFilter} style={{ padding: '5px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>+ Add Filter</button>
            <button onClick={saveSegment} disabled={!newSeg.name.trim()} style={{ padding: '5px 16px', background: newSeg.name.trim() ? '#333' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Save Segment</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          {segments.map(s => (
            <div key={s.id} onClick={() => setSelected(s)} style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', background: selected?.id === s.id ? '#f9f9f9' : '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', fontSize: 14 }}>{s.name}</span>
                <span style={{ fontSize: 13, fontWeight: 'bold' }}>{s.matchCount.toLocaleString()}</span>
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{s.portal} · {s.filters.length} filter{s.filters.length !== 1 ? 's' : ''} · Used {s.usedCount}x</div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{ width: 340, border: '1px solid #eee', borderRadius: 6, padding: 20, alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
            <div style={{ textAlign: 'center', padding: 16, background: '#f9f9f9', borderRadius: 6, marginBottom: 16 }}>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{selected.matchCount.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#999' }}>matching recipients</div>
            </div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>
              {[['Portal', selected.portal], ['Created by', selected.createdBy], ['Created', selected.createdAt], ['Last used', selected.lastUsed || 'Never'], ['Times used', selected.usedCount]].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#999' }}>{l}</span><span>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Filters</div>
              {selected.filters.map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0' }}>
                  {i > 0 && <span style={{ fontSize: 10, color: '#999', background: '#f5f5f5', padding: '1px 6px', borderRadius: 2 }}>AND</span>}
                  <span style={{ fontSize: 12, fontFamily: 'monospace', background: '#f5f5f5', padding: '2px 6px', borderRadius: 3 }}>
                    {f.field} {f.op.replace(/_/g, ' ')} {f.value && `"${f.value}"`}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, padding: '8px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Use in Compose</button>
              <button onClick={() => deleteSegment(selected.id)} style={{ padding: '8px 12px', background: '#fff', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
