# CommHub — Detailed Implementation Plan

> From prototype to production. Every task, every file, every decision.

---

## Pre-Work: Project Setup (Day 1)

### 1. Create the production repo
```
commhub/
├── backend/                    # Open Liberty (Maven project)
│   ├── pom.xml
│   ├── src/main/
│   │   ├── java/com/commhub/
│   │   │   ├── config/         # App config, CORS, exception mappers
│   │   │   ├── auth/           # JWT filter, role resolver
│   │   │   ├── model/          # JPA entities (24 tables)
│   │   │   ├── dto/            # Request/response DTOs
│   │   │   ├── repository/     # Data access layer
│   │   │   ├── service/        # Business logic
│   │   │   ├── rest/           # JAX-RS resource classes
│   │   │   ├── event/          # Kafka producers/consumers
│   │   │   ├── scheduler/      # EJB timers (reports, cleanup)
│   │   │   └── util/           # Helpers (pagination, validation)
│   │   ├── resources/
│   │   │   └── META-INF/
│   │   │       ├── persistence.xml
│   │   │       └── microprofile-config.properties
│   │   └── liberty/config/
│   │       └── server.xml
│   └── src/main/frontend/      # React app (Vite)
│       ├── src/
│       │   ├── api/            # API client (axios/fetch wrappers)
│       │   ├── components/     # Migrated from prototype
│       │   ├── hooks/          # useAuth, useApi, custom hooks
│       │   ├── pages/          # Route-level components
│       │   ├── store/          # Zustand stores
│       │   ├── types/          # TypeScript interfaces (if TS)
│       │   └── utils/          # Formatters, validators
│       ├── package.json
│       └── vite.config.js
├── db/
│   └── migrations/             # Flyway SQL migrations
│       ├── V001__create_users.sql
│       ├── V002__create_templates.sql
│       └── ...
├── docker/
│   ├── docker-compose.yml      # Local dev (PostgreSQL, Redis, Kafka)
│   ├── Dockerfile              # Production Liberty image
│   └── keycloak/
│       └── realm-export.json   # Pre-configured realm
├── docs/
│   ├── API.md                  # OpenAPI supplement
│   ├── ARCHITECTURE.md         # Moved from root
│   └── RUNBOOK.md              # Operations guide
├── scripts/
│   ├── seed-data.sql           # Sample data for development
│   └── setup-local.sh          # One-command local setup
├── .env.example
├── README.md
└── ROADMAP.md
```

### 2. Local dev environment (docker-compose.yml)
```yaml
services:
  postgres:
    image: postgres:16
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: commhub
      POSTGRES_USER: commhub
      POSTGRES_PASSWORD: commhub_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/migrations:/docker-entrypoint-initdb.d

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  kafka:
    image: confluentinc/cp-kafka:7.6.0
    ports: ["9092:9092"]
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9093
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      CLUSTER_ID: commhub-dev-cluster-001

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    ports: ["8080:8080"]
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    command: start-dev --import-realm
    volumes:
      - ./docker/keycloak:/opt/keycloak/data/import

volumes:
  pgdata:
```

### 3. One-command setup script
```bash
#!/bin/bash
# scripts/setup-local.sh
docker compose -f docker/docker-compose.yml up -d
echo "Waiting for PostgreSQL..."
until docker exec commhub-postgres pg_isready; do sleep 1; done
echo "Running migrations..."
# Flyway runs via Maven plugin or standalone
cd backend && ./mvnw flyway:migrate
echo "Starting Liberty..."
./mvnw liberty:dev   # dev mode = hot reload
```

---

## Phase 1: Foundation (Weeks 1-3)

### Week 1: Database + Auth + Project Skeleton

#### Day 1-2: Database Schema (Core Tables)

**File: `db/migrations/V001__create_users_and_roles.sql`**
```sql
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    external_id     VARCHAR(255) UNIQUE NOT NULL,  -- Keycloak sub
    email           VARCHAR(255) UNIQUE NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    role            VARCHAR(50) NOT NULL DEFAULT 'viewer',
    portal          VARCHAR(100),
    active          BOOLEAN NOT NULL DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_external ON users(external_id);
CREATE INDEX idx_users_email ON users(email);
```

**File: `db/migrations/V002__create_templates.sql`**
```sql
CREATE TABLE template_categories (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) UNIQUE NOT NULL,
    description     TEXT,
    requires_approval BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE templates (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    category_id     BIGINT REFERENCES template_categories(id),
    channel         VARCHAR(50) NOT NULL,  -- email, sms, print, portal
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
        -- draft, active, archived
    current_version INT NOT NULL DEFAULT 1,
    locked_by       BIGINT REFERENCES users(id),
    locked_at       TIMESTAMPTZ,
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE template_versions (
    id              BIGSERIAL PRIMARY KEY,
    template_id     BIGINT NOT NULL REFERENCES templates(id),
    version_number  INT NOT NULL,
    content         JSONB NOT NULL,         -- block-level structure
    variables       JSONB,                  -- extracted merge fields
    html_preview    TEXT,                   -- pre-rendered HTML
    change_note     VARCHAR(500),
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(template_id, version_number)
);

CREATE INDEX idx_templates_status ON templates(status);
CREATE INDEX idx_templates_channel ON templates(channel);
CREATE INDEX idx_template_versions_tid ON template_versions(template_id);
```

