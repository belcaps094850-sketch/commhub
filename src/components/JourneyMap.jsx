import { useState } from 'react'

const journeyStages = [
  { id: 'onboarding', label: 'Onboarding', icon: '🚀', color: '#1565c0' },
  { id: 'active', label: 'Active Member', icon: '💚', color: '#2e7d32' },
  { id: 'claims', label: 'Claims', icon: '📋', color: '#e65100' },
  { id: 'billing', label: 'Billing', icon: '💰', color: '#7b1fa2' },
  { id: 'renewal', label: 'Renewal', icon: '🔄', color: '#00838f' },
]

const touchpoints = [
  { id: 'tp1', stage: 'onboarding', name: 'Registration Confirmation', channel: 'Email', template: 'Registration Confirmation', day: 0, sentiment: 'positive', portal: 'EE Portal' },
  { id: 'tp2', stage: 'onboarding', name: 'Welcome Letter', channel: 'Print', template: 'Welcome Letter', day: 3, sentiment: 'positive', portal: 'EE Portal' },
  { id: 'tp3', stage: 'onboarding', name: 'ID Card Mailed', channel: 'Print', template: 'ID Card Reprint', day: 7, sentiment: 'neutral', portal: 'EE Portal' },
  { id: 'tp4', stage: 'onboarding', name: 'Portal Walkthrough Email', channel: 'Email', template: null, day: 10, sentiment: 'positive', portal: 'EE Portal' },
  { id: 'tp5', stage: 'active', name: 'First Login Prompt', channel: 'Email', template: null, day: 14, sentiment: 'neutral', portal: 'EE Portal' },
  { id: 'tp6', stage: 'active', name: 'Find a Doctor Reminder', channel: 'Email', template: null, day: 30, sentiment: 'positive', portal: 'EE Portal' },
  { id: 'tp7', stage: 'claims', name: 'Claim Received', channel: 'Email', template: null, day: 45, sentiment: 'neutral', portal: 'EE Portal' },
  { id: 'tp8', stage: 'claims', name: 'EOB Sent', channel: 'Print + Email', template: 'Explanation of Benefits', day: 52, sentiment: 'neutral', portal: 'EE Portal' },
  { id: 'tp9', stage: 'claims', name: 'Claim Denied', channel: 'Print + Email', template: 'Claim Denial Notice', day: 52, sentiment: 'negative', portal: 'ER Portal' },
  { id: 'tp10', stage: 'billing', name: 'Premium Due Reminder', channel: 'Email + SMS', template: 'Premium Due Reminder', day: 60, sentiment: 'neutral', portal: 'EE Portal' },
  { id: 'tp11', stage: 'billing', name: 'Payment Confirmation', channel: 'Email', template: null, day: 62, sentiment: 'positive', portal: 'EE Portal' },
  { id: 'tp12', stage: 'billing', name: 'Late Payment Notice', channel: 'Print + Email', template: null, day: 75, sentiment: 'negative', portal: 'EE Portal' },
  { id: 'tp13', stage: 'active', name: 'Password Reset', channel: 'Email', template: 'Password Reset Email', day: 90, sentiment: 'neutral', portal: 'All' },
  { id: 'tp14', stage: 'active', name: 'Annual Benefits Statement', channel: 'Print', template: 'Annual Benefits Statement', day: 365, sentiment: 'positive', portal: 'EE Portal' },
  { id: 'tp15', stage: 'renewal', name: 'Renewal Reminder', channel: 'Email + Print', template: null, day: 330, sentiment: 'neutral', portal: 'EE Portal' },
  { id: 'tp16', stage: 'renewal', name: 'Plan Change Confirmation', channel: 'Email', template: null, day: 350, sentiment: 'positive', portal: 'EE Portal' },
]

