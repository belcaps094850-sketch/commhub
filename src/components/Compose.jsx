import { useState } from 'react'
import { templates } from '../data/sampleData'

export default function Compose({ onNavigate }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    template: '',
    portal: '',
    channel: '',
    sendDate: '',
    sendTime: '',
    recipientSource: 'all',
    recipientFile: '',
    testEmail: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const activeTemplates = templates.filter(t => t.status === 'Active')
  const selectedTemplate = activeTemplates.find(t => t.id === form.template)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const handleSubmit = () => {
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setStep(1)
      setForm({ name: '', template: '', portal: '', channel: '', sendDate: '', sendTime: '', recipientSource: 'all', recipientFile: '', testEmail: '' })
    }, 3000)
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 8 }}>Communication Scheduled</h2>
        <p style={{ color: '#666', fontSize: 14 }}>"{form.name}" has been queued for {form.sendDate} at {form.sendTime}</p>
        <button
          onClick={() => onNavigate('communications')}
          style={{ marginTop: 20, padding: '8px 20px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
        >
          View Communications
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>Compose Communication</h1>
      <p style={{ color: '#999', fontSize: 13, marginBottom: 24 }}>Create and schedule a new batch communication</p>

      {/* Steps */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28 }}>
        {['Template & Details', 'Recipients', 'Schedule & Send'].map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', margin: '0 auto 6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold',
              background: step > i + 1 ? '#333' : step === i + 1 ? '#333' : '#eee',
              color: step >= i + 1 ? '#fff' : '#999'
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <div style={{ fontSize: 12, color: step === i + 1 ? '#333' : '#999' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Communication Name</label>
            <input
              value={form.name}
              onChange={e => update('name', e.target.value)}
              placeholder="e.g., March EOB Batch — EE Portal"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Template</label>
            <select
              value={form.template}
              onChange={e => update('template', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, background: '#fff' }}
            >
              <option value="">Select a template...</option>
              {activeTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name} (v{t.version})</option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 4, padding: 12, marginBottom: 16, fontSize: 12 }}>
              <div style={{ color: '#666', marginBottom: 4 }}>{selectedTemplate.description}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                {selectedTemplate.variables.map(v => (
                  <span key={v} style={{ padding: '2px 6px', background: '#fff', border: '1px solid #eee', borderRadius: 3, fontFamily: 'monospace', fontSize: 11 }}>
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Portal</label>
            <select
              value={form.portal}
              onChange={e => update('portal', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13, background: '#fff' }}
            >
              <option value="">Select portal...</option>
              <option>EE Portal</option>
              <option>ER Portal</option>
              <option>GI Commissions</option>
              <option>GI OSGLI</option>
            </select>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Channel</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['Email', 'Print', 'Email + Print', 'Email + SMS'].map(ch => (
                <button
                  key={ch}
                  onClick={() => update('channel', ch)}
                  style={{
                    padding: '6px 14px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
                    background: form.channel === ch ? '#333' : '#fff', color: form.channel === ch ? '#fff' : '#555', cursor: 'pointer'
                  }}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => step < 3 && setStep(2)}
            disabled={!form.name || !form.template || !form.portal || !form.channel}
            style={{
              padding: '8px 24px', background: form.name && form.template && form.portal && form.channel ? '#333' : '#ccc',
              color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13
            }}
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 8 }}>Recipient Source</label>
            {['all', 'segment', 'upload'].map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="recipientSource"
                  checked={form.recipientSource === opt}
                  onChange={() => update('recipientSource', opt)}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: '500' }}>
                    {opt === 'all' ? 'All Members' : opt === 'segment' ? 'By Segment' : 'Upload CSV'}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {opt === 'all' ? `All active members in ${form.portal}` : opt === 'segment' ? 'Filter by plan, status, region, etc.' : 'Upload a recipient list (CSV/XLSX)'}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {form.recipientSource === 'upload' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Upload File</label>
              <div style={{ border: '2px dashed #ddd', borderRadius: 4, padding: 24, textAlign: 'center', color: '#999', fontSize: 13 }}>
                Drag & drop CSV/XLSX here, or click to browse
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Test Email (optional)</label>
            <input
              value={form.testEmail}
              onChange={e => update('testEmail', e.target.value)}
              placeholder="your@email.com"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
            />
            <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>Send a preview to this address before batch send</div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(1)} style={{ padding: '8px 24px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
              ← Back
            </button>
            <button onClick={() => setStep(3)} style={{ padding: '8px 24px', background: '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Send Date</label>
            <input
              type="date"
              value={form.sendDate}
              onChange={e => update('sendDate', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Send Time</label>
            <input
              type="time"
              value={form.sendTime}
              onChange={e => update('sendTime', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, fontSize: 13 }}
            />
          </div>

          {/* Summary */}
          <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 6, padding: 16, marginBottom: 20, fontSize: 13 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 10 }}>Summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#999' }}>Name</span><span>{form.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#999' }}>Template</span><span>{selectedTemplate?.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#999' }}>Portal</span><span>{form.portal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#999' }}>Channel</span><span>{form.channel}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#999' }}>Recipients</span><span>{form.recipientSource === 'all' ? 'All members' : form.recipientSource === 'segment' ? 'By segment' : 'CSV upload'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ color: '#999' }}>Scheduled</span><span>{form.sendDate} {form.sendTime}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setStep(2)} style={{ padding: '8px 24px', background: '#fff', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.sendDate || !form.sendTime}
              style={{
                padding: '8px 24px', background: form.sendDate && form.sendTime ? '#333' : '#ccc',
                color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13
              }}
            >
              Schedule Communication
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