**File: `db/migrations/V003__create_recipients.sql`**
```sql
CREATE TABLE recipients (
    id              BIGSERIAL PRIMARY KEY,
    external_id     VARCHAR(255) UNIQUE,    -- source system ID
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    email           VARCHAR(255),
    phone           VARCHAR(20),
    address         JSONB,                  -- {line1, line2, city, state, zip}
    portal          VARCHAR(100),
    member_id       VARCHAR(100),
    group_id        VARCHAR(100),
    preferences     JSONB DEFAULT '{}',     -- {email: true, sms: false, ...}
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipient_groups (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    type            VARCHAR(20) NOT NULL DEFAULT 'manual',
        -- manual, imported, dynamic
    criteria        JSONB,                  -- for dynamic groups
    created_by      BIGINT REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recipient_group_members (
    recipient_id    BIGINT NOT NULL REFERENCES recipients(id),
    group_id        BIGINT NOT NULL REFERENCES recipient_groups(id),
    PRIMARY KEY (recipient_id, group_id)
);

CREATE INDEX idx_recipients_external ON recipients(external_id);
CREATE INDEX idx_recipients_email ON recipients(email);
CREATE INDEX idx_recipients_portal ON recipients(portal);
CREATE INDEX idx_recipients_status ON recipients(status);
```

**File: `db/migrations/V004__create_audit.sql`**
```sql
CREATE TABLE audit_events (
    id              BIGSERIAL,
    event_time      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_id        BIGINT,
    actor_name      VARCHAR(200),
    actor_role      VARCHAR(50),
    action          VARCHAR(50) NOT NULL,
        -- template.created, template.updated, template.published,
        -- comm.sent, comm.failed, approval.approved, approval.rejected,
        -- user.login, user.role_changed, recipient.imported, etc.
    entity_type     VARCHAR(50) NOT NULL,
        -- template, communication, recipient, approval, user, system
    entity_id       VARCHAR(100),
    details         JSONB,
    severity        VARCHAR(10) NOT NULL DEFAULT 'info',
        -- info, warning, critical
    ip_address      INET,
    user_agent      VARCHAR(500),
    PRIMARY KEY (id, event_time)
) PARTITION BY RANGE (event_time);

-- Create partitions for current + next 3 months
CREATE TABLE audit_events_2026_03 PARTITION OF audit_events
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE audit_events_2026_04 PARTITION OF audit_events
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE audit_events_2026_05 PARTITION OF audit_events
    FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE audit_events_2026_06 PARTITION OF audit_events
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE INDEX idx_audit_actor ON audit_events(actor_id);
CREATE INDEX idx_audit_entity ON audit_events(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_events(action);
CREATE INDEX idx_audit_time ON audit_events(event_time);
```

**File: `db/migrations/V005__create_notifications.sql`**
```sql
CREATE TABLE notifications (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    type            VARCHAR(50) NOT NULL,
        -- approval_requested, comm_delivered, comm_failed,
        -- template_published, system_alert
    title           VARCHAR(255) NOT NULL,
    message         TEXT,
    action_url      VARCHAR(500),
    read            BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ
);

CREATE INDEX idx_notif_user ON notifications(user_id, read);
CREATE INDEX idx_notif_created ON notifications(created_at);
```

#### Day 3-4: Auth + Liberty Configuration

**File: `backend/src/main/liberty/config/server.xml`**
```xml
<server description="CommHub">
    <featureManager>
        <feature>restfulWS-3.1</feature>
        <feature>jsonb-3.0</feature>
        <feature>jsonp-2.1</feature>
        <feature>cdi-4.0</feature>
        <feature>persistence-3.1</feature>
        <feature>beanValidation-3.0</feature>
        <feature>enterpriseBeansLite-4.0</feature>
        <feature>mpConfig-3.1</feature>
        <feature>mpHealth-4.0</feature>
        <feature>mpOpenAPI-3.1</feature>
        <feature>mpMetrics-5.1</feature>
        <feature>mpJwt-2.1</feature>
        <feature>websocket-2.1</feature>
    </featureManager>

    <httpEndpoint id="defaultHttpEndpoint" host="*"
                  httpPort="9080" httpsPort="9443" />

    <!-- JWT validation (Keycloak) -->
    <mpJwt id="commhubJwt"
           jwksUri="http://localhost:8080/realms/commhub/protocol/openid-connect/certs"
           issuer="http://localhost:8080/realms/commhub"
           audiences="commhub-app"
           userNameAttribute="preferred_username"
           groupNameAttribute="realm_access/roles" />

    <!-- PostgreSQL DataSource -->
    <library id="postgresLib">
        <fileset dir="${server.config.dir}/postgres" includes="*.jar" />
    </library>
    <dataSource id="DefaultDataSource" jndiName="jdbc/commhubDB">
        <jdbcDriver libraryRef="postgresLib" />
        <properties.postgresql serverName="${db.host}" portNumber="${db.port}"
                               databaseName="${db.name}"
                               user="${db.user}" password="${db.password}" />
        <connectionManager maxPoolSize="20" minPoolSize="5" />
    </dataSource>

    <webApplication location="commhub.war" contextRoot="/" />

    <cors domain="/"
          allowedOrigins="http://localhost:5173"
          allowedMethods="GET, POST, PUT, DELETE, OPTIONS, PATCH"
          allowedHeaders="Content-Type, Authorization"
          allowCredentials="true" />
</server>
```

