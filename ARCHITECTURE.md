# CommHub — Production Architecture Blueprint

> Transforming the prototype (React + localStorage) into a production-ready enterprise CCM platform.

---

## Overall Stack Recommendation

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React + Vite + React Router | Already built, add routing |
| State | Zustand (replace useStore/Context) | Simpler than Redux, middleware support, devtools |
| API Layer | Open Liberty (Jakarta EE 10) | Already scaffolded, enterprise-grade, JPA built-in |
| Database | PostgreSQL | ACID, JSONB for flexible schemas, full-text search |
| Auth | Keycloak or Auth0 | OIDC/SAML, role mapping, SSO |
| File Storage | S3 (or MinIO self-hosted) | Templates, attachments, generated documents |
| Queue | Apache Kafka or RabbitMQ | Async communication delivery, event sourcing |
| Cache | Redis | Sessions, rate limiting, real-time notifications |
| Search | PostgreSQL full-text (start), Elasticsearch (scale) | Archive search, audit log queries |
| Email/SMS | SendGrid + Twilio | Multi-channel delivery |
| AI | OpenAI API / Claude API | Content assistant, compliance checking |
| Monitoring | MicroProfile Metrics + Grafana | Built into Liberty |

---

## Feature-by-Feature Architecture

### 1. Dashboard (Customizable Widgets)

**Current:** Static widget grid, localStorage for layout.

**Production Architecture:**
```
┌─ Frontend ──────────────────────────────┐
│ React-Grid-Layout (drag/resize)         │
│ Widget registry (pluggable components)  │
│ WebSocket for real-time metric updates  │
└─────────┬───────────────────────────────┘
          │ REST + WebSocket
┌─────────▼───────────────────────────────┐
│ GET /api/dashboard/config               │
│ PUT /api/dashboard/config               │
│ WS  /api/dashboard/stream              │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────────────────────────────┐
│ dashboard_configs table (user_id, JSON) │
│ Materialized views for aggregations     │
│ Redis pub/sub for live widget updates   │
└─────────────────────────────────────────┘
```

**Key decisions:**
- Widget config stored as JSONB per user
- Aggregation queries run against materialized views (refresh on schedule, not per request)
- WebSocket pushes metric changes (new comms sent, approval status changes)
- Widget types registered in a plugin map — easy to add new ones

**API Endpoints:**
- `GET /api/dashboard/config` — user's widget layout
- `PUT /api/dashboard/config` — save layout
- `GET /api/dashboard/metrics` — aggregated stats
- `WS /api/dashboard/stream` — real-time updates

---

### 2. Templates (CRUD + Versioning)

**Current:** In-memory array, no versioning.

**Production Architecture:**
```
┌─ Tables ────────────────────────────────┐
│ templates                               │
│   id, name, channel, category,          │
│   status (draft/active/archived),       │
│   created_by, created_at, updated_at    │
│                                         │
│ template_versions                       │
│   id, template_id, version_number,      │
│   content (JSONB), variables (JSONB),   │
│   created_by, created_at, change_note   │
│                                         │
│ template_categories                     │
│   id, name, description                 │
└─────────────────────────────────────────┘
```

**Key decisions:**
- Every save creates a new version (immutable history)
- `content` is JSONB — stores the block structure from the drag-drop designer
- Variables extracted and stored separately for validation
- Soft-delete only (archived status, never hard delete)
- Template locking: only one editor at a time (Redis lock with TTL)

**API Endpoints:**
- `GET /api/templates` — list with filters (status, category, channel)
- `POST /api/templates` — create new template
- `PUT /api/templates/{id}` — update (creates new version)
- `GET /api/templates/{id}/versions` — version history
- `GET /api/templates/{id}/versions/{v}` — specific version
- `POST /api/templates/{id}/revert/{v}` — revert to version
- `POST /api/templates/{id}/lock` / `DELETE .../lock` — editing lock

---

### 3. Communications (Send Engine)

**Current:** Static list with status badges.

**Production Architecture:**
```
┌─ Communication Request ─────────────────┐
│ POST /api/communications                │
│ { templateId, recipientIds, channel,    │
│   scheduledAt, variables, priority }    │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────────────────────────────┐
│ Communications Service                  │
│ 1. Validate template + variables        │
│ 2. Resolve recipients                   │
│ 3. Create comm record (status: queued)  │
│ 4. Publish to Kafka topic              │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────────────────────────────┐
│ Kafka: comm.delivery                    │
│                                         │
│ Consumer workers (scalable):            │
│ 1. Render template with variables       │
│ 2. Call delivery channel (email/SMS/    │
│    print/portal)                        │
│ 3. Update status (sent/failed/bounced)  │
│ 4. Write to audit trail                │
└─────────────────────────────────────────┘
```

