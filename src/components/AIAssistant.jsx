import { useState, useMemo } from 'react'

const readabilityLevels = [
  { grade: '5th', label: 'Very Easy', color: '#2e7d32', desc: 'Understood by 11-year-olds' },
  { grade: '6th', label: 'Easy', color: '#558b2f', desc: 'Conversational English' },
  { grade: '7th', label: 'Fairly Easy', color: '#9e9d24', desc: 'Understood by most adults' },
  { grade: '8th', label: 'Standard', color: '#f57f17', desc: 'Average reading level' },
  { grade: '9th', label: 'Fairly Difficult', color: '#e65100', desc: 'High school level' },
  { grade: '10th+', label: 'Difficult', color: '#c62828', desc: 'College level — simplify' },
]

const sentimentOptions = ['Friendly', 'Professional', 'Empathetic', 'Urgent', 'Neutral', 'Formal']

const regulatoryChecks = [
  { id: 'appeal', label: 'Appeal Rights Language', pattern: /appeal|right to appeal/i, required: ['Claim Denial Notice'], message: 'Denial notices must include appeal rights and deadline' },
  { id: 'hipaa', label: 'HIPAA Notice', pattern: /hipaa|privacy|protected health/i, required: ['Welcome Letter', 'Explanation of Benefits'], message: 'Should reference HIPAA privacy practices' },
  { id: 'contact', label: 'Contact Information', pattern: /1-800|member services|contact/i, required: ['all'], message: 'All communications should include contact info' },
  { id: 'nondiscrim', label: 'Non-Discrimination Notice', pattern: /non-?discrimination|section 1557|civil rights/i, required: ['Welcome Letter'], message: 'Welcome materials should include non-discrimination notice' },
  { id: 'expiration', label: 'Link Expiration', pattern: /expire|expir/i, required: ['Password Reset Email'], message: 'Password reset emails must state link expiration time' },
]

const complianceBlocks = {
  appeal: '**YOUR RIGHT TO APPEAL**\nYou have the right to appeal this decision within 60 days. Submit your appeal in writing to: Appeals Department, PO Box 12345, or online at {{portalUrl}}/appeals. Include your claim number and any supporting documentation.',
  hipaa: '**PRIVACY NOTICE**\nWe protect your personal health information in accordance with the Health Insurance Portability and Accountability Act (HIPAA). For our full privacy practices, visit {{portalUrl}}/privacy.',
  contact: '**QUESTIONS?**\nContact Member Services at 1-800-555-0100 (Mon-Fri, 8AM-6PM ET) or visit {{portalUrl}}/help.',
  nondiscrim: '**NON-DISCRIMINATION NOTICE**\nWe comply with applicable federal civil rights laws and do not discriminate on the basis of race, color, national origin, age, disability, or sex.',
  expiration: 'This link will expire in {{expirationTime}}. If you did not request this, please contact our security team immediately at 1-800-555-0100.',
}

const aiSuggestions = [
  { trigger: 'denied|denial|not covered', suggestion: 'Consider adding an empathetic opening acknowledging the member\'s frustration before stating the denial.', type: 'tone' },
  { trigger: 'payment|premium|due|bill', suggestion: 'Include a direct link to online payment to reduce call center volume.', type: 'action' },
  { trigger: 'welcome|new member', suggestion: 'Add a brief "What to do first" checklist — members engage more with clear next steps.', type: 'engagement' },
  { trigger: 'claim|eob|benefits', suggestion: 'Use plain dollar amounts and avoid insurance jargon. "You owe" is clearer than "Member responsibility."', type: 'readability' },
]