const memberJourneys = [
  {
    id: 'mj1', name: 'Sarah Johnson', memberId: 'EE-10042', portal: 'EE Portal', plan: 'Gold PPO', enrolled: '2026-01-01',
    events: [
      { touchpoint: 'tp1', date: '2026-01-01', status: 'delivered' },
      { touchpoint: 'tp2', date: '2026-01-04', status: 'delivered' },
      { touchpoint: 'tp3', date: '2026-01-08', status: 'delivered' },
      { touchpoint: 'tp4', date: '2026-01-11', status: 'delivered' },
      { touchpoint: 'tp5', date: '2026-01-15', status: 'delivered' },
      { touchpoint: 'tp6', date: '2026-01-31', status: 'delivered' },
      { touchpoint: 'tp7', date: '2026-02-14', status: 'delivered' },
      { touchpoint: 'tp8', date: '2026-03-01', status: 'delivered' },
      { touchpoint: 'tp10', date: '2026-02-20', status: 'delivered' },
      { touchpoint: 'tp11', date: '2026-02-22', status: 'delivered' },
    ]
  },
  {
    id: 'mj2', name: 'Lisa Rodriguez', memberId: 'ER-20015', portal: 'ER Portal', plan: 'Enterprise', enrolled: '2025-07-01',
    events: [
      { touchpoint: 'tp1', date: '2025-07-01', status: 'delivered' },
      { touchpoint: 'tp2', date: '2025-07-04', status: 'delivered' },
      { touchpoint: 'tp9', date: '2026-03-06', status: 'delivered' },
    ]
  },
  {
    id: 'mj3', name: 'Emily Davis', memberId: 'OS-40033', portal: 'GI OSGLI', plan: 'OSGLI Standard', enrolled: '2026-03-09',
    events: [
      { touchpoint: 'tp1', date: '2026-03-09', status: 'delivered' },
    ]
  }
]

const sentimentEmoji = { positive: '😊', neutral: '😐', negative: '😟' }
const sentimentColor = { positive: '#2e7d32', neutral: '#666', negative: '#c62828' }