**Tables:**
```sql
communications (
  id, template_id, template_version,
  channel, status, priority,
  scheduled_at, sent_at, created_by,
  batch_id, retry_count, error_message
)

communication_recipients (
  id, communication_id, recipient_id,
  status, delivered_at, opened_at, variables JSONB
)
```

**Key decisions:**
- Async delivery via message queue (never synchronous sends)
- Per-recipient status tracking (one comm → many deliveries)
- Retry with exponential backoff (max 3 retries)
- Batch sends as a single communication with multiple recipients
- Dead letter queue for permanent failures

---

### 4. Compose (3-Step Wizard)

**Current:** Frontend-only wizard with local state.

**Production Architecture:**
- **Step 1 (Select Template):** `GET /api/templates?status=active`
- **Step 2 (Configure):** Variable validation via `POST /api/templates/{id}/validate` — checks required fields, data types, compliance rules
- **Step 3 (Review & Send):** `POST /api/templates/{id}/preview` renders with sample data, then `POST /api/communications` to submit

**Key decisions:**
- Draft saves between steps (`POST /api/drafts`, `PUT /api/drafts/{id}`)
- Preview renders server-side (same engine as production send)
- If approval workflow is enabled for the template category, submission goes to approval queue instead of direct send

---

### 5. Recipients (Contact Management)

**Current:** Static list.

**Production Architecture:**
```sql
recipients (
  id, external_id, first_name, last_name,
  email, phone, address JSONB,
  portal, member_id, group_id,
  preferences JSONB, status, created_at
)

recipient_groups (
  id, name, type, criteria JSONB
)

recipient_group_members (
  recipient_id, group_id
)
```

**Key decisions:**
- Sync from upstream systems (HR/benefits platform) via scheduled import or API webhook
- `external_id` maps to the source system ID
- Communication preferences stored per recipient (opt-out tracking for compliance)
- Address validation via USPS API (for printed correspondence)
- PII encryption at rest (AES-256 on email, phone, address fields)
- GDPR/CCPA: right-to-delete endpoint that anonymizes records

**API Endpoints:**
- `GET /api/recipients` — paginated list with search
- `POST /api/recipients/import` — bulk CSV/JSON import
- `GET /api/recipients/{id}/history` — all comms sent to this person
- `POST /api/recipients/{id}/opt-out` — preference update

---

### 6. Analytics

**Current:** Static charts with hardcoded data.

**Production Architecture:**
```
┌─ Data Pipeline ─────────────────────────┐
│ communication_recipients table          │
│ + tracking events (opens, clicks)       │
│         │                               │
│         ▼                               │
│ Materialized views (refreshed hourly):  │
│ - daily_send_stats                      │
│ - channel_performance                   │
│ - template_engagement                   │
│ - delivery_failure_rates                │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────────────────────────────┐
│ GET /api/analytics/overview             │
│ GET /api/analytics/by-channel           │
│ GET /api/analytics/by-template          │
│ GET /api/analytics/trends?range=30d     │
│ GET /api/analytics/export?format=csv    │
└─────────────────────────────────────────┘
```

**Key decisions:**
- Tracking pixel for email opens (1x1 transparent GIF with recipient token)
- Click tracking via redirect URLs
- Never query raw tables for dashboards — always materialized views
- Export to CSV/PDF for stakeholder reporting
- Chart library: Recharts (lightweight, React-native)

---

### 7. Template Editor (Rich Text + Variables)

**Current:** Textarea with variable detection, live preview.

**Production Architecture:**
- Replace textarea with **TipTap** (ProseMirror-based) — rich text, extensible, variable plugins
- Custom TipTap extension for `{{variable}}` nodes (syntax highlighting, autocomplete, validation)
- Server-side rendering engine: **Handlebars** or **Mustache** (same engine renders preview and production sends)
- Format modes: HTML email, PDF (via wkhtmltopdf or Puppeteer), plain text, print-ready

**Key decisions:**
- Editor saves block-level JSON (not raw HTML) — portable across channels
- Variable catalog: `GET /api/variables` returns available merge fields with types and sample values
- Auto-save every 30 seconds to drafts
- Collaborative editing (future): Yjs + WebSocket for multi-user

