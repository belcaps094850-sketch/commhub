import { useState } from 'react'

const blockTypes = [
  { type: 'header', label: 'Header', icon: '🏷️', defaultContent: 'Company Name', defaultStyle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: '20px', background: '#f5f5f5' } },
  { type: 'text', label: 'Text Block', icon: '📝', defaultContent: 'Enter your text here. Use {{variables}} for personalization.', defaultStyle: { fontSize: 14, padding: '12px 0', lineHeight: '1.6' } },
  { type: 'table', label: 'Data Table', icon: '📊', defaultContent: null, defaultStyle: { padding: '12px 0' }, defaultData: { headers: ['Item', 'Amount'], rows: [['Service', '$0.00'], ['Total', '$0.00']] } },
  { type: 'image', label: 'Image', icon: '🖼️', defaultContent: null, defaultStyle: { padding: '12px 0', textAlign: 'center' } },
  { type: 'divider', label: 'Divider', icon: '➖', defaultContent: null, defaultStyle: { padding: '8px 0' } },
  { type: 'callout', label: 'Callout Box', icon: '💡', defaultContent: 'Important information goes here.', defaultStyle: { fontSize: 13, padding: '14px', background: '#fff3e0', borderRadius: '4px', border: '1px solid #ffe0b2' } },
  { type: 'button', label: 'Button', icon: '🔘', defaultContent: 'Click Here', defaultStyle: { textAlign: 'center', padding: '12px 0' } },
  { type: 'footer', label: 'Footer', icon: '📌', defaultContent: 'Member Services: 1-800-555-0100 | {{portalUrl}}\n© 2026 Insurance Co. All rights reserved.', defaultStyle: { fontSize: 11, color: '#999', textAlign: 'center', padding: '20px', borderTop: '1px solid #eee' } },
  { type: 'signature', label: 'Signature', icon: '✍️', defaultContent: 'Sincerely,\n\nMember Services Team\nInsurance Co.', defaultStyle: { fontSize: 13, padding: '16px 0', lineHeight: '1.6' } },
  { type: 'spacer', label: 'Spacer', icon: '↕️', defaultContent: null, defaultStyle: { height: '24px' } },
]