export default function AIAssistant({ content, templateName }) {
  const [activeTab, setActiveTab] = useState('readability')
  const [targetSentiment, setTargetSentiment] = useState('Professional')

  // Simulate readability score based on content length and word complexity
  const readability = useMemo(() => {
    if (!content) return null
    const words = content.split(/\s+/).length
    const sentences = content.split(/[.!?]+/).filter(Boolean).length
    const avgWordsPerSentence = sentences > 0 ? words / sentences : words
    const longWords = content.split(/\s+/).filter(w => w.length > 6).length
    const complexity = (avgWordsPerSentence * 0.4) + ((longWords / words) * 100 * 0.12)
    const gradeIndex = Math.min(Math.max(Math.floor(complexity / 4) - 1, 0), 5)
    return {
      score: Math.round(100 - complexity),
      level: readabilityLevels[gradeIndex],
      avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
      longWordPercent: ((longWords / words) * 100).toFixed(1),
      wordCount: words,
      sentenceCount: sentences
    }
  }, [content])

  // Sentiment analysis (simulated)
  const sentiment = useMemo(() => {
    if (!content) return null
    const lower = content.toLowerCase()
    const positive = (lower.match(/welcome|thank|pleased|happy|congratulations|appreciate|enjoy/g) || []).length
    const negative = (lower.match(/denied|unfortunately|rejected|failed|unable|sorry|expire|overdue/g) || []).length
    const urgent = (lower.match(/immediate|urgent|important|deadline|required|must/g) || []).length
    const formal = (lower.match(/sincerely|respectfully|pursuant|hereby|accordance|herein/g) || []).length

    const scores = { friendly: positive * 20, professional: 50 + formal * 10, empathetic: positive * 15 + negative * 5, urgent: urgent * 25, neutral: 50, formal: formal * 20 + 30 }
    const dominant = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]

    return {
      dominant: dominant[0].charAt(0).toUpperCase() + dominant[0].slice(1),
      scores,
      positive, negative, urgent, formal,
      matchesTarget: dominant[0].toLowerCase() === targetSentiment.toLowerCase()
    }
  }, [content, targetSentiment])

  // Regulatory compliance checks
  const complianceResults = useMemo(() => {
    if (!content) return []
    return regulatoryChecks.map(check => {
      const applies = check.required.includes('all') || check.required.includes(templateName)
      const found = check.pattern.test(content)
      return { ...check, applies, found, status: !applies ? 'n/a' : found ? 'pass' : 'fail' }
    })
  }, [content, templateName])

  // AI suggestions
  const activeSuggestions = useMemo(() => {
    if (!content) return []
    const lower = content.toLowerCase()
    return aiSuggestions.filter(s => new RegExp(s.trigger).test(lower))
  }, [content])

  const passCount = complianceResults.filter(r => r.status === 'pass').length
  const failCount = complianceResults.filter(r => r.status === 'fail').length
  const applicableCount = complianceResults.filter(r => r.status !== 'n/a').length

  return (
    <div style={{ border: '1px solid #eee', borderRadius: 6, background: '#fafafa' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>🤖</span>
        <span style={{ fontWeight: 'bold', fontSize: 14 }}>AI Assistant</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
        {['readability', 'sentiment', 'compliance', 'suggestions'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '8px', fontSize: 11, border: 'none', borderBottom: activeTab === tab ? '2px solid #333' : '2px solid transparent',
            background: 'transparent', cursor: 'pointer', color: activeTab === tab ? '#333' : '#999', fontWeight: activeTab === tab ? '600' : 'normal',
            textTransform: 'capitalize'
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: 16, maxHeight: 400, overflowY: 'auto' }}>
        {/* Readability Tab */}
        {activeTab === 'readability' && readability && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 'bold', color: readability.level.color }}>{readability.score}</div>
              <div style={{ fontSize: 13, fontWeight: '500' }}>{readability.level.label}</div>
              <div style={{ fontSize: 11, color: '#999' }}>{readability.level.grade} grade · {readability.level.desc}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{readability.avgWordsPerSentence}</div>
                <div style={{ fontSize: 10, color: '#999' }}>Avg words/sentence</div>
              </div>
              <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>{readability.longWordPercent}%</div>
                <div style={{ fontSize: 10, color: '#999' }}>Complex words</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: '#666', background: '#fff', padding: 10, borderRadius: 4, border: '1px solid #eee' }}>
              <strong>Tip:</strong> {parseFloat(readability.avgWordsPerSentence) > 20
                ? 'Sentences are long. Break them up for better readability — aim for 15-20 words per sentence.'
                : parseFloat(readability.longWordPercent) > 25
                  ? 'High percentage of complex words. Replace jargon with plain language where possible.'
                  : 'Readability is good! Content is accessible to most readers.'}
            </div>
          </div>
        )}

        {/* Sentiment Tab */}
        {activeTab === 'sentiment' && sentiment && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Target Sentiment:</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {sentimentOptions.map(s => (
                  <button key={s} onClick={() => setTargetSentiment(s)} style={{
                    padding: '3px 10px', fontSize: 11, border: '1px solid #ddd', borderRadius: 3,
                    background: targetSentiment === s ? '#333' : '#fff', color: targetSentiment === s ? '#fff' : '#555', cursor: 'pointer'
                  }}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: '500' }}>Detected: <strong>{sentiment.dominant}</strong></div>
              <div style={{ fontSize: 12, color: sentiment.matchesTarget ? '#2e7d32' : '#e65100', marginTop: 4 }}>
                {sentiment.matchesTarget ? '✅ Matches target sentiment' : '⚠️ Does not match target — consider adjusting tone'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {[
                { label: 'Positive', count: sentiment.positive, icon: '😊' },
                { label: 'Negative', count: sentiment.negative, icon: '😟' },
                { label: 'Urgent', count: sentiment.urgent, icon: '⚡' },
                { label: 'Formal', count: sentiment.formal, icon: '📋' },
              ].map(s => (
                <div key={s.label} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>{s.count}</div>
                    <div style={{ fontSize: 10, color: '#999' }}>{s.label} signals</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Tab */}
        {activeTab === 'compliance' && (
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <div style={{ flex: 1, background: '#e8f5e9', borderRadius: 4, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#2e7d32' }}>{passCount}</div>
                <div style={{ fontSize: 10, color: '#2e7d32' }}>Passing</div>
              </div>
              <div style={{ flex: 1, background: failCount > 0 ? '#ffebee' : '#f5f5f5', borderRadius: 4, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: failCount > 0 ? '#c62828' : '#999' }}>{failCount}</div>
                <div style={{ fontSize: 10, color: failCount > 0 ? '#c62828' : '#999' }}>Missing</div>
              </div>
              <div style={{ flex: 1, background: '#f5f5f5', borderRadius: 4, padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#999' }}>{complianceResults.length - applicableCount}</div>
                <div style={{ fontSize: 10, color: '#999' }}>N/A</div>
              </div>
            </div>

            {complianceResults.map(r => (
              <div key={r.id} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12 }}>
                    {r.status === 'pass' ? '✅' : r.status === 'fail' ? '❌' : '➖'}
                  </span>
                  <span style={{ fontSize: 12, flex: 1, color: r.status === 'n/a' ? '#ccc' : '#333' }}>{r.label}</span>
                </div>
                {r.status === 'fail' && (
                  <div style={{ marginLeft: 20, marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: '#c62828', marginBottom: 4 }}>{r.message}</div>
                    <button
                      onClick={() => navigator.clipboard.writeText(complianceBlocks[r.id] || '')}
                      style={{ fontSize: 10, padding: '2px 8px', background: '#333', color: '#fff', border: 'none', borderRadius: 3, cursor: 'pointer' }}
                    >
                      📋 Copy compliance block
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div>
            {activeSuggestions.length === 0 && (
              <div style={{ textAlign: 'center', padding: 20, color: '#999', fontSize: 12 }}>No suggestions — content looks good! 👍</div>
            )}
            {activeSuggestions.map((s, i) => (
              <div key={i} style={{ background: '#fff', border: '1px solid #eee', borderRadius: 4, padding: 12, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 3, textTransform: 'uppercase',
                    background: s.type === 'tone' ? '#e3f2fd' : s.type === 'readability' ? '#fff3e0' : s.type === 'engagement' ? '#e8f5e9' : '#f3e5f5',
                    color: s.type === 'tone' ? '#1565c0' : s.type === 'readability' ? '#e65100' : s.type === 'engagement' ? '#2e7d32' : '#7b1fa2'
                  }}>{s.type}</span>
                </div>
                <div style={{ fontSize: 12, color: '#444' }}>{s.suggestion}</div>
              </div>
            ))}

            <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 12 }}>
              <div style={{ fontSize: 11, color: '#999', marginBottom: 6 }}>Quick Actions</div>
              {['Simplify this content', 'Make more empathetic', 'Add urgency', 'Shorten by 20%'].map(action => (
                <button key={action} style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', marginBottom: 4,
                  background: '#fff', border: '1px solid #eee', borderRadius: 4, cursor: 'pointer', fontSize: 12, color: '#555'
                }}>
                  💡 {action}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