---

### 8. Audit Trail

**Current:** In-memory array, frontend filtering.

**Production Architecture:**
```sql
audit_events (
  id BIGINT,
  timestamp TIMESTAMPTZ,
  actor_id, actor_name, actor_role,
  action VARCHAR(50),
  entity_type VARCHAR(50),
  entity_id,
  details JSONB,
  severity (info/warning/critical),
  ip_address, user_agent
)

-- Partitioned by month for performance
-- Index on (entity_type, entity_id), (actor_id), (timestamp)
```

**Key decisions:**
- **Write-only** — audit records are immutable, no updates or deletes ever
- Written from every service via shared `AuditService` (not per-component)
- Table partitioned by month (auto-drop after retention period, e.g., 7 years)
- Async writes via Kafka topic `audit.events` → consumer inserts (never block the main request)
- Export: CSV and PDF with digital signature for compliance
- Elasticsearch index for full-text search on `details` field (at scale)

**API Endpoints:**
- `GET /api/audit` — paginated, filterable (actor, action, entity, date range, severity)
- `GET /api/audit/export` — CSV/PDF download
- No POST/PUT/DELETE — events are created internally only

---

### 9. Notification Center

**Current:** Bell icon, dropdown, full page, localStorage.

**Production Architecture:**
```
┌─ Notification Sources ──────────────────┐
│ Approval requested → notify approver    │
│ Comm delivered → notify sender          │
│ Comm failed → notify sender + admin     │
│ Template published → notify users       │
│ System alert → notify admins            │
└─────────┬───────────────────────────────┘
          │ Kafka: notifications
┌─────────▼───────────────────────────────┐
│ Notification Service                    │
│ 1. Store in DB                          │
│ 2. Push via WebSocket (if online)       │
│ 3. Optional: email digest (daily)       │
└─────────────────────────────────────────┘
```

**Tables:**
```sql
notifications (
  id, user_id, type, title, message,
  action_url, read BOOLEAN,
  created_at, expires_at
)
```

**Key decisions:**
- WebSocket for real-time push (SSE as simpler alternative)
- Batch into digest emails if user is offline for >4 hours
- Auto-expire after 30 days
- Notification preferences per user (mute types, delivery channel)

---

### 10. Role-Based Access Control (RBAC)

**Current:** Frontend role switcher, permission matrix in JS.

**Production Architecture:**
```
┌─ Keycloak / Auth Provider ──────────────┐
│ Realm: commhub                          │
│ Roles: admin, manager, editor,          │
│        viewer, compliance               │
│ Groups: by department/portal            │
│ OIDC tokens with role claims            │
└─────────┬───────────────────────────────┘
          │ JWT (access_token)
┌─────────▼───────────────────────────────┐
│ Liberty: mpJwt-2.1 feature             │
│ @RolesAllowed on every endpoint         │
│ Permission matrix in config (not code)  │
└─────────────────────────────────────────┘
```

**Permission Matrix (config-driven):**
```json
{
  "admin":      ["*"],
  "manager":    ["templates:*", "comms:*", "approvals:approve", "recipients:read", "analytics:*"],
  "editor":     ["templates:edit", "comms:create", "comms:read", "recipients:read"],
  "viewer":     ["templates:read", "comms:read", "analytics:read"],
  "compliance": ["audit:*", "templates:read", "comms:read", "archive:*"]
}
```

**Key decisions:**
- Roles managed in IdP (Keycloak), not in the app database
- Backend enforces permissions — frontend only hides UI elements
- Every API endpoint has `@RolesAllowed` annotation
- Row-level security for multi-tenant: users only see their portal's data
- Audit every permission-sensitive action

---

### 11. Approval Workflows

**Current:** Pipeline view with approve/reject buttons, comment threads.

**Production Architecture:**
```sql
approval_workflows (
  id, name, trigger_type,
  steps JSONB,  -- ordered list of approver roles/users
  auto_escalate_hours, active BOOLEAN
)

approval_requests (
  id, workflow_id, entity_type, entity_id,
  current_step, status (pending/approved/rejected/escalated),
  submitted_by, submitted_at, resolved_at
)

approval_actions (
  id, request_id, step, actor_id,
  action (approve/reject/request_changes),
  comment TEXT, created_at
)
```

