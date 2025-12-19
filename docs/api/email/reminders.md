# Workspace Reminders System Documentation

**Date:** December 9, 2025  
**Status:** Production  
**Related Feature Request:** Game Recap Alerts (FanForge Studio Agent)

---

## Overview

The Workspace Reminders System is a PostgreSQL-backed scheduling infrastructure for delivering timed notifications to workspace sessions. It supports multi-channel delivery (browser, email, Instagram), AI-generated content, and template-based recurring schedules.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKSPACE REMINDERS SYSTEM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐     ┌─────────────────────┐                   │
│  │  API Routes      │────▶│  Reminder Service   │                   │
│  │  /api/workspace- │     │  (CRUD operations)  │                   │
│  │  reminders/      │     └──────────┬──────────┘                   │
│  └──────────────────┘                │                               │
│                                      ▼                               │
│                         ┌────────────────────────┐                   │
│                         │  workspace_reminders   │                   │
│                         │  (PostgreSQL table)    │                   │
│                         └────────────┬───────────┘                   │
│                                      │                               │
│                                      ▼                               │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Background Processor (runs every 60 seconds)                 │   │
│  │  - Queries pending reminders where nextReminderAt <= now      │   │
│  │  - Processes in batches of 50                                 │   │
│  │  - Supports AI-generated content with [AI-PROMPT] prefix      │   │
│  │  - Delivers via workspaceSessionService.sendAsyncMessage()    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### workspace_reminders Table

```typescript
workspace_reminders {
  id: varchar (primary key, auto-generated UUID)
  uuid: varchar (unique, format: "reminder-{uuid}")
  workspaceId: varchar (FK → workspaces.id, required)
  workspaceSessionId: varchar? (FK → workspace_sessions.id)
  workspaceSessionUuid: varchar?
  templateId: varchar? (FK → workspace_reminder_templates.id)
  autoApplied: boolean (default: false)
  contextType: "end_agent" | "otto" | "landing_page_agent" | "ads_agent"
  channel: "instagram" | "email" | "browser" (default: "browser")
  username: text?
  nextReminderAt: timestamp (when to fire)
  lastReminderAt: timestamp
  status: "pending" | "sent" | "failed" | "cancelled" (default: "pending")
  message: text (required - can use [AI-PROMPT] prefix for AI generation)
  createdAt: timestamp
  updatedAt: timestamp
  deletedAt: timestamp? (soft delete)
}
```

### Indexes

- `workspace_reminders_workspace_id_idx` - workspace lookup
- `workspace_reminders_workspace_session_id_idx` - session lookup
- `workspace_reminders_workspace_session_uuid_idx` - session UUID lookup
- `workspace_reminders_status_idx` - status filtering
- `workspace_reminders_next_reminder_at_idx` - scheduling queries
- `workspace_reminders_pending_idx` - composite (status, nextReminderAt) for processor
- `workspace_reminders_template_id_idx` - template lookup

---

## API Endpoints

### Base Path: `/api/workspace-reminders`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/` | Create a new reminder |
| `GET` | `/workspace/:workspaceId` | List reminders by workspace |
| `GET` | `/session/:sessionId` | List reminders by session ID |
| `GET` | `/session/uuid/:workspaceId/:sessionUuid` | List by session UUID |
| `GET` | `/pending` | Get all pending reminders (for processor) |
| `GET` | `/upcoming/:workspaceId` | Get upcoming reminders (next N hours) |
| `GET` | `/count/pending` | Count pending reminders |
| `GET` | `/:id` | Get reminder by ID |
| `GET` | `/uuid/:uuid` | Get reminder by UUID |
| `PATCH` | `/:id` | Update reminder by ID |
| `PATCH` | `/uuid/:uuid` | Update reminder by UUID |
| `DELETE` | `/:id` | Delete reminder by ID |
| `DELETE` | `/uuid/:uuid` | Delete reminder by UUID |
| `POST` | `/:id/cancel` | Cancel reminder by ID |
| `POST` | `/uuid/:uuid/cancel` | Cancel reminder by UUID |
| `POST` | `/:id/reschedule` | Reschedule reminder |
| `POST` | `/uuid/:uuid/reschedule` | Reschedule by UUID |

### Create Reminder Request

```json
POST /api/workspace-reminders/
{
  "workspaceId": "ws-123",
  "workspaceSessionId": "session-456",
  "workspaceSessionUuid": "sess-uuid-789",
  "contextType": "otto",
  "channel": "email",
  "username": "john@example.com",
  "nextReminderAt": "2025-01-16T08:00:00.000Z",
  "message": "Don't forget to check your game recap!"
}
```

### AI-Generated Message

```json
POST /api/workspace-reminders/
{
  "workspaceId": "ws-123",
  "workspaceSessionId": "session-456",
  "message": "[AI-PROMPT] Generate a friendly reminder about the Kansas City Chiefs game highlights from yesterday"
}
```