const presetTemplates = {
  'Welcome Letter': [
    { type: 'header', content: 'Welcome to Your Health Plan', style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', padding: '24px', background: '#f5f5f5' } },
    { type: 'text', content: 'Dear {{memberName}},\n\nWelcome to {{planName}}, effective {{effectiveDate}}. We\'re glad to have you as a member.', style: { fontSize: 14, padding: '16px 0', lineHeight: '1.6' } },
    { type: 'callout', content: 'Your Member ID: {{memberId}}\nGroup Number: {{groupNumber}}', style: { fontSize: 13, padding: '14px', background: '#e3f2fd', borderRadius: '4px', border: '1px solid #bbdefb' } },
    { type: 'text', content: 'What happens next:\n• Your insurance ID card will arrive within 7-10 business days\n• You can access your benefits immediately at our member portal\n• Download our mobile app for easy claims tracking', style: { fontSize: 14, padding: '12px 0', lineHeight: '1.8' } },
    { type: 'button', content: 'Access Your Portal', style: { textAlign: 'center', padding: '16px 0' } },
    { type: 'signature', content: 'Sincerely,\n\nMember Services Team', style: { fontSize: 13, padding: '16px 0', lineHeight: '1.6' } },
    { type: 'footer', content: 'Member Services: 1-800-555-0100 | {{portalUrl}}\n© 2026 Insurance Co.', style: { fontSize: 11, color: '#999', textAlign: 'center', padding: '20px', borderTop: '1px solid #eee' } },
  ],
  'Claim EOB': [
    { type: 'header', content: 'Explanation of Benefits', style: { fontSize: 20, fontWeight: 'bold', textAlign: 'left', padding: '20px', background: '#f5f5f5' } },
    { type: 'text', content: 'Member: {{memberName}}\nMember ID: {{memberId}}\nClaim Number: {{claimNumber}}', style: { fontSize: 13, padding: '12px 0', lineHeight: '1.6', fontFamily: 'monospace' } },
    { type: 'divider', content: null, style: { padding: '4px 0' } },
    { type: 'table', content: null, style: { padding: '12px 0' }, data: { headers: ['Description', 'Amount'], rows: [['Date of Service', '{{serviceDate}}'], ['Provider', '{{providerName}}'], ['Amount Billed', '{{amountBilled}}'], ['Amount Allowed', '{{amountAllowed}}'], ['Your Responsibility', '{{memberOwes}}']] } },
    { type: 'callout', content: 'This is not a bill. Your provider may bill you for the amount shown above.', style: { fontSize: 13, padding: '14px', background: '#fff3e0', borderRadius: '4px', border: '1px solid #ffe0b2' } },
    { type: 'footer', content: 'Questions? Call 1-800-555-0100 or visit {{portalUrl}}', style: { fontSize: 11, color: '#999', textAlign: 'center', padding: '20px', borderTop: '1px solid #eee' } },
  ],
  'Blank': []
}

export default function DragDropDesigner() {
  const [blocks, setBlocks] = useState(presetTemplates['Welcome Letter'].map((b, i) => ({ ...b, id: `b${i}` })))
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [dragIdx, setDragIdx] = useState(null)
  const [preset, setPreset] = useState('Welcome Letter')

  const addBlock = (type) => {
    const bt = blockTypes.find(b => b.type === type)
    const newBlock = {
      id: `b${Date.now()}`,
      type,
      content: bt.defaultContent,
      style: { ...bt.defaultStyle },
      data: bt.defaultData || null
    }
    setBlocks(prev => [...prev, newBlock])
    setSelectedBlock(newBlock.id)
  }

  const removeBlock = (id) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (selectedBlock === id) setSelectedBlock(null)
  }

  const moveBlock = (fromIdx, toIdx) => {
    setBlocks(prev => {
      const arr = [...prev]
      const [item] = arr.splice(fromIdx, 1)
      arr.splice(toIdx, 0, item)
      return arr
    })
  }

  const updateBlock = (id, field, value) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b))
  }

  const updateStyle = (id, prop, value) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, style: { ...b.style, [prop]: value } } : b))
  }

  const loadPreset = (name) => {
    setPreset(name)
    setBlocks(presetTemplates[name].map((b, i) => ({ ...b, id: `b${i}` })))
    setSelectedBlock(null)
  }

  const selBlock = blocks.find(b => b.id === selectedBlock)

  const renderBlock = (block) => {
    switch (block.type) {
      case 'header':
        return <div style={{ ...block.style, whiteSpace: 'pre-wrap' }}>{block.content}</div>
      case 'text':
        return <div style={{ ...block.style, whiteSpace: 'pre-wrap' }}>{block.content}</div>
      case 'callout':
        return <div style={{ ...block.style, whiteSpace: 'pre-wrap' }}>{block.content}</div>
      case 'divider':
        return <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '8px 0' }} />
      case 'spacer':
        return <div style={{ height: block.style.height || '24px' }} />
      case 'image':
        return (
          <div style={{ ...block.style }}>
            <div style={{ border: '2px dashed #ddd', borderRadius: 4, padding: 24, color: '#ccc', textAlign: 'center' }}>🖼️ Image placeholder</div>
          </div>
        )
      case 'button':
        return (
          <div style={{ ...block.style }}>
            <span style={{ display: 'inline-block', padding: '10px 28px', background: '#333', color: '#fff', borderRadius: 4, fontSize: 13 }}>{block.content}</span>
          </div>
        )
      case 'table':
        return (
          <div style={{ ...block.style }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>{block.data?.headers.map((h, i) => <th key={i} style={{ padding: '6px 8px', borderBottom: '2px solid #eee', textAlign: 'left', fontWeight: '600' }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {block.data?.rows.map((row, i) => (
                  <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: '6px 8px', borderBottom: '1px solid #f5f5f5' }}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'footer':
      case 'signature':
        return <div style={{ ...block.style, whiteSpace: 'pre-wrap' }}>{block.content}</div>
      default:
        return <div>{block.content}</div>
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Template Designer</h1>
          <p style={{ color: '#999', fontSize: 13 }}>Drag-and-drop block editor · {blocks.length} blocks</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={preset} onChange={e => loadPreset(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
            {Object.keys(presetTemplates).map(p => <option key={p}>{p}</option>)}
          </select>
          <button style={{ padding: '6px 16px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Save</button>
          <button style={{ padding: '6px 16px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Export HTML</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Block Palette */}
        <div style={{ width: 160, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>Blocks</div>
          {blockTypes.map(bt => (
            <button key={bt.type} onClick={() => addBlock(bt.type)} style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', marginBottom: 4,
              background: '#fff', border: '1px solid #eee', borderRadius: 4, cursor: 'pointer', fontSize: 12, textAlign: 'left'
            }}>
              <span>{bt.icon}</span> {bt.label}
            </button>
          ))}
        </div>

        {/* Canvas */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ border: '1px solid #ddd', borderRadius: 6, background: '#fff', minHeight: 500, padding: 4 }}>
            {blocks.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60, color: '#ccc', fontSize: 13 }}>
                Click blocks on the left to add them here
              </div>
            )}
            {blocks.map((block, idx) => (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(block.id)}
                draggable
                onDragStart={() => setDragIdx(idx)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => { if (dragIdx !== null && dragIdx !== idx) moveBlock(dragIdx, idx); setDragIdx(null); }}
                style={{
                  position: 'relative', cursor: 'grab',
                  outline: selectedBlock === block.id ? '2px solid #333' : '1px dashed transparent',
                  outlineOffset: 2, borderRadius: 4, margin: 2,
                  opacity: dragIdx === idx ? 0.4 : 1
                }}
              >
                {renderBlock(block)}
                {selectedBlock === block.id && (
                  <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: 2 }}>
                    {idx > 0 && <button onClick={e => { e.stopPropagation(); moveBlock(idx, idx - 1) }} style={{ width: 20, height: 20, border: '1px solid #ddd', background: '#fff', borderRadius: 3, cursor: 'pointer', fontSize: 10 }}>↑</button>}
                    {idx < blocks.length - 1 && <button onClick={e => { e.stopPropagation(); moveBlock(idx, idx + 1) }} style={{ width: 20, height: 20, border: '1px solid #ddd', background: '#fff', borderRadius: 3, cursor: 'pointer', fontSize: 10 }}>↓</button>}
                    <button onClick={e => { e.stopPropagation(); removeBlock(block.id) }} style={{ width: 20, height: 20, border: '1px solid #ffcdd2', background: '#ffebee', borderRadius: 3, cursor: 'pointer', fontSize: 10, color: '#c62828' }}>×</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ fontSize: 11, color: '#999', fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' }}>Properties</div>
          {!selBlock && <div style={{ fontSize: 12, color: '#ccc', padding: 8 }}>Select a block to edit</div>}
          {selBlock && (
            <div style={{ border: '1px solid #eee', borderRadius: 6, padding: 12 }}>
              <div style={{ fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                {blockTypes.find(b => b.type === selBlock.type)?.icon} {blockTypes.find(b => b.type === selBlock.type)?.label}
              </div>

              {selBlock.content !== null && (
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontSize: 10, color: '#999' }}>Content</label>
                  <textarea value={selBlock.content} onChange={e => updateBlock(selBlock.id, 'content', e.target.value)} style={{ width: '100%', padding: 6, border: '1px solid #ddd', borderRadius: 3, fontSize: 11, minHeight: 80, resize: 'vertical' }} />
                </div>
              )}

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: '#999' }}>Font Size</label>
                <input type="number" value={parseInt(selBlock.style.fontSize) || 14} onChange={e => updateStyle(selBlock.id, 'fontSize', e.target.value + 'px')} style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 3, fontSize: 11 }} />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: '#999' }}>Alignment</label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['left', 'center', 'right'].map(a => (
                    <button key={a} onClick={() => updateStyle(selBlock.id, 'textAlign', a)} style={{
                      flex: 1, padding: '3px', fontSize: 10, border: '1px solid #ddd', borderRadius: 3,
                      background: selBlock.style.textAlign === a ? '#333' : '#fff', color: selBlock.style.textAlign === a ? '#fff' : '#555', cursor: 'pointer'
                    }}>{a}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: '#999' }}>Background</label>
                <input type="text" value={selBlock.style.background || ''} onChange={e => updateStyle(selBlock.id, 'background', e.target.value)} placeholder="#f5f5f5" style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 3, fontSize: 11 }} />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, color: '#999' }}>Padding</label>
                <input type="text" value={selBlock.style.padding || ''} onChange={e => updateStyle(selBlock.id, 'padding', e.target.value)} placeholder="12px" style={{ width: '100%', padding: 4, border: '1px solid #ddd', borderRadius: 3, fontSize: 11 }} />
              </div>

              <div>
                <label style={{ fontSize: 10, color: '#999' }}>Bold</label>
                <button onClick={() => updateStyle(selBlock.id, 'fontWeight', selBlock.style.fontWeight === 'bold' ? 'normal' : 'bold')} style={{
                  width: '100%', padding: '4px', fontSize: 11, border: '1px solid #ddd', borderRadius: 3,
                  background: selBlock.style.fontWeight === 'bold' ? '#333' : '#fff', color: selBlock.style.fontWeight === 'bold' ? '#fff' : '#555', cursor: 'pointer'
                }}><strong>B</strong> Bold</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