**Flow:**
```
Submit → Step 1 (editor review) → Step 2 (compliance) → Step 3 (manager) → Approved → Auto-send
                                                                           → Rejected → Back to author
```

**Key decisions:**
- Multi-step sequential approval (configurable per template category)
- Auto-escalation: if no action in N hours, escalate to next approver or admin
- Delegation: approvers can delegate to backup during PTO
- SLA tracking: time-per-step metrics for analytics
- Email + in-app notification at each step
- Comment thread preserved as part of audit trail

---

### 12. Archive & Search

**Current:** Frontend list with search filter.

**Production Architecture:**
```sql
communication_archive (
  id, communication_id,
  rendered_content TEXT,  -- final HTML/text as sent
  rendered_pdf BYTEA,     -- or S3 path
  metadata JSONB,
  retention_until DATE,
  created_at
)

-- Full-text search index
CREATE INDEX idx_archive_search ON communication_archive
  USING GIN (to_tsvector('english', rendered_content));
```

**Key decisions:**
- Archive stores the **rendered output** (not template + variables, the actual sent content)
- PDF snapshot generated at send time, stored in S3
- Retention policies enforced via scheduled job (auto-purge after retention period)
- Full-text search via PostgreSQL GIN index (handles millions of records)
- Move to Elasticsearch if >10M archived docs
- Legal hold flag overrides retention policy
- Preview re-renders from archive (not from template, which may have changed)

---

### 13. AI Content Assistant

**Current:** Readability scoring, sentiment, compliance checker — all frontend mock.

**Production Architecture:**
```
┌─ Frontend ──────────────────────────────┐
│ Inline suggestions panel in editor      │
│ "Check compliance" / "Improve" buttons  │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────────────────────────────┐
│ POST /api/ai/analyze                    │
│   { content, checks: [readability,      │
│     compliance, sentiment, tone] }      │
│                                         │
│ POST /api/ai/suggest                    │
│   { content, instruction }              │
│                                         │
│ POST /api/ai/generate                   │
│   { prompt, templateType, variables }   │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────────────────────────────┐
│ AI Service                              │
│ - Readability: Flesch-Kincaid (local)   │
│ - Compliance: regex rules + LLM check   │
│ - Suggestions: Claude/GPT API           │
│ - Rate limited per user (10 req/min)    │
└─────────────────────────────────────────┘
```

**Key decisions:**
- Readability scoring done locally (no API call needed — Flesch-Kincaid algorithm)
- Compliance rules: two tiers
  - Tier 1: Regex patterns for prohibited phrases, required disclaimers (instant, free)
  - Tier 2: LLM review for tone/appropriateness (async, costs money)
- AI suggestions are non-blocking (show spinner, editor stays usable)
- All AI interactions logged for audit (input hash + output, no PII sent to AI)
- PII scrubbing before sending content to external AI APIs
- Configurable: company can bring their own API key or disable AI features

---

### 14. Recipient Segments

**Current:** Filter builder with AND logic, match count preview.

**Production Architecture:**
```sql
segments (
  id, name, description,
  criteria JSONB,  -- filter rules
  type (static/dynamic),
  created_by, created_at, updated_at
)

-- Static segments: pre-computed membership
segment_members (
  segment_id, recipient_id
)
```

**Criteria JSONB example:**
```json
{
  "rules": [
    { "field": "portal", "op": "eq", "value": "EE Portal" },
    { "field": "status", "op": "eq", "value": "active" },
    { "field": "group_id", "op": "in", "value": ["G001", "G002"] }
  ],
  "logic": "AND"
}
```

**Key decisions:**
- **Dynamic segments:** query runs at send time (always fresh)
- **Static segments:** membership cached, refresh on schedule or manual trigger
- Segment preview: `POST /api/segments/preview` runs the query and returns count + sample rows (limit 10)
- Used in Compose step 2 as recipient source
- Support AND/OR logic and nested groups (future)
- Max segment size warning (>50K recipients = batch delivery recommended)

---

### 15. A/B Testing

**Current:** Variant comparison, open rate tracking, winner auto-send.

**Production Architecture:**
```sql
ab_tests (
  id, name, template_id,
  variants JSONB,  -- [{name, templateVersionId, weight}]
  segment_id, sample_size_pct,
  metric (open_rate/click_rate/response_rate),
  status (draft/running/completed),
  winner_variant, auto_send_winner BOOLEAN,
  started_at, ended_at, created_by
)

ab_test_results (
  id, test_id, variant_name,
  sent_count, open_count, click_count,
  conversion_rate, confidence_pct
)
```