**File: `backend/src/main/java/com/commhub/auth/JwtAuthFilter.java`**
```java
// Extract user from JWT, create/sync User record in DB
// Map Keycloak roles to CommHub permissions
// Set SecurityContext for downstream @RolesAllowed checks
```

**Tasks:**
- [ ] Configure Keycloak realm (`commhub`) with 5 roles: admin, manager, editor, viewer, compliance
- [ ] Create Keycloak client (`commhub-app`) with OIDC
- [ ] Test user creation + login flow
- [ ] JWT validation working on Liberty endpoint
- [ ] User auto-provisioning: first login creates DB record from JWT claims

#### Day 5: Base Infrastructure Classes

**File: `backend/src/main/java/com/commhub/config/RestApplication.java`**
```java
@ApplicationPath("/api")
public class RestApplication extends Application {}
```

**File: `backend/src/main/java/com/commhub/config/ExceptionMapper.java`**
```java
// Global exception mapper
// 400 for validation errors (with field-level details)
// 401 for auth failures
// 403 for permission denied
// 404 for not found
// 409 for conflicts (template locked, duplicate name)
// 500 with correlation ID (never expose stack trace)
```

**File: `backend/src/main/java/com/commhub/util/PaginatedResponse.java`**
```java
// Standard paginated response:
// { data: [...], page: 1, pageSize: 20, totalItems: 142, totalPages: 8 }
```

**File: `backend/src/main/java/com/commhub/util/QueryParams.java`**
```java
// Parse standard query params:
// ?page=1&size=20&sort=createdAt&order=desc&search=keyword
// &filter[status]=active&filter[channel]=email
```

**File: `backend/src/main/java/com/commhub/service/AuditService.java`**
```java
// Central audit logging service
// Every service calls: auditService.log(actor, action, entityType, entityId, details)
// Phase 1: direct DB insert
// Phase 2: async via Kafka
```

**Tasks:**
- [ ] RestApplication with `/api` base path
- [ ] Global ExceptionMapper (all error responses are JSON)
- [ ] PaginatedResponse wrapper
- [ ] QueryParams parser (reusable across all list endpoints)
- [ ] AuditService (synchronous for now)
- [ ] BaseEntity with id, createdAt, updatedAt (mapped superclass)
- [ ] HealthResource (MicroProfile Health checks for DB, Redis)

---

### Week 2: Templates + Recipients API

#### Day 6-7: Templates CRUD + Versioning

**Backend files to create:**
```
model/
  Template.java           — JPA entity
  TemplateVersion.java    — JPA entity
  TemplateCategory.java   — JPA entity

dto/
  TemplateRequest.java    — create/update input
  TemplateResponse.java   — API output (includes latest version content)
  TemplateListResponse.java — list item (no content, lighter)
  VersionResponse.java    — version history item

repository/
  TemplateRepository.java — named queries, custom finders

service/
  TemplateService.java    — business logic

rest/
  TemplateResource.java   — JAX-RS endpoints
```

**API contract:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/templates` | viewer+ | List (paginated, filterable by status/channel/category) |
| GET | `/api/templates/{id}` | viewer+ | Get with latest version content |
| POST | `/api/templates` | editor+ | Create (auto-creates version 1) |
| PUT | `/api/templates/{id}` | editor+ | Update (creates new version, bumps version_number) |
| PATCH | `/api/templates/{id}/status` | manager+ | Change status (draft→active, active→archived) |
| GET | `/api/templates/{id}/versions` | viewer+ | Version history |
| GET | `/api/templates/{id}/versions/{v}` | viewer+ | Specific version |
| POST | `/api/templates/{id}/revert/{v}` | editor+ | Revert to old version (creates new version with old content) |
| POST | `/api/templates/{id}/lock` | editor+ | Acquire edit lock (fails if already locked) |
| DELETE | `/api/templates/{id}/lock` | editor+ | Release lock |
| POST | `/api/templates/{id}/duplicate` | editor+ | Clone template with all settings |

**Business rules:**
- Only `draft` templates can be edited
- Publishing (draft→active) requires manager approval if category has `requires_approval=true`
- Archiving removes from compose selection but preserves for audit
- Lock expires after 30 minutes of inactivity (EJB timer cleanup)
- Version content is immutable — every edit = new version
- Delete = soft delete (status→archived, never hard delete)

**Tasks:**
- [ ] Template JPA entity with all fields + relationships
- [ ] TemplateVersion JPA entity
- [ ] TemplateCategory JPA entity + seed 5 default categories
- [ ] TemplateService with full CRUD + versioning logic
- [ ] TemplateResource with all endpoints above
- [ ] Lock mechanism (check + acquire + release + auto-expire)
- [ ] Audit logging on every mutation
- [ ] Unit tests for TemplateService
- [ ] Integration test: create → edit → version history → revert

#### Day 8-9: Recipients CRUD + Import

**Backend files to create:**
```
model/
  Recipient.java
  RecipientGroup.java

dto/
  RecipientRequest.java
  RecipientResponse.java
  ImportResult.java       — {imported: 150, skipped: 3, errors: [{row: 5, reason: "..."}]}

service/
  RecipientService.java
  ImportService.java      — CSV/JSON parsing + bulk insert

rest/
  RecipientResource.java