export default function JourneyMap() {
  const [view, setView] = useState('blueprint')
  const [selectedStage, setSelectedStage] = useState(null)
  const [selectedMember, setSelectedMember] = useState(null)
  const [portalFilter, setPortalFilter] = useState('All')

  const filteredTouchpoints = portalFilter === 'All' ? touchpoints : touchpoints.filter(t => t.portal === portalFilter || t.portal === 'All')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 'bold' }}>Customer Journey Map</h1>
          <p style={{ color: '#999', fontSize: 13 }}>Visualize the member communication lifecycle</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['blueprint', 'member'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 16px', fontSize: 12, border: '1px solid #ddd', borderRadius: 4,
              background: view === v ? '#333' : '#fff', color: view === v ? '#fff' : '#555',
              cursor: 'pointer', textTransform: 'capitalize'
            }}>{v === 'blueprint' ? 'Journey Blueprint' : 'Member Journeys'}</button>
          ))}
        </div>
      </div>

      {/* Blueprint View */}
      {view === 'blueprint' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {['All', 'EE Portal', 'ER Portal', 'GI Commissions', 'GI OSGLI'].map(p => (
              <button key={p} onClick={() => setPortalFilter(p)} style={{
                padding: '4px 12px', fontSize: 11, border: '1px solid #ddd', borderRadius: 4,
                background: portalFilter === p ? '#333' : '#fff', color: portalFilter === p ? '#fff' : '#555', cursor: 'pointer'
              }}>{p}</button>
            ))}
          </div>

          {/* Stage Timeline */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 8 }}>
            {journeyStages.map((stage, i) => (
              <div key={stage.id} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                <div
                  onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
                  style={{
                    padding: '12px 8px', cursor: 'pointer', borderRadius: 6,
                    background: selectedStage === stage.id ? stage.color : '#f5f5f5',
                    color: selectedStage === stage.id ? '#fff' : '#333',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: 20 }}>{stage.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: '600', marginTop: 4 }}>{stage.label}</div>
                  <div style={{ fontSize: 10, opacity: 0.7 }}>
                    {filteredTouchpoints.filter(t => t.stage === stage.id).length} touchpoints
                  </div>
                </div>
                {i < journeyStages.length - 1 && (
                  <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', color: '#ccc', fontSize: 16, zIndex: 1 }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Touchpoints for selected stage (or all) */}
          <div style={{ marginTop: 20 }}>
            {(selectedStage ? journeyStages.filter(s => s.id === selectedStage) : journeyStages).map(stage => {
              const stageTouchpoints = filteredTouchpoints.filter(t => t.stage === stage.id)
              if (stageTouchpoints.length === 0) return null
              return (
                <div key={stage.id} style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{stage.icon}</span> {stage.label}
                    <span style={{ fontWeight: 'normal', fontSize: 12, color: '#999' }}>({stageTouchpoints.length} touchpoints)</span>
                  </h3>
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
                    {stageTouchpoints.sort((a, b) => a.day - b.day).map(tp => (
                      <div key={tp.id} style={{
                        minWidth: 200, border: '1px solid #eee', borderRadius: 6, padding: 14,
                        borderTop: `3px solid ${stage.color}`, background: '#fff', flexShrink: 0
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: '500' }}>{tp.name}</span>
                          <span style={{ fontSize: 14 }}>{sentimentEmoji[tp.sentiment]}</span>
                        </div>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>📬 {tp.channel}</div>
                        <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>⏱️ Day {tp.day}</div>
                        {tp.template && (
                          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>📄 {tp.template}</div>
                        )}
                        <div style={{ fontSize: 11, color: '#bbb' }}>{tp.portal}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Sentiment Journey Line */}
          <div style={{ marginTop: 20, border: '1px solid #eee', borderRadius: 6, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Sentiment Journey</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto' }}>
              {filteredTouchpoints.sort((a, b) => a.day - b.day).map((tp, i) => (
                <div key={tp.id} style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }} title={`Day ${tp.day}: ${tp.name}`}>
                    <div style={{ fontSize: 16 }}>{sentimentEmoji[tp.sentiment]}</div>
                    <div style={{ fontSize: 9, color: '#bbb', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tp.name}</div>
                    <div style={{ fontSize: 9, color: sentimentColor[tp.sentiment] }}>Day {tp.day}</div>
                  </div>
                  {i < filteredTouchpoints.length - 1 && <span style={{ color: '#ddd', fontSize: 10 }}>—</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Member Journey View */}
      {view === 'member' && (
        <div>
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ width: 280 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>Select a member</div>
              {memberJourneys.map(m => (
                <div key={m.id} onClick={() => setSelectedMember(m)} style={{
                  padding: '12px 14px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                  background: selectedMember?.id === m.id ? '#f9f9f9' : '#fff'
                }}>
                  <div style={{ fontWeight: '500', fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{m.memberId} · {m.portal}</div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>{m.events.length} touchpoints completed</div>
                </div>
              ))}
            </div>

            {selectedMember && (
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 'bold' }}>{selectedMember.name}</h3>
                  <div style={{ fontSize: 13, color: '#888' }}>{selectedMember.memberId} · {selectedMember.portal} · {selectedMember.plan} · Enrolled {selectedMember.enrolled}</div>
                </div>

                {/* Progress across stages */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {journeyStages.map(stage => {
                    const stageEvents = selectedMember.events.filter(e => {
                      const tp = touchpoints.find(t => t.id === e.touchpoint)
                      return tp?.stage === stage.id
                    })
                    const totalInStage = touchpoints.filter(t => t.stage === stage.id).length
                    return (
                      <div key={stage.id} style={{ flex: 1, border: '1px solid #eee', borderRadius: 4, padding: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: 14 }}>{stage.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: '500' }}>{stage.label}</div>
                        <div style={{ fontSize: 18, fontWeight: 'bold', color: stageEvents.length > 0 ? stage.color : '#ddd' }}>
                          {stageEvents.length}/{totalInStage}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Timeline */}
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12 }}>Communication Timeline</h4>
                  {selectedMember.events.sort((a, b) => a.date.localeCompare(b.date)).map((event, i) => {
                    const tp = touchpoints.find(t => t.id === event.touchpoint)
                    if (!tp) return null
                    const stage = journeyStages.find(s => s.id === tp.stage)
                    return (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                        <div style={{ width: 90, fontSize: 12, color: '#999', flexShrink: 0 }}>{event.date}</div>
                        <div style={{ width: 3, background: stage?.color || '#eee', borderRadius: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: '500' }}>{tp.name}</div>
                          <div style={{ fontSize: 11, color: '#888' }}>
                            {tp.channel} · {stage?.label}
                            {tp.template && ` · Template: ${tp.template}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 14 }}>{sentimentEmoji[tp.sentiment]}</span>
                          <span style={{ fontSize: 11, padding: '2px 6px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 3 }}>
                            {event.status}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
