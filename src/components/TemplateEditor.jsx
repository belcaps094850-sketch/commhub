import { useState, useMemo } from 'react'
import AIAssistant from './AIAssistant'

const defaultContent = `Dear {{memberName}},

This letter is to confirm your enrollment in the {{planName}} plan, effective {{effectiveDate}}.

Your Member ID: {{memberId}}
Group Number: {{groupNumber}}

What happens next:
• Your insurance ID card will arrive within 7-10 business days
• You can access your benefits immediately at our member portal
• Download our mobile app for easy claims tracking

If you have questions about your coverage, contact Member Services at 1-800-555-0100 or visit our self-service portal.

Welcome to your new health plan.

Sincerely,
Member Services Team`

const sampleVars = {
  memberName: 'Sarah Johnson',
  planName: 'Gold PPO',
  effectiveDate: 'April 1, 2026',
  memberId: 'EE-10042',
  groupNumber: 'GRP-7890',
  claimNumber: 'CLM-2026-00145',
  serviceDate: 'February 15, 2026',
  providerName: 'Dr. Michael Chen',
  amountBilled: '$1,250.00',
  amountAllowed: '$980.00',
  memberOwes: '$196.00',
  denialReason: 'Service not covered under current plan',
  appealDeadline: 'May 1, 2026',
  resetLink: 'https://portal.example.com/reset/abc123',
  expirationTime: '24 hours',
  portalUrl: 'https://portal.example.com',
  username: 'sjohnson42',
  planYear: '2025',
  totalClaims: '$4,580.00',
  deductibleUsed: '$1,500 of $2,000',
  oopUsed: '$3,200 of $6,000',
  amountDue: '$425.00',
  dueDate: 'March 20, 2026',
  paymentUrl: 'https://portal.example.com/pay',
  pcpName: 'Dr. Lisa Rodriguez'
}

const templatePresets = [
  { name: 'Welcome Letter', content: defaultContent },
  {
    name: 'Explanation of Benefits', content: `EXPLANATION OF BENEFITS

Member: {{memberName}}
Member ID: {{memberId}}
Claim Number: {{claimNumber}}

Service Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Date of Service: {{serviceDate}}
Provider: {{providerName}}

Amount Billed:    {{amountBilled}}
Amount Allowed:   {{amountAllowed}}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESPONSIBILITY: {{memberOwes}}

This is not a bill. Your provider may bill you for the amount shown above.

Questions? Call Member Services at 1-800-555-0100
View all claims at {{portalUrl}}`
  },
  {
    name: 'Claim Denial Notice', content: `IMPORTANT: CLAIM DENIAL NOTICE

Dear {{memberName}},

We have completed our review of your claim and unfortunately, the following claim has been denied:

Claim Number: {{claimNumber}}
Date of Service: {{serviceDate}}
Provider: {{providerName}}

Reason for Denial:
{{denialReason}}

YOUR RIGHT TO APPEAL
You have the right to appeal this decision. To file an appeal:

1. Submit your appeal in writing by {{appealDeadline}}
2. Include any additional medical records or documentation
3. Mail to: Appeals Department, PO Box 12345
4. Or submit online at {{portalUrl}}/appeals

If you have questions about this denial or the appeals process, please contact Member Services at 1-800-555-0100.

Sincerely,
Claims Review Department`
  },
  {
    name: 'Password Reset', content: `Hi {{memberName}},

We received a request to reset your password for your member portal account.

Click the link below to create a new password:
{{resetLink}}

This link will expire in {{expirationTime}}.

If you did not request this password reset, please ignore this email or contact support immediately at 1-800-555-0100.

— Member Portal Security Team`
  },
  {
    name: 'Premium Due Reminder', content: `Dear {{memberName}},

This is a reminder that your premium payment is due:

Amount Due: {{amountDue}}
Due Date: {{dueDate}}

Pay online: {{paymentUrl}}

To avoid a lapse in coverage, please submit your payment by the due date.

Payment options:
• Online at {{paymentUrl}}
• Phone: 1-800-555-0100
• Mail: Payment Processing, PO Box 54321

Thank you,
Billing Department`
  }
]