```

**API contract:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/recipients` | editor+ | List (paginated, searchable by name/email/portal) |
| GET | `/api/recipients/{id}` | editor+ | Get with preferences + group memberships |
| POST | `/api/recipients` | manager+ | Create single |
| PUT | `/api/recipients/{id}` | manager+ | Update |
| POST | `/api/recipients/import` | manager+ | Bulk import (multipart CSV or JSON array) |
| GET | `/api/recipients/{id}/history` | viewer+ | Communication history for this recipient |
| POST | `/api/recipients/{id}/opt-out` | editor+ | Update communication preferences |
| GET | `/api/recipient-groups` | editor+ | List groups |
| POST | `/api/recipient-groups` | manager+ | Create group |
| POST | `/api/recipient-groups/{id}/members` | manager+ | Add members to group |

**Import format (CSV):**
```csv
external_id,first_name,last_name,email,phone,portal,member_id,group_id
EMP001,Jane,Doe,jane@company.com,555-0101,EE Portal,M10001,G001
EMP002,John,Smith,john@company.com,555-0102,EE Portal,M10002,G001
```

**Business rules:**
- Import: upsert by external_id (update if exists, insert if new)
- Import runs async for >100 rows (return 202 Accepted + job ID)
- PII fields (email, phone, address) encrypted at rest (AES-256 via JPA converter)
- Opt-out preferences respected at send time (not just UI)
- Deactivated recipients excluded from segments and compose

**Tasks:**
- [ ] Recipient JPA entity with encrypted field converters
- [ ] RecipientGroup + join table entities
- [ ] RecipientService with search (PostgreSQL ILIKE or full-text)
- [ ] ImportService (CSV parser, upsert logic, error collection)
- [ ] RecipientResource with all endpoints
- [ ] Bulk import endpoint (multipart/form-data)
- [ ] Audit logging on imports
- [ ] Seed 50 sample recipients for development

#### Day 10: Template Categories + Seed Data

**Tasks:**
- [ ] Seed categories: Welcome, Claims, Enrollment, Billing, Compliance
- [ ] Seed 5 sample templates (one per category, with version content)
- [ ] Seed 50 recipients across 3 portals (EE, ER, GI)
- [ ] Seed 3 recipient groups
- [ ] Verify all APIs work end-to-end via Swagger UI (`/openapi/ui/`)

---

### Week 3: RBAC + Frontend Migration

#### Day 11-12: Backend RBAC Enforcement

**File: `backend/src/main/java/com/commhub/auth/PermissionMatrix.java`**
```java
public class PermissionMatrix {
    // Config-driven permission check
    // Maps: role → Set<permission>
    // Permissions: "templates:read", "templates:edit", "comms:create", etc.

    private static final Map<String, Set<String>> MATRIX = Map.of(
        "admin",      Set.of("*"),
        "manager",    Set.of("templates:*", "comms:*", "approvals:approve",
                             "recipients:*", "analytics:*", "reports:*"),
        "editor",     Set.of("templates:read", "templates:edit",
                             "comms:create", "comms:read", "recipients:read"),
        "viewer",     Set.of("templates:read", "comms:read",
                             "analytics:read", "reports:read"),
        "compliance", Set.of("audit:*", "templates:read", "comms:read",
                             "archive:*", "analytics:read")
    );

    public static boolean hasPermission(String role, String permission) {
        Set<String> perms = MATRIX.get(role);
        if (perms == null) return false;
        if (perms.contains("*")) return true;
        if (perms.contains(permission)) return true;
        // Check wildcard: "templates:*" matches "templates:edit"
        String prefix = permission.split(":")[0] + ":*";
        return perms.contains(prefix);
    }
}
```

**File: `backend/src/main/java/com/commhub/auth/Secured.java`**
```java
@Retention(RUNTIME)
@Target({METHOD, TYPE})
public @interface Secured {
    String value();  // e.g., "templates:edit"
}
```

**File: `backend/src/main/java/com/commhub/auth/SecurityInterceptor.java`**
```java
// CDI interceptor that reads @Secured annotation
// Checks current user's role against PermissionMatrix
// Throws 403 if denied
// Logs permission failures to audit
```

**Tasks:**
- [ ] PermissionMatrix with 5 roles
- [ ] @Secured annotation
- [ ] SecurityInterceptor (CDI)
- [ ] Apply @Secured to every endpoint in TemplateResource and RecipientResource
- [ ] `GET /api/auth/me` — returns current user profile + permissions
- [ ] `GET /api/auth/permissions` — returns permission matrix for current role
- [ ] Frontend can fetch permissions on login and conditionally render UI

#### Day 13-15: Frontend Migration (React)

**New frontend structure:**
```
src/
├── api/
│   ├── client.js           — axios instance with JWT interceptor
│   ├── templates.js        — API calls for templates
│   ├── recipients.js       — API calls for recipients
│   └── auth.js             — login, logout, refresh, getMe
├── store/
│   ├── authStore.js        — Zustand: user, token, permissions
│   └── uiStore.js          — Zustand: sidebar, page, modals
├── hooks/
│   ├── useAuth.js          — login flow, token refresh
│   ├── usePermission.js    — hasPermission(action) check
│   └── useApi.js           — React Query wrappers
├── pages/
│   ├── LoginPage.jsx       — Keycloak redirect
│   ├── DashboardPage.jsx   — migrated from Dashboard.jsx
│   ├── TemplatesPage.jsx   — migrated, now fetches from API
│   ├── RecipientsPage.jsx  — migrated, now fetches from API
│   └── ...
├── components/
│   ├── ProtectedRoute.jsx  — redirect to login if no token
│   ├── PermissionGate.jsx  — <PermissionGate action="templates:edit">...</PermissionGate>
│   ├── Sidebar.jsx         — role-aware navigation
│   └── ... (migrated from prototype)
├── App.jsx                 — React Router v6 routes
└── main.jsx
```

