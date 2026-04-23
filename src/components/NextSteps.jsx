const tracks = [
  {
    id: 'A',
    label: 'Track A — Frontend Polish',
    subtitle: 'Quick wins, high demo value',
    color: '#0052CC',
    bg: '#DEEBFF',
    items: [
      {
        priority: 1,
        title: 'AI Content Assistant (Real API)',
        desc: 'Connect Claude API for real content suggestions, readability scoring, and compliance checking inside the Template Editor.',
        est: '2–3 hrs',
        impact: 'High',
        status: 'planned',
      },
      {
        priority: 2,
        title: 'Drag-Drop Designer → Save',
        desc: 'Wire the drag-and-drop block editor so layouts actually persist to the template store.',
        est: '2 hrs',
        impact: 'Medium',
        status: 'planned',
      },
      {
        priority: 3,
        title: 'Compose → Communications',
        desc: 'Wire the 3-step Compose wizard so submitted communications appear in the Communications list with correct status.',
        est: '1 hr',
        impact: 'Medium',
        status: 'planned',
      },
      {
        priority: 4,
        title: 'Role-Based UI Enforcement',
        desc: 'Consistently hide/disable actions based on currentRole across all pages (editors, delete buttons, approve actions).',
        est: '1 hr',
        impact: 'Medium',
        status: 'planned',
      },
      {
        priority: 5,
        title: 'Custom Domain',
        desc: 'Connect commhub.bebelcapistrano.com via AWS Amplify custom domain settings.',
        est: '30 min',
        impact: 'Low',
        status: 'planned',
      },
    ],
  },
  {
    id: 'B',
    label: 'Track B — Real Backend',
    subtitle: 'Production-ready infrastructure',
    color: '#00875A',
    bg: '#E3FCEF',
    items: [
      {
        priority: 1,
        title: 'Open Liberty REST API',
        desc: 'Replace localStorage with real Jakarta EE REST endpoints. CRUD for templates, communications, recipients.',
        est: '1 week',
        impact: 'High',
        status: 'planned',
      },
      {
        priority: 2,
        title: 'PostgreSQL Database',
        desc: '24-table schema per architecture doc. Templates, versioning, communications, recipients, audit trail, approvals.',
        est: '3 days',
        impact: 'High',
        status: 'planned',
      },
      {
        priority: 3,
        title: 'Keycloak Authentication',
        desc: 'Replace the role switcher with real OIDC/JWT auth via Keycloak. Role-based access enforced server-side.',
        est: '2 days',
        impact: 'High',
        status: 'planned',
      },
      {
        priority: 4,
        title: 'Async Delivery Engine',
        desc: 'Kafka + consumer workers for async communication send. Per-recipient status tracking, retry logic, dead letter queue.',
        est: '1 week',
        impact: 'High',
        status: 'planned',
      },
      {
        priority: 5,
        title: 'AWS ECS Deployment',
        desc: 'Dockerize the Open Liberty backend and deploy to ECS. Connect to Amplify frontend via API Gateway.',
        est: '2 days',
        impact: 'Medium',
        status: 'planned',
      },
    ],
  },
]

const impactColors = {
  High: { bg: '#FFEBE6', text: '#BF2600' },
  Medium: { bg: '#FFFAE6', text: '#974F0C' },
  Low: { bg: '#E3FCEF', text: '#006644' },
}

const statusColors = {
  planned: { bg: '#F4F5F7', text: '#5E6C84' },
  'in-progress': { bg: '#DEEBFF', text: '#0052CC' },
  done: { bg: '#E3FCEF', text: '#006644' },
}

