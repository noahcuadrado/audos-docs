# Workspace Reminder Templates Module - Feature Summary

## Overview

A comprehensive template-based reminder system for scheduling notifications with complex timing configurations. Supports multiple timing types, target types, AI-generated content using GPT-4o-mini, multi-channel delivery, and automatic application to new sessions.

---

## Database Schema

**Table: `workspace_reminder_templates`**

| Column | Type | Description |
|--------|------|-------------|
| `id` | varchar (UUID) | Primary key |
| `workspaceId` | varchar | Foreign key to workspace (cascade delete) |
| `workspaceSessionId` | varchar | Foreign key to session (set null on delete) |
| `workspaceSessionUuid` | varchar | Session UUID reference |
| `name` | varchar(255) | Template name |
| `description` | text | Template description |
| `status` | varchar(50) | `pending`, `active`, `sent`, `cancelled` |
| `reason` | text | Status change reason |
| `target` | jsonb | Target configuration |
| `delivery` | jsonb | Delivery channel config |
| `content` | jsonb | Message content config |
| `when` | jsonb | Timing configuration |
| `autoApply` | jsonb | Auto-apply settings |
| `nextReminderAt` | timestamp | Next scheduled fire time |
| `lastReminderAt` | timestamp | Last fired time |
| `createdAt` | timestamp | Creation time |
| `updatedAt` | timestamp | Last update time |

**Indexes:**
- `workspaceId` - Fast workspace lookup
- `status` - Efficient status filtering
- `workspaceSessionId` / `workspaceSessionUuid` - Session filtering
- `nextReminderAt` - Due reminder queries

---

## Timing Types (`when`)

### Fixed Time (`at`)
Fire at a specific date and time.
```json
{
  "type": "at",
  "datetime": "2024-12-25 09:00",
  "timezone": "America/New_York"
}
```

### Relative Delay (`in`)
Fire after a duration from creation.
```json
{
  "type": "in",
  "duration": { "value": 30, "unit": "mins" }
}
```

### After Inactivity (`after_inactivity`)
Fire after user inactivity period. Resets on activity.
```json
{
  "type": "after_inactivity",
  "duration": { "value": 24, "unit": "hours" }
}
```

### Natural Language (`natural`)
Parse human-readable expressions.
```json
{
  "type": "natural",
  "expression": "tomorrow at 3pm"
}
```
Supported: "in 5 minutes", "tomorrow at noon", "next monday 9am"

### Recurring (`recurring`)
Repeat on schedule. Stays active after firing.
```json
{
  "type": "recurring",
  "interval": { "every": 1, "unit": "days" },
  "at": "09:00",
  "start": "now"
}
```

Weekly with specific days:
```json
{
  "type": "recurring",
  "interval": { "every": 1, "unit": "weeks", "on": [1, 3, 5] },
  "at": "10:00"
}
```

---

## Target Types

| Type | Description |
|------|-------------|
| `session` | Single session by ID |
| `sessions` | Multiple sessions by IDs (max 1000) |
| `all_sessions` | All workspace sessions (with optional exclusions) |

---

## Delivery Channels

| Channel | Description |
|---------|-------------|
| `current` | Browser/WebSocket (maps to session chat) |
| `email` | Email delivery |
| `instagram` | Instagram DM |
| `all` | All channels |

---

## Content Types

| Type | Description |
|------|-------------|
| `text` | Static message text |
| `prompt` | AI-generated using GPT-4o-mini |

---

## Auto-Apply System

Automatically creates reminder instances for new sessions.

```json
{
  "autoApply": {
    "enabled": true,
    "apply_to_new_sessions": true
  }
}
```

**Eligible timing types:** `in`, `after_inactivity`, `recurring`

---

## Background Processor

Runs on 60-second intervals to process due reminders.