**Key migration steps:**
1. Install: `react-router-dom`, `zustand`, `@tanstack/react-query`, `axios`
2. Replace `useStore` (localStorage) → Zustand (UI state) + React Query (server state)
3. Replace `useState(page)` → React Router (`/templates`, `/recipients`, etc.)
4. Wrap all routes in `ProtectedRoute` (redirects to Keycloak if no JWT)
5. Add `PermissionGate` component — hides UI elements based on role
6. Migrate each component one at a time (keep prototype working during migration)

**Migration order (by dependency):**
1. App.jsx (router + layout)
2. Sidebar (role-aware links)
3. LoginPage (Keycloak OIDC)
4. Templates (API-backed)
5. Recipients (API-backed)
6. Dashboard (static for now, API later)
7. Remaining pages (keep localStorage until Phase 2 backends exist)

**Tasks:**
- [ ] Install React Router, Zustand, React Query, Axios
- [ ] Create API client with JWT interceptor (auto-attach token, auto-refresh)
- [ ] Create authStore (user, token, permissions, login/logout actions)
- [ ] Create ProtectedRoute and PermissionGate components
- [ ] Migrate App.jsx to React Router
- [ ] Migrate Sidebar to use `<NavLink>` + permission checks
- [ ] Migrate Templates page to fetch from `/api/templates`
- [ ] Migrate Recipients page to fetch from `/api/recipients`
- [ ] All other pages: keep existing localStorage behavior (migrated in later phases)
- [ ] Verify: login → see dashboard → navigate → create template → see in list

---

## Phase 2: Core Communications (Weeks 4-6)

### Week 4: Communication Engine

#### Day 16-17: Database Schema (Communications + Approvals)

**File: `db/migrations/V006__create_communications.sql`**
```sql
CREATE TABLE communications (
    id                  BIGSERIAL PRIMARY KEY,
    template_id         BIGINT NOT NULL REFERENCES templates(id),
    template_version    INT NOT NULL,
    channel             VARCHAR(50) NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',
        -- draft, pending_approval, queued, sending, sent, failed, cancelled
    priority            VARCHAR(10) NOT NULL DEFAULT 'normal',
        -- low, normal, high, urgent
    scheduled_at        TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    batch_id            VARCHAR(100),           -- groups related sends
    total_recipients    INT NOT NULL DEFAULT 0,
    delivered_count     INT NOT NULL DEFAULT 0,
    failed_count        INT NOT NULL DEFAULT 0,
    created_by          BIGINT NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE communication_recipients (
    id                  BIGSERIAL PRIMARY KEY,
    communication_id    BIGINT NOT NULL REFERENCES communications(id),
    recipient_id        BIGINT NOT NULL REFERENCES recipients(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- pending, sent, delivered, opened, clicked, bounced, failed
    variables           JSONB,                  -- per-recipient merge data
    rendered_content    TEXT,                    -- actual sent content
    sent_at             TIMESTAMPTZ,
    delivered_at        TIMESTAMPTZ,
    opened_at           TIMESTAMPTZ,
    error_message       VARCHAR(500),
    retry_count         INT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comms_status ON communications(status);
CREATE INDEX idx_comms_created ON communications(created_at);
CREATE INDEX idx_comm_recip_comm ON communication_recipients(communication_id);
CREATE INDEX idx_comm_recip_status ON communication_recipients(status);
```

**File: `db/migrations/V007__create_approvals.sql`**
```sql
CREATE TABLE approval_workflows (
    id                  BIGSERIAL PRIMARY KEY,
    name                VARCHAR(255) NOT NULL,
    category_id         BIGINT REFERENCES template_categories(id),
    steps               JSONB NOT NULL,
        -- [{step: 1, role: "editor", label: "Content Review"},
        --  {step: 2, role: "compliance", label: "Compliance Check"},
        --  {step: 3, role: "manager", label: "Final Approval"}]
    auto_escalate_hours INT DEFAULT 24,
    active              BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approval_requests (
    id                  BIGSERIAL PRIMARY KEY,
    workflow_id         BIGINT NOT NULL REFERENCES approval_workflows(id),
    entity_type         VARCHAR(50) NOT NULL,   -- communication, template
    entity_id           BIGINT NOT NULL,
    current_step        INT NOT NULL DEFAULT 1,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- pending, approved, rejected, escalated, cancelled
    submitted_by        BIGINT NOT NULL REFERENCES users(id),
    submitted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at         TIMESTAMPTZ,
    due_at              TIMESTAMPTZ             -- auto-escalation deadline
);

CREATE TABLE approval_actions (
    id                  BIGSERIAL PRIMARY KEY,
    request_id          BIGINT NOT NULL REFERENCES approval_requests(id),
    step                INT NOT NULL,
    actor_id            BIGINT NOT NULL REFERENCES users(id),
    action              VARCHAR(20) NOT NULL,
        -- approve, reject, request_changes, escalate, delegate
    comment             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_approval_req_status ON approval_requests(status);
CREATE INDEX idx_approval_req_entity ON approval_requests(entity_type, entity_id);
```