**Key decisions:**
- Random assignment: hash(recipient_id + test_id) % 100 determines variant
- Statistical significance: chi-squared test, minimum 95% confidence before declaring winner
- Auto-send winner to remaining segment after test concludes
- Test duration: minimum 24 hours, configurable max
- Only one active test per template at a time

---

### 16. Scheduled Reports

**Current:** 4 report types, configurable frequency, preview.

**Production Architecture:**
```sql
report_schedules (
  id, name, type, frequency (daily/weekly/monthly),
  config JSONB,  -- filters, date ranges, groupings
  recipients JSONB,  -- email addresses for delivery
  next_run_at, last_run_at,
  created_by, active BOOLEAN
)

report_runs (
  id, schedule_id, run_at,
  output_path VARCHAR,  -- S3 path to PDF/CSV
  status, row_count, error_message
)
```

**Key decisions:**
- Reports generated by scheduled Liberty EJB timer or Kafka consumer
- Output formats: PDF (wkhtmltopdf), CSV, Excel (Apache POI)
- Stored in S3 with signed download URLs (expire in 24h)
- Email delivery with attachment or link
- Report templates are code-defined (not user-editable — different from comm templates)
- Caching: if same report requested within 1 hour, serve cached version

---

### 17. Customer Journey Map

**Current:** Blueprint view with lifecycle stages, portal filter.

**Production Architecture:**
```sql
journey_definitions (
  id, name, portal,
  stages JSONB,  -- ordered lifecycle stages
  created_by, active BOOLEAN
)

journey_touchpoints (
  id, journey_id, stage,
  touchpoint_type (email/sms/portal/print),
  template_id, trigger_event,
  delay_after_trigger INTERVAL,
  conditions JSONB
)

member_journeys (
  id, recipient_id, journey_id,
  current_stage, status (active/completed/paused),
  started_at, completed_at
)

member_journey_events (
  id, member_journey_id, touchpoint_id,
  communication_id, status,
  triggered_at, completed_at
)
```

**Key decisions:**
- Journey definitions are the blueprint (designed by managers)
- Member journeys are instances (one per recipient enrolled)
- Event-driven triggers: "new enrollment" → start journey, "claim filed" → advance stage
- Conditions: skip touchpoint if recipient opted out of SMS, etc.
- Pause/resume capability per member
- Visual builder (future): react-flow for drag-and-drop journey design

---

### 18. Drag-and-Drop Template Designer

**Current:** 10 block types, properties panel, 2 presets.

**Production Architecture:**
- **Editor framework:** Build on top of TipTap (same as Template Editor) with custom block nodes
- **Block types stored as JSON schema** — new block types added via config, not code changes:

```json
{
  "type": "header",
  "props": {
    "text": { "type": "string", "default": "Title" },
    "level": { "type": "enum", "values": [1,2,3], "default": 1 },
    "align": { "type": "enum", "values": ["left","center","right"], "default": "left" }
  }
}
```

**Key decisions:**
- Blocks saved as ordered JSON array (portable, channel-agnostic)
- Render engine converts blocks → HTML (email), blocks → PDF, blocks → print
- Preset library: admin can save any design as a preset for reuse
- Image blocks upload to S3, reference by URL
- Responsive preview: desktop + mobile toggle
- MJML under the hood for email rendering (handles email client quirks)

---

### 19. Dashboard Widgets

See **Feature 1 (Dashboard)** — same architecture. Widget types:

| Widget | Data Source | Refresh |
|--------|-----------|---------|
| Communications Sent | `daily_send_stats` view | 5 min |
| Pending Approvals | `approval_requests` count | Real-time (WebSocket) |
| Delivery Rate | `communication_recipients` agg | 15 min |
| Template Usage | `communications` group by template | 1 hour |
| Recent Activity | `audit_events` latest | Real-time |
| Channel Breakdown | `communications` group by channel | 15 min |
| SLA Compliance | `approval_actions` timing | 1 hour |
| System Health | Liberty MicroProfile Health | 30 sec |

---

### 20. Data Persistence (Central Store)

**Current:** localStorage via useStore hook + React Context.

**Production Architecture:**

**Replace entirely with:**
- **Frontend:** Zustand store + React Query (TanStack Query)
  - Zustand: UI state (sidebar open, current page, modal state)
  - React Query: server state (templates, comms, recipients — auto-cache, refetch, optimistic updates)
