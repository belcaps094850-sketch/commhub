# CommHub Roadmap — Feature Plan

## Phase 1: Compliance & Governance (Critical for Insurance)
High-impact, sets the foundation for everything else.

### 1. Approval Workflows
- Template lifecycle: Draft → In Review → Approved → Active → Archived
- Assign reviewers to templates
- Review comments & change requests
- Approval history log (feeds into Audit Trail)
- Block publishing without approval
- **Complexity:** Medium | **Files:** 2-3

### 4. Archive & Search
- Searchable history of all sent communications
- Filter by member, template, date range, portal, channel
- View full rendered content of any past communication
- "Show me everything sent to member EE-10042"
- Retention policy badges (7-year regulatory)
- **Complexity:** Medium | **Files:** 2

### 12. Role-Based Access Control
- Roles: Admin, Template Manager, Reviewer, Operator, Viewer
- Permission matrix (who can create/edit/approve/send/view)
- Role assignment UI
- Login simulation (role switcher for demo)
- **Complexity:** Medium | **Files:** 2-3

---

## Phase 2: Content Intelligence
AI-powered features that differentiate from basic CCM tools.

### 2. AI Content Assistant
- Sidebar panel in Template Editor
- Readability scoring (Flesch-Kincaid grade level)
- Sentiment analysis (friendly/neutral/formal/harsh)
- Content suggestions via prompt ("make this more empathetic")
- Regulatory language checker (appeal rights, HIPAA, disclosures)
- Auto-insert compliance blocks
- **Complexity:** Medium | **Files:** 2

### 9. Multi-Language Support
- Side-by-side translation editor (English ↔ Spanish, etc.)
- Language selector per template
- Auto-translation simulation
- Language-specific preview
- Character/word count per language
- **Complexity:** Medium | **Files:** 2

---

## Phase 3: Advanced Communications
Operational power features.

### 6. A/B Testing
- Create variant B of any communication
- Split audience (e.g., 10% A / 10% B / 80% winner)
- Track open rate, click rate per variant
- Auto-select winner after test period
- Results dashboard
- **Complexity:** Medium | **Files:** 2-3

### 8. Recipient Segments
- Create saved segments with filters (portal, plan, status, region, age)
- Reusable in Compose wizard
- Segment size preview ("this matches 3,420 members")
- Segment history (who used it, when)
- **Complexity:** Low-Medium | **Files:** 1-2

### 7. Notification Center
- Bell icon in header with unread count
- Real-time alerts: batch failures, approvals needed, compliance flags
- Notification types: info, warning, critical
- Mark as read, dismiss, action buttons
- **Complexity:** Low | **Files:** 2

---

## Phase 4: Visual & UX Enhancements
Polish and power-user features.

### 3. Customer Journey Mapping
- Visual timeline per member showing all touchpoints
- Drag-and-drop journey builder
- Map communications to journey stages (Onboarding → Active → Renewal)
- Cross-portal journey view (EE + ER + GI)
- **Complexity:** High | **Files:** 2-3

### 5. Drag-and-Drop Template Designer
- Block-based editor: Header, Text, Table, Image, Divider, Footer, Signature
- Drag to reorder blocks
- Block-level styling (font, size, alignment, padding)
- Preview pane updates in real-time
- Export to HTML/PDF
- **Complexity:** High | **Files:** 3-4

### 10. Dashboard Widgets
- Customizable dashboard layout
- Available widgets: Delivery Stats, Channel Breakdown, Template Activity, Recent Alerts, Portal Overview
- Drag to reorder widgets
- Collapse/expand, remove/add widgets
- **Complexity:** Medium | **Files:** 2-3

### 11. Scheduled Reports
- Configure recurring reports (daily/weekly/monthly)
- Report types: Delivery Summary, Template Usage, Compliance Status, Failure Analysis
- Email recipients list
- Report preview
- History of sent reports
- **Complexity:** Medium | **Files:** 2

---

## Build Order (Recommended)

| Order | Feature | Phase | Est. Files | Approach |
|:---:|---|:---:|:---:|---|
| 1 | Notification Center | 3 | 2 | Build myself |
| 2 | Role-Based Access | 1 | 2-3 | Build myself |
| 3 | Approval Workflows | 1 | 2-3 | Build myself |
| 4 | Archive & Search | 1 | 2 | Build myself |
| 5 | AI Content Assistant | 2 | 2 | Build myself |
| 6 | Recipient Segments | 3 | 1-2 | Build myself |
| 7 | Multi-Language Support | 2 | 2 | Build myself |
| 8 | A/B Testing | 3 | 2-3 | Build myself |
| 9 | Scheduled Reports | 4 | 2 | Build myself |
| 10 | Dashboard Widgets | 4 | 2-3 | Build myself |
| 11 | Customer Journey Mapping | 4 | 2-3 | Build myself or agent |
| 12 | Drag-and-Drop Designer | 4 | 3-4 | Agent (most complex) |

**Total estimated new files:** ~25-30 components
**Total estimated time:** Multiple sessions across this week

---

## Current App Pages (8)
1. ✅ Dashboard
2. ✅ Templates
3. ✅ Template Editor (with live preview)
4. ✅ Communications
5. ✅ Compose (3-step wizard)
6. ✅ Recipients
7. ✅ Analytics
8. ✅ Audit Trail

## After Roadmap (20 pages)
All 8 above plus:
9. Approval Workflows (integrated into Templates)
10. Archive & Search
11. Role-Based Access (with role switcher)
12. AI Content Assistant (integrated into Template Editor)
13. Multi-Language Editor
14. A/B Testing
15. Recipient Segments
16. Notification Center (global component)
17. Customer Journey Mapping
18. Drag-and-Drop Designer
19. Dashboard Widgets (enhanced Dashboard)
20. Scheduled Reports

---

*Created: March 9, 2026*
*Project: CommHub — Quadient-Inspired Communication Automation*