#### Day 18-19: Communication Service + Compose API

**Backend files:**
```
model/
  Communication.java
  CommunicationRecipient.java

service/
  CommunicationService.java
  RenderService.java          — Handlebars template rendering
  DeliveryService.java        — channel-specific delivery (email, SMS)

rest/
  CommunicationResource.java
  ComposeResource.java
```

**Compose flow (API sequence):**
```
1. POST /api/drafts
   → Creates draft communication record
   → Returns draft ID

2. PUT /api/drafts/{id}
   → Updates template selection, recipients, variables, schedule
   → Validates incrementally

3. POST /api/drafts/{id}/preview
   → Renders template with variables for first 3 recipients
   → Returns rendered HTML/text

4. POST /api/drafts/{id}/validate
   → Full validation: template active, recipients valid, variables complete
   → Returns {valid: true} or {valid: false, errors: [...]}

5. POST /api/drafts/{id}/submit
   → If approval required: creates ApprovalRequest, status → pending_approval
   → If no approval: status → queued, publishes to Kafka
   → Returns communication ID
```

**Tasks:**
- [ ] Communication + CommunicationRecipient entities
- [ ] RenderService (Handlebars — render template + variables → HTML/text)
- [ ] CommunicationService (create, validate, submit, cancel)
- [ ] ComposeResource (drafts CRUD + preview + validate + submit)
- [ ] CommunicationResource (list, get, status)
- [ ] Seed 2 approval workflows
- [ ] Integration test: compose → preview → submit → queued

#### Day 20: Approval Workflow Engine

**Backend files:**
```
model/
  ApprovalWorkflow.java
  ApprovalRequest.java
  ApprovalAction.java

service/
  ApprovalService.java

rest/
  ApprovalResource.java
```

**API contract:**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/approvals` | editor+ | List pending approvals (for current user's role) |
| GET | `/api/approvals/{id}` | editor+ | Get with action history |
| POST | `/api/approvals/{id}/approve` | manager+ | Approve current step |
| POST | `/api/approvals/{id}/reject` | manager+ | Reject with comment |
| POST | `/api/approvals/{id}/request-changes` | manager+ | Send back with notes |
| POST | `/api/approvals/{id}/delegate` | manager+ | Delegate to another user |

**Flow logic in ApprovalService:**
```
approve():
  if (current_step < total_steps):
    advance to next step
    notify next approver
  else:
    mark approved
    trigger delivery (publish to Kafka)
    notify submitter

reject():
  mark rejected
  notify submitter with comment

request_changes():
  mark pending (stays on same step)
  notify submitter with change requests
```

**Tasks:**
- [ ] ApprovalWorkflow, ApprovalRequest, ApprovalAction entities
- [ ] ApprovalService with approve/reject/request-changes/delegate/escalate
- [ ] ApprovalResource with all endpoints
- [ ] Auto-escalation EJB timer (checks due_at every hour)
- [ ] Notification on each approval action
- [ ] Audit trail for all approval decisions

---

### Week 5: Delivery + Notifications

#### Day 21-22: Kafka Integration + Delivery Workers

**Kafka topics:**
```
comm.delivery       — communication delivery requests
comm.status         — delivery status updates (sent, failed, bounced)
notifications       — notification events
audit.events        — audit log entries (Phase 2 async migration)
```

**File: `backend/src/main/java/com/commhub/event/DeliveryProducer.java`**
```java
// Publishes delivery jobs to comm.delivery topic
// Message: {communicationId, recipientId, channel, renderedContent, priority}
```

**File: `backend/src/main/java/com/commhub/event/DeliveryConsumer.java`**
```java
// Consumes from comm.delivery
// Routes to channel-specific sender (EmailSender, SmsSender, etc.)
// Updates communication_recipients status
// Publishes status update to comm.status
// Retries with exponential backoff (max 3)
// Dead letter after 3 failures
```

**File: `backend/src/main/java/com/commhub/service/EmailSender.java`**
```java
// SendGrid API integration
// Sends rendered HTML email
// Returns delivery status + message ID
// Handles bounce/complaint webhooks
```

**Note:** For Phase 2, email via SendGrid is sufficient. SMS (Twilio), print, and portal delivery added in Phase 4.

**Tasks:**
- [ ] Kafka producer/consumer config in Liberty (MicroProfile Reactive Messaging or plain Kafka client)
- [ ] DeliveryProducer — publishes to `comm.delivery`
- [ ] DeliveryConsumer — processes deliveries
- [ ] EmailSender — SendGrid integration
- [ ] Status tracking (sent, delivered, failed, bounced)
- [ ] Retry logic with exponential backoff
- [ ] Dead letter queue handling
- [ ] Integration test: submit comm → Kafka → email sent → status updated

#### Day 23-24: Notification System

**Backend files:**
```
model/
  Notification.java

service/
  NotificationService.java

rest/
  NotificationResource.java

event/
  NotificationConsumer.java