export default function TemplateEditor({ onBack }) {
  const [content, setContent] = useState(defaultContent)
  const [selectedPreset, setSelectedPreset] = useState('Welcome Letter')
  const [vars, setVars] = useState({ ...sampleVars })
  const [showVars, setShowVars] = useState(true)
  const [format, setFormat] = useState('letter')
  const [fontSize, setFontSize] = useState(13)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIdx, setHistoryIdx] = useState(-1)

  const detectedVars = useMemo(() => {
    const matches = content.match(/\{\{(\w+)\}\}/g) || []
    return [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
  }, [content])

  const preview = useMemo(() => {
    let result = content
    Object.entries(vars).forEach(([key, val]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val)
    })
    return result
  }, [content, vars])

  const loadPreset = (name) => {
    const preset = templatePresets.find(p => p.name === name)
    if (preset) {
      pushHistory()
      setContent(preset.content)
      setSelectedPreset(name)
    }
  }

  const pushHistory = () => {
    setHistory(prev => [...prev.slice(0, historyIdx + 1), content])
    setHistoryIdx(prev => prev + 1)
  }

  const undo = () => {
    if (historyIdx >= 0) {
      setContent(history[historyIdx])
      setHistoryIdx(prev => prev - 1)
    }
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleContentChange = (e) => {
    pushHistory()
    setContent(e.target.value)
  }

  const wordCount = content.trim().split(/\s+/).length
  const charCount = content.length

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#999' }}>←</button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Template Editor</h1>
            <p style={{ color: '#999', fontSize: 13 }}>Edit content and preview with sample data</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={undo} disabled={historyIdx < 0} style={{ padding: '6px 12px', background: '#fff', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: historyIdx < 0 ? '#ccc' : '#333' }}>
            ↩ Undo
          </button>
          <button onClick={handleSave} style={{ padding: '6px 16px', background: saved ? '#2e7d32' : '#333', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            {saved ? '✓ Saved' : 'Save Template'}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#999' }}>Preset:</label>
          <select value={selectedPreset} onChange={e => loadPreset(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: 4, fontSize: 12, background: '#fff' }}>
            {templatePresets.map(p => <option key={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#999' }}>Format:</label>
          {['letter', 'email', 'sms'].map(f => (
            <button key={f} onClick={() => setFormat(f)} style={{
              padding: '3px 10px', fontSize: 11, border: '1px solid #ddd', borderRadius: 3,
              background: format === f ? '#333' : '#fff', color: format === f ? '#fff' : '#555', cursor: 'pointer', textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <label style={{ fontSize: 12, color: '#999' }}>Size:</label>
          <input type="range" min={11} max={18} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: 80 }} />
          <span style={{ fontSize: 11, color: '#999' }}>{fontSize}px</span>
        </div>
        <button onClick={() => setShowVars(!showVars)} style={{ padding: '3px 10px', fontSize: 11, border: '1px solid #ddd', borderRadius: 3, background: showVars ? '#333' : '#fff', color: showVars ? '#fff' : '#555', cursor: 'pointer' }}>
          {showVars ? 'Hide' : 'Show'} Variables
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#bbb' }}>
          {wordCount} words · {charCount} chars
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {/* Editor Column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: '600' }}>EDIT</div>
          <textarea
            value={content}
            onChange={handleContentChange}
            style={{
              width: '100%',
              minHeight: 480,
              padding: 16,
              border: '1px solid #ddd',
              borderRadius: 6,
              fontFamily: 'monospace',
              fontSize: fontSize - 1,
              lineHeight: 1.6,
              resize: 'vertical',
              outline: 'none'
            }}
          />

          {/* Detected Variables */}
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Detected variables ({detectedVars.length}):</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {detectedVars.map(v => (
                <span
                  key={v}
                  style={{
                    fontSize: 11, padding: '2px 8px', borderRadius: 3, fontFamily: 'monospace', cursor: 'pointer',
                    background: vars[v] ? '#e8f5e9' : '#ffebee',
                    color: vars[v] ? '#2e7d32' : '#c62828',
                    border: `1px solid ${vars[v] ? '#c8e6c9' : '#ffcdd2'}`
                  }}
                  title={vars[v] || 'No sample value set'}
                >
                  {`{{${v}}}`} {vars[v] ? '✓' : '⚠'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Preview Column */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#999', marginBottom: 6, fontWeight: '600' }}>PREVIEW</div>
          <div style={{
            minHeight: 480,
            padding: format === 'email' ? '20px 24px' : format === 'sms' ? '16px' : '40px 48px',
            border: '1px solid #ddd',
            borderRadius: 6,
            background: format === 'sms' ? '#e8f5e9' : '#fff',
            fontSize: fontSize,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            fontFamily: format === 'sms' ? 'Arial, sans-serif' : format === 'email' ? 'Arial, sans-serif' : 'Georgia, serif',
            maxWidth: format === 'sms' ? 320 : 'none',
            boxShadow: format === 'letter' ? '0 1px 4px rgba(0,0,0,0.06)' : 'none'
          }}>
            {format === 'email' && (
              <div style={{ borderBottom: '1px solid #eee', paddingBottom: 12, marginBottom: 16, fontFamily: 'Arial', fontSize: 12 }}>
                <div><strong>From:</strong> noreply@memberservices.com</div>
                <div><strong>To:</strong> {vars.memberName ? `${vars.memberName.toLowerCase().replace(' ', '.')}@email.com` : 'member@email.com'}</div>
                <div><strong>Subject:</strong> {selectedPreset}</div>
              </div>
            )}
            {format === 'sms' && (
              <div style={{ fontSize: 11, color: '#666', marginBottom: 8, textAlign: 'center' }}>
                SMS Preview ({preview.length}/160 chars {preview.length > 160 ? `— ${Math.ceil(preview.length / 160)} segments` : ''})
              </div>
            )}
            {preview}
          </div>
        </div>
      </div>

      {/* AI Assistant Panel */}
      <div style={{ marginTop: 20 }}>
        <AIAssistant content={content} templateName={selectedPreset} />
      </div>

      {/* Variable Editor Panel */}
      {showVars && detectedVars.length > 0 && (
        <div style={{ marginTop: 20, border: '1px solid #eee', borderRadius: 6, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 12 }}>Sample Variable Values</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {detectedVars.map(v => (
              <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ fontSize: 11, fontFamily: 'monospace', color: '#666', width: 130, flexShrink: 0 }}>{`{{${v}}}`}</label>
                <input
                  value={vars[v] || ''}
                  onChange={e => setVars(prev => ({ ...prev, [v]: e.target.value }))}
                  placeholder="Enter sample value..."
                  style={{ flex: 1, padding: '4px 8px', border: '1px solid #ddd', borderRadius: 3, fontSize: 12 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