When the processor fires this reminder, it will:
1. Detect the `[AI-PROMPT]` prefix
2. Call GPT-4o-mini to generate the actual message
3. Update the database with the generated content
4. Deliver the generated message to the session

---

## Background Processor

### Configuration

```typescript
const DEFAULT_CONFIG = {
  intervalMs: 60000,  // Check every 60 seconds
  batchSize: 50,      // Process 50 reminders per batch
  enabled: true
};
```

### Processing Flow

1. **Query**: Fetch reminders where `status = 'pending'` AND `nextReminderAt <= NOW()`
2. **Batch**: Process up to 50 reminders per cycle
3. **AI Check**: If message starts with `[AI-PROMPT]`, generate content via GPT-4o-mini
4. **Deliver**: Call `workspaceSessionService.sendAsyncAssistantMessage()`
5. **Update**: Mark reminder as `sent` or `failed`

### Delivery Channels

- **browser**: Sends message to active WebSocket session
- **email**: Sends via configured email provider
- **instagram**: Sends via Instagram messaging API

---

## Reminder Templates System

Separate system for recurring/reusable reminder patterns.

### Template Schema

```typescript
workspace_reminder_templates {
  id: varchar (primary key)
  uuid: varchar (unique)
  workspaceId: varchar (FK)
  name: text
  targetType: "session" | "user" | "contact" | "workspace"
  timingType: "fixed" | "relative_to_start" | "relative_to_end" | "inactivity" | "recurring"
  timingConfig: jsonb (e.g., { "rrule": "FREQ=DAILY;BYHOUR=8" })
  contentType: "text" | "prompt"
  message: text
  channel: "instagram" | "email" | "browser"
  enabled: boolean
  autoApply: boolean
  autoApplyFilters: jsonb?
  nextReminderAt: timestamp
  lastReminderAt: timestamp
  createdAt, updatedAt
}
```

### Timing Types

- **fixed**: Fire at a specific datetime
- **relative_to_start**: Fire N minutes/hours after session start
- **relative_to_end**: Fire N minutes/hours after session end
- **inactivity**: Fire after N minutes of no activity
- **recurring**: Fire on a schedule (daily, weekly, etc.)

---

## Related Files

| File | Purpose |
|------|---------|
| `server/routes/api/workspace-reminders.routes.ts` | API endpoints |
| `server/services/workspace-reminder.service.ts` | CRUD operations |
| `server/services/workspace-reminder-processor.service.ts` | Background processor |
| `server/routes/api/workspace-reminder-templates.routes.ts` | Template endpoints |
| `server/services/workspace-reminder-templates.service.ts` | Template CRUD |
| `server/services/reminder-template-processor.service.ts` | Template processor |
| `shared/schema.ts` | Database schema (lines ~2462-2552) |

---

## Gap Analysis: Studio Agent Feature Request

### What They Need vs What We Have

| Requirement | Current System | Gap |
|-------------|----------------|-----|
| `POST /api/scheduled-tasks` | `POST /api/workspace-reminders` | Different API shape |
| Task chaining (search → video → save → email) | Individual endpoints exist | No orchestration |
| CRUD for tasks | Full CRUD on reminders | API alias needed |
| Cron/recurring | RRULE in templates | Already supported |

### Their Requested Payload

```json
{
  "taskType": "game_recap_alert",
  "alertId": "alert-123456789",
  "teamName": "Kansas City Chiefs",
  "sport": "NFL",
  "frequency": "daily",
  "deliveryMethod": "in_app",
  "email": "user@example.com",
  "nextRun": "2025-01-16T08:00:00.000Z",
  "enabled": true
}
```

### Proposed Solutions

**Option A: Webhook Callback (Low effort)**
Add `webhookUrl` field to reminders. When fired, POST to webhook instead of sending session message.

**Option B: Task Wrapper API (Medium effort)**
Create `/api/scheduled-tasks` as thin wrapper over reminders with task-specific fields.

**Option C: Orchestration Layer (High effort)**
Build task runner that executes multi-step workflows as single scheduled job.

---

## Usage Examples

### Create a One-Time Reminder

```javascript
const response = await fetch('/api/workspace-reminders/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workspaceId: 'ws-fanforge-123',
    workspaceSessionId: 'session-user-456',
    channel: 'email',
    nextReminderAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    message: 'Your Chiefs game recap is ready!'
  })
});
```

### Create a Recurring Template

```javascript
const response = await fetch('/api/workspace-reminder-templates/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workspaceId: 'ws-fanforge-123',
    name: 'Daily Game Alerts',
    targetType: 'session',
    timingType: 'recurring',
    timingConfig: { rrule: 'FREQ=DAILY;BYHOUR=8;BYMINUTE=0' },
    contentType: 'prompt',
    message: '[AI-PROMPT] Generate an exciting message about today\'s game highlights',
    channel: 'email',
    enabled: true,
    autoApply: true
  })
});
```

---

## Next Steps

1. Review this documentation with the FanForge team
2. Decide on preferred solution (A, B, or C)
3. Implement chosen approach
4. Update integration docs for Studio agents