```

**WebSocket endpoint:**
```java
@ServerEndpoint("/ws/notifications")
public class NotificationSocket {
    // On connect: register session by user ID
    // On notification: push to connected sessions
    // Heartbeat every 30 sec to keep alive
}
```

**Notification triggers (created by other services):**
```
ApprovalService.approve()  → notify submitter "Your comm was approved"
ApprovalService.reject()   → notify submitter "Your comm was rejected"
DeliveryConsumer.onSent()  → notify sender "Communication delivered to 150 recipients"
DeliveryConsumer.onFail()  → notify sender + admin "Delivery failed: ..."
TemplateService.publish()  → notify editors "Template X is now active"
```

**Tasks:**
- [ ] Notification entity
- [ ] NotificationService (create, markRead, markAllRead, getUserNotifications)
- [ ] NotificationResource (REST endpoints for list, mark-read, preferences)
- [ ] NotificationSocket (WebSocket push)
- [ ] Wire notification triggers into ApprovalService, DeliveryConsumer, TemplateService
- [ ] Frontend: reconnecting WebSocket hook
- [ ] Frontend: migrate NotificationCenter to use WebSocket + API

#### Day 25: Audit Trail (Async Migration)

**Tasks:**
- [ ] Migrate AuditService from direct DB insert → Kafka producer
- [ ] AuditConsumer: reads from `audit.events` topic, batch inserts
- [ ] Partition management: EJB timer to create next month's partition
- [ ] AuditResource with paginated list + filters + CSV/PDF export
- [ ] Frontend: migrate AuditTrail component to use API

---

### Week 6: Frontend Migration (Phase 2 Pages)

#### Day 26-28: Migrate Remaining Pages to API

**Migration checklist:**
- [ ] Compose wizard → uses `/api/drafts` + `/api/templates` + `/api/recipients`
- [ ] Communications list → uses `/api/communications`
- [ ] Approvals → uses `/api/approvals` + WebSocket for real-time updates
- [ ] Notification center → uses `/api/notifications` + WebSocket
- [ ] Audit trail → uses `/api/audit`

#### Day 29-30: End-to-End Testing + Polish

**Full flow test:**
```
1. Login as editor
2. Create template → save as draft
3. Edit template content → version 2 created
4. Publish template (requires approval)
5. Login as manager → see approval request
6. Approve → template now active
7. Login as editor → compose new comm
8. Select template, pick recipients, preview
9. Submit (requires approval)
10. Login as manager → approve
11. Communication sent via email
12. Check analytics → delivery stats
13. Check audit trail → all actions logged
14. Check notifications → alerts received
```

**Tasks:**
- [ ] Run full flow test above
- [ ] Fix any broken integrations
- [ ] API error handling in all frontend components
- [ ] Loading states and error states in every page
- [ ] Mobile-responsive layout check

---

## Phase 3: Intelligence (Weeks 7-9)

### Week 7: Analytics + Archive

#### Analytics Implementation

**File: `db/migrations/V010__create_analytics_views.sql`**
```sql
-- Materialized views for dashboard performance

