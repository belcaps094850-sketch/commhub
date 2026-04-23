import { useState } from 'react'
import { templates as initialTemplates } from '../data/sampleData'

export default function Templates({ onEdit }) {
  const [templates] = useState(initialTemplates)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...new Set(templates.map(t => t.category))]
  const filtered = filter === 'All' ? templates : templates.filter(t => t.category === filter)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Templates</h1>
          <p style={{ color: '#999', fontSize: 13 }}>{templates.length} templates · {templates.filter(t => t.status === 'Active').length} active</p>
        </div>
        <button style={{ padding: '8px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
          + New Template
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: '5px 14px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
              background: filter === c ? '#333' : '#fff', color: filter === c ? '#fff' : '#555', cursor: 'pointer'
            }}
          >
            {c}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Template List */}
        <div style={{ flex: 1 }}>
          {filtered.map(t => (
            <div
              key={t.id}
              onClick={() => setSelected(t)}
              style={{
                padding: '14px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                background: selected?.id === t.id ? '#f9f9f9' : '#fff'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: '500', fontSize: 14 }}>{t.name}</div>
                <span style={{
                  fontSize: 11, padding: '2px 8px', borderRadius: 3,
                  background: t.status === 'Active' ? '#e8f5e9' : t.status === 'Draft' ? '#fff3e0' : '#f5f5f5',
                  color: t.status === 'Active' ? '#2e7d32' : t.status === 'Draft' ? '#e65100' : '#999'
                }}>
                  {t.status}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                {t.type} · {t.channel} · v{t.version}
              </div>
            </div>
          ))}
        </div>

        {/* Template Detail */}
        {selected && (
          <div style={{ width: 340, border: '1px solid #eee', borderRadius: 6, padding: 20, alignSelf: 'flex-start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 'bold' }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
            <p style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>{selected.description}</p>

            <div style={{ fontSize: 13, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#999' }}>Type</span><span>{selected.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#999' }}>Channel</span><span>{selected.channel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#999' }}>Category</span><span>{selected.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#999' }}>Version</span><span>v{selected.version}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span style={{ color: '#999' }}>Last Modified</span><span>{selected.lastModified}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>Variables</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {selected.variables.map(v => (
                  <span key={v} style={{ fontSize: 11, padding: '3px 8px', background: '#f5f5f5', borderRadius: 3, fontFamily: 'monospace' }}>
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => onEdit && onEdit(selected)} style={{ flex: 1, padding: '8px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Edit</button>
              <button style={{ flex: 1, padding: '8px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Preview</button>
              <button style={{ flex: 1, padding: '8px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Clone</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