export default function NextSteps() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#172B4D' }}>Next Steps</h2>
        <p style={{ margin: '6px 0 0', color: '#5E6C84', fontSize: 14 }}>
          Planned improvements and backend integration roadmap for CommHub.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Track A Items', value: tracks[0].items.length, color: '#0052CC', bg: '#DEEBFF' },
          { label: 'Track B Items', value: tracks[1].items.length, color: '#00875A', bg: '#E3FCEF' },
          { label: 'Total Planned', value: tracks.reduce((a, t) => a + t.items.length, 0), color: '#172B4D', bg: '#F4F5F7' },
        ].map((c) => (
          <div key={c.label} style={{
            background: c.bg, borderRadius: 8, padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 4
          }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: c.color }}>{c.value}</span>
            <span style={{ fontSize: 13, color: '#5E6C84' }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* Recommendation banner */}
      <div style={{
        background: '#FFFAE6', border: '1px solid #FFD700', borderRadius: 8,
        padding: '14px 20px', marginBottom: 28, display: 'flex', alignItems: 'flex-start', gap: 12
      }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div>
          <div style={{ fontWeight: 600, color: '#172B4D', marginBottom: 4 }}>Recommended Starting Point</div>
          <div style={{ fontSize: 13, color: '#5E6C84', lineHeight: 1.6 }}>
            Start with <strong>Track A — AI Content Assistant</strong>. Connecting Claude API for real compliance checking
            and content suggestions makes this a standout demo for stakeholders. Then proceed to Track B backend integration
            aligned with your PI planning cycles.
          </div>
        </div>
      </div>

      {/* Tracks */}
      {tracks.map((track) => (
        <div key={track.id} style={{ marginBottom: 36 }}>
          {/* Track header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
            paddingBottom: 12, borderBottom: `2px solid ${track.color}`
          }}>
            <div style={{
              background: track.color, color: '#fff', borderRadius: 6,
              padding: '4px 12px', fontWeight: 700, fontSize: 13
            }}>
              {track.id}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#172B4D', fontSize: 16 }}>{track.label}</div>
              <div style={{ fontSize: 12, color: '#5E6C84' }}>{track.subtitle}</div>
            </div>
          </div>

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {track.items.map((item) => (
              <div key={item.priority} style={{
                background: '#fff', border: '1px solid #DFE1E6', borderRadius: 8,
                padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start'
              }}>
                {/* Priority badge */}
                <div style={{
                  minWidth: 32, height: 32, borderRadius: '50%',
                  background: track.bg, color: track.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, flexShrink: 0
                }}>
                  {item.priority}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: '#172B4D', fontSize: 14 }}>{item.title}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: impactColors[item.impact].bg, color: impactColors[item.impact].text
                    }}>
                      {item.impact} impact
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: statusColors[item.status].bg, color: statusColors[item.status].text
                    }}>
                      {item.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#5E6C84', lineHeight: 1.6 }}>{item.desc}</div>
                </div>

                {/* Est */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 11, color: '#97A0AF' }}>Est.</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{item.est}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Architecture note */}
      <div style={{
        background: '#F4F5F7', borderRadius: 8, padding: '16px 20px',
        border: '1px solid #DFE1E6', marginTop: 8
      }}>
        <div style={{ fontWeight: 600, color: '#172B4D', marginBottom: 8, fontSize: 14 }}>📐 Architecture Reference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {[
            ['Frontend', 'React + Vite + React Router'],
            ['State (prod)', 'Zustand → PostgreSQL via API'],
            ['Backend', 'Open Liberty (Jakarta EE 10)'],
            ['Auth', 'Keycloak (OIDC/SAML/JWT)'],
            ['Database', 'PostgreSQL + JSONB'],
            ['Queue', 'Apache Kafka'],
            ['Cache', 'Redis'],
            ['AI', 'Claude API (Anthropic)'],
            ['Storage', 'AWS S3'],
            ['Deploy', 'AWS ECS + Amplify'],
          ].map(([k, v]) => (
            <div key={k} style={{ fontSize: 13 }}>
              <span style={{ color: '#5E6C84' }}>{k}: </span>
              <span style={{ color: '#172B4D', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