CREATE MATERIALIZED VIEW daily_send_stats AS
SELECT
    DATE(c.sent_at) AS send_date,
    c.channel,
    COUNT(*) AS total_sent,
    SUM(CASE WHEN cr.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
    SUM(CASE WHEN cr.status = 'opened' THEN 1 ELSE 0 END) AS opened,
    SUM(CASE WHEN cr.status = 'failed' THEN 1 ELSE 0 END) AS failed
FROM communications c
JOIN communication_recipients cr ON cr.communication_id = c.id
WHERE c.status = 'sent'
GROUP BY DATE(c.sent_at), c.channel;

CREATE UNIQUE INDEX idx_dss_date_channel ON daily_send_stats(send_date, channel);

-- Refresh hourly via EJB timer
-- REFRESH MATERIALIZED VIEW CONCURRENTLY daily_send_stats;
```

**Tasks:**
- [ ] 4 materialized views (daily stats, channel performance, template engagement, failure rates)
- [ ] EJB timer to refresh views every hour
- [ ] AnalyticsResource with trend, breakdown, and export endpoints
- [ ] Email tracking pixel endpoint (`GET /api/track/{token}` — 1x1 GIF)
- [ ] Click tracking redirect (`GET /api/click/{token}` → original URL)
- [ ] Frontend: migrate Analytics page to use API (Recharts for charts)

#### Archive Implementation

**Tasks:**
- [ ] Archive table + full-text search index
- [ ] On send: store rendered output + generate PDF snapshot (S3)
- [ ] ArchiveResource with search, view, download
- [ ] Retention policy config + cleanup EJB timer
- [ ] Legal hold flag
- [ ] Frontend: migrate Archive page to use API

---

### Week 8: AI Assistant + A/B Testing

#### AI Content Assistant

**Tasks:**
- [ ] `POST /api/ai/analyze` — readability (local Flesch-Kincaid) + compliance (regex tier 1)
- [ ] `POST /api/ai/suggest` — Claude API for content improvement suggestions
- [ ] `POST /api/ai/generate` — Claude API for draft generation from prompt
- [ ] PII scrubber (strip real names/emails before sending to AI)
- [ ] Rate limiting (10 req/min per user)
- [ ] AI interaction audit logging
- [ ] Compliance rule engine (configurable regex patterns for prohibited content)
- [ ] Frontend: migrate AIAssistant panel to use API

#### A/B Testing Engine

**Tasks:**
- [ ] AB test tables
- [ ] ABTestService (create test, assign variants, collect results, declare winner)
- [ ] Chi-squared significance test
- [ ] Auto-send winner to remaining segment
- [ ] ABTestResource with full CRUD + results
- [ ] Frontend: migrate ABTesting page to use API

---

### Week 9: Scheduled Reports + Segments

#### Scheduled Reports

**Tasks:**
- [ ] Report schedule + run tables
- [ ] 4 report types: Delivery Summary, Channel Performance, Template Usage, Compliance Audit
- [ ] Report generator (EJB timer triggers, renders PDF/CSV, stores in S3)
- [ ] Email delivery of generated reports
- [ ] ReportResource (schedules CRUD + run history + download)
- [ ] Frontend: migrate ScheduledReports page

#### Recipient Segments

**Tasks:**
- [ ] Segment tables (dynamic + static)
- [ ] Criteria engine (parse JSONB rules → PostgreSQL WHERE clause)
- [ ] Preview endpoint (count + sample without creating)
- [ ] Integration with Compose (select segment as recipient source)
- [ ] SegmentResource with CRUD + preview
- [ ] Frontend: migrate Segments page

---

## Phase 4: Advanced (Weeks 10-12)

### Week 10: Customer Journey Engine

**Tasks:**
- [ ] Journey definition + touchpoint tables
- [ ] Member journey instance tracking
- [ ] Event-driven trigger system (enrollment, claim filed, etc.)
- [ ] Touchpoint execution (schedules comm sends based on journey stage)
- [ ] Pause/resume per member
- [ ] JourneyResource with visual builder data
- [ ] Frontend: migrate JourneyMap page (react-flow for visual editing)

### Week 11: Template Designer + Multi-Channel

**Tasks:**
- [ ] TipTap editor integration (replace textarea)
- [ ] Custom variable node extension
- [ ] Block-level JSON save/load
- [ ] MJML rendering for email channel
- [ ] PDF rendering for print channel
- [ ] Preset library (save/load designs)
- [ ] Image upload to S3
- [ ] SMS channel (Twilio integration)
- [ ] Print channel (PDF generation + mail vendor API)
- [ ] Frontend: migrate DragDropDesigner + TemplateEditor

### Week 12: Real-Time Dashboard + Hardening

**Tasks:**
- [ ] React-Grid-Layout for widget drag/resize
- [ ] WebSocket stream for live metric updates
- [ ] Widget config persistence (per user)
- [ ] All 8 widget types connected to real data
- [ ] Performance testing (1000 concurrent users, 100K recipients)
- [ ] Security audit (OWASP top 10, dependency scan)
- [ ] Rate limiting on all endpoints (Redis)
- [ ] API documentation review (OpenAPI 3.0)
- [ ] Deployment guide (Docker, K8s manifests)
- [ ] Runbook for operations team

---

## Total Deliverables by Phase

| Phase | Backend | Frontend | DB | Duration |
|-------|---------|----------|-----|----------|
| Phase 1 | 15 Java classes, 5 REST resources | Router + 2 page migrations | 5 migrations, 9 tables | 3 weeks |
| Phase 2 | 20 Java classes, 5 REST resources, Kafka | 5 page migrations, WebSocket | 3 migrations, 7 tables | 3 weeks |
| Phase 3 | 15 Java classes, 5 REST resources | 4 page migrations, charts | 3 migrations, 5 tables, 4 views | 3 weeks |
| Phase 4 | 12 Java classes, 3 REST resources | 3 page migrations, TipTap | 2 migrations, 4 tables | 3 weeks |
| **Total** | **~62 Java classes, 18 REST resources** | **14 page migrations** | **13 migrations, 25 tables** | **12 weeks** |

---

## Key Risks + Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Kafka complexity | Delays Phase 2 | Start with synchronous delivery, add Kafka later |
| Keycloak setup | Blocks all auth | Fallback: simple JWT issuer in Liberty (no IdP) |
| Email deliverability | Low open rates | SPF/DKIM/DMARC setup, dedicated IP, warm-up |
| Performance at scale | Slow with >100K recipients | Materialized views, pagination, async processing |
| TipTap learning curve | Delays designer | Keep current textarea as fallback, add TipTap incrementally |
| Scope creep | Pushes timeline | Each phase has clear deliverables, demo at end of each |

---

## Decision Log

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| 1 | PostgreSQL over MySQL | JSONB, full-text search, partitioning, better for analytics | 2026-03-12 |
| 2 | Kafka over RabbitMQ | Event sourcing, replay capability, higher throughput | 2026-03-12 |
| 3 | Keycloak over Auth0 | Self-hosted, no per-user costs, SAML for enterprise SSO | 2026-03-12 |
| 4 | Zustand over Redux | Less boilerplate, simpler mental model, sufficient for our needs | 2026-03-12 |
| 5 | React Query over SWR | Better DevTools, mutation support, pagination helpers | 2026-03-12 |
| 6 | Handlebars over custom | Battle-tested, logic-less, same engine across channels | 2026-03-12 |
| 7 | TipTap over Draft.js | Active development, better API, extensible, ProseMirror base | 2026-03-12 |
| 8 | MJML for email | Handles email client rendering quirks automatically | 2026-03-12 |

---

*Detailed plan by Alec — March 12, 2026*
*Review and update after each phase demo.*