- **Backend:** PostgreSQL via JPA (all data)
- **API pattern:** RESTful with consistent pagination, filtering, sorting

```
Frontend State Architecture:
┌─────────────────────────────────────────┐
│ Zustand (UI state only)                 │
│ - currentPage, sidebarOpen, modals      │
│ - currentRole (from JWT)                │
│ - notification dropdown open/closed     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ React Query (server state)              │
│ - useQuery('templates', fetchTemplates) │
│ - useMutation(createComm, {onSuccess})  │
│ - Auto-refetch, caching, optimistic UI  │
│ - Pagination via useInfiniteQuery       │
└─────────────────────────────────────────┘
```

---

## Database Schema Summary

```
PostgreSQL
├── templates
├── template_versions
├── template_categories
├── communications
├── communication_recipients
├── communication_archive
├── recipients
├── recipient_groups
├── recipient_group_members
├── segments
├── segment_members
├── approval_workflows
├── approval_requests
├── approval_actions
├── audit_events (partitioned by month)
├── notifications
├── dashboard_configs
├── ab_tests
├── ab_test_results
├── report_schedules
├── report_runs
├── journey_definitions
├── journey_touchpoints
├── member_journeys
├── member_journey_events
└── users (synced from IdP)
```

**Total: 24 tables**

---

## API Structure

```
/api
├── /auth           (login, refresh, logout)
├── /dashboard      (config, metrics, stream)
├── /templates      (CRUD, versions, lock)
├── /communications (create, list, status, cancel)
├── /compose        (drafts, preview, validate)
├── /recipients     (CRUD, import, opt-out, history)
├── /analytics      (overview, by-channel, trends, export)
├── /audit          (list, export)
├── /notifications  (list, mark-read, preferences)
├── /approvals      (list, approve, reject, delegate)
├── /archive        (search, view, download)
├── /ai             (analyze, suggest, generate)
├── /segments       (CRUD, preview)
├── /ab-tests       (CRUD, results, declare-winner)
├── /reports        (schedules, runs, download)
├── /journeys       (definitions, touchpoints, members)
├── /designer       (presets, blocks, render-preview)
├── /admin          (users, roles, system-config)
└── /health         (liveness, readiness — MicroProfile)
```

---

## Deployment Architecture

```
┌─ Load Balancer (NGINX/ALB) ─────────────────────┐
│                                                   │
│  ┌─ Liberty Cluster (2+ instances) ────────────┐ │
│  │ App WAR (React + API)                       │ │
│  │ MicroProfile Health for K8s probes          │ │
│  │ Horizontal scaling via K8s HPA              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─ Worker Nodes ──────────────────────────────┐ │
│  │ Kafka consumers (delivery, notifications,   │ │
│  │ audit, reports)                              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─ Data Layer ────────────────────────────────┐ │
│  │ PostgreSQL (primary + read replica)         │ │
│  │ Redis (sessions, cache, pub/sub)            │ │
│  │ S3 (files, PDFs, report outputs)            │ │
│  │ Kafka (event bus)                           │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  ┌─ External ──────────────────────────────────┐ │
│  │ Keycloak (auth)                             │ │
│  │ SendGrid (email)                            │ │
│  │ Twilio (SMS)                                │ │
│  │ Claude/OpenAI (AI features)                 │ │
│  └─────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)
- PostgreSQL setup + Flyway migrations for core tables
- Auth (Keycloak or JWT-based)
- Templates CRUD + versioning
- Recipients CRUD + import
- RBAC enforcement on all endpoints

### Phase 2: Core Comms (Weeks 4-6)
- Communication send engine (Kafka + workers)
- Compose wizard (backend validation + preview)
- Approval workflows
- Notification center (WebSocket)
- Audit trail (async writes)

### Phase 3: Intelligence (Weeks 7-9)
- Analytics (materialized views, charts)
- Archive + full-text search
- AI content assistant (API integration)
- A/B testing engine
- Scheduled reports

### Phase 4: Advanced (Weeks 10-12)
- Customer journey engine (event-driven)
- Drag-drop designer (TipTap + MJML)
- Dashboard widgets (WebSocket real-time)
- Recipient segments (dynamic queries)
- Multi-channel delivery (email + SMS + print + portal)

---

*Generated by Alec — March 12, 2026*