### Features
- Batch processing (50 reminders per batch)
- AI content generation with GPT-4o-mini
- Real-time WebSocket delivery via `sendAsyncAssistantMessage()`
- Automatic status transitions
- Inactivity reminder updates

### Processor Methods
- `start()` - Start background processing
- `stop()` - Stop processing
- `processNextBatch()` - Manual trigger
- `processInactivityReminders()` - Update inactivity-based times
- `getStats()` - Get processor statistics

---

## Service Methods

### Template CRUD
- `create(input)` - Create new template
- `getById(id)` - Get by ID
- `getByWorkspace(workspaceId, filters)` - List with filters
- `update(id, input)` - Update template
- `delete(id)` - Delete template

### Status Management
- `updateStatus(id, input)` - Change status with reason
- `activate(id)` - Set to active
- `cancel(id, reason)` - Cancel with reason
- `markSent(id)` - Mark as sent
- `markFired(id)` - Process firing (handles recurring)

### Query Methods
- `getActiveTemplates(workspaceId)` - Get active templates
- `getPendingTemplates(workspaceId)` - Get pending templates
- `getDueReminders(beforeTime)` - Get due for processing
- `getBySessionUuid(workspaceId, sessionUuid)` - Get by session

### Auto-Apply Methods
- `getAutoApplyTemplates(workspaceId)` - Get auto-apply enabled
- `applyTemplatesToNewSession(workspaceId, sessionId, sessionUuid)` - Apply to new session
- `applyTemplateToExistingSessions(template)` - Apply to existing sessions
- `reapplyTemplateToSessions(id)` - Reapply to sessions
- `getAutoAppliedRemindersForSession(sessionId)` - Get applied reminders

### Time Calculation
- `calculateNextReminderAt(when, options)` - Calculate next fire time
- `calculateNextRecurringOccurrence(when, lastFiredAt)` - Next recurring time
- `updateNextReminderForInactivity(id, lastActivityAt)` - Update for activity
- `recalculateNextReminder(id)` - Recalculate from current time

---

## REST API Endpoints

### Processor Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/processor/stats` | Get processor statistics |
| POST | `/processor/start` | Start processor |
| POST | `/processor/stop` | Stop processor |
| POST | `/processor/run-now` | Trigger immediate batch |

### Auto-Apply

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:workspaceId/auto-apply` | List auto-apply templates |
| POST | `/:workspaceId/auto-apply/session` | Apply to new session |
| GET | `/:workspaceId/session/:sessionId/auto-applied` | Get applied reminders |

### Template CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/:workspaceId` | List templates (with filters) |
| GET | `/:workspaceId/:id` | Get single template |
| POST | `/:workspaceId` | Create template |
| PUT | `/:workspaceId/:id` | Update template |
| DELETE | `/:workspaceId/:id` | Delete template |

### Status & Actions

| Method | Endpoint | Description |
|--------|----------|-------------|
| PATCH | `/:workspaceId/:id/status` | Update status |
| POST | `/:workspaceId/:id/activate` | Activate template |
| POST | `/:workspaceId/:id/cancel` | Cancel template |
| POST | `/:workspaceId/:id/apply-to-sessions` | Apply to existing sessions |
| GET | `/:workspaceId/:templateId/reminders` | Get reminders from template |
| POST | `/:workspaceId/update-inactivity` | Update inactivity times |

---

## Message Delivery Flow

1. **Processor checks** for due reminders every 60 seconds
2. **Resolves target sessions** based on target configuration
3. **Generates content** (static text or AI via GPT-4o-mini)
4. **Delivers message** via `sendAsyncAssistantMessage()`
   - Inserts into `workspace_session_messages`
   - Broadcasts via WebSocket for real-time display
5. **Updates template** status and next reminder time
6. **Creates reminder record** in `workspace_reminders` table

---

## Status Lifecycle

```
pending → active → sent (one-time)
pending → active → active (recurring - stays active)
pending → cancelled (manual cancel)
active → cancelled (manual cancel)
```
