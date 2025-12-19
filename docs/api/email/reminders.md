---
id: reminders
title: Reminder Templates API
sidebar_label: Reminders API
sidebar_position: 2
---

# Reminder Templates API

> **Status:** ✅ Documented  
> **Trello Card:** [Reminder System](https://trello.com/c/xyz)  
> **Postman:** [Reminder Templates API Collection](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-98426b39-823f-4f20-a4c0-aec37eea2d07)

## Overview

Workspace Reminder Templates system for scheduling and delivering automated reminders. Supports multiple timing types, targeting options, content types, and delivery channels.

**Base URL:** `/api/reminder-templates`

---

## Table of Contents

1. [CRUD Operations](#crud-operations)
2. [When Types (Timing)](#when-types)
3. [Target Types](#target-types)
4. [Content Types](#content-types)
5. [Delivery Channels](#delivery-channels)
    - [Current (Browser)](#current-browser)
    - [Email](#email-1)
    - [Instagram](#instagram-1)
6. [Status Workflow](#status-workflow)
7. [Processor Control](#processor-control)
8. [Auto Apply](#auto-apply)

---

## CRUD Operations

### List Templates

**Endpoint:** `GET /api/reminder-templates/:workspaceId`

Get all reminder templates for a workspace.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter: `pending`, `active`, `sent`, `cancelled` |

#### Response

```json
{
  "templates": [
    {
      "id": "rtpl_abc123",
      "name": "Daily Morning Reminder",
      "status": "active",
      "nextReminderAt": "2025-12-16T09:00:00Z",
      ...
    }
  ]
}
```

---

### Get Template by ID

**Endpoint:** `GET /api/reminder-templates/:workspaceId/:templateId`

Get a specific reminder template by ID.

---

### Create Template

**Endpoint:** `POST /api/reminder-templates/:workspaceId`

Create a new reminder template.

#### Request Body Structure

```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "target": {
    "type": "session | sessions | all_sessions",
    "session_id": "string (for type: session)",
    "session_ids": ["array (for type: sessions)"],
    "exclude": ["array (for type: all_sessions)"]
  },
  "delivery": {
    "channel": "current | email | instagram | all"
  },
  "content": {
    "type": "text | prompt",
    "value": "string"
  },
  "when": {
    "type": "at | in | after_inactivity | natural | recurring",
    ...
  },
  "autoApply": {
    "enabled": true,
    "apply_to_new_sessions": true
  }
}
```

---

### Update Template

**Endpoint:** `PATCH /api/reminder-templates/:workspaceId/:templateId`

Update an existing template.

---

### Delete Template

**Endpoint:** `DELETE /api/reminder-templates/:workspaceId/:templateId`

Delete a reminder template.

---

## When Types

### 1. When At (Specific DateTime)

Fire at a specific date and time.

```json
{
  "name": "Specific DateTime Reminder",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "current" },
  "content": {
    "type": "text",
    "value": "This is your scheduled reminder!"
  },
  "when": {
    "type": "at",
    "datetime": "2025-12-25 10:00",
    "timezone": "UTC"
  }
}
```

---

### 2. When In (Duration)

Fire after a specified duration from creation.

**30 Minutes:**
```json
{
  "name": "30 Minute Reminder",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "current" },
  "content": {
    "type": "text",
    "value": "30 minutes have passed!"
  },
  "when": {
    "type": "in",
    "duration": {
      "value": 30,
      "unit": "mins"
    }
  }
}
```

**2 Hours:**
```json
{
  "when": {
    "type": "in",
    "duration": { "value": 2, "unit": "hours" }
  }
}
```

**7 Days:**
```json
{
  "when": {
    "type": "in",
    "duration": { "value": 7, "unit": "days" }
  }
}
```

---

### 3. When After Inactivity

Fire after user inactivity period.

**30 Minutes Inactivity:**
```json
{
  "name": "Inactivity Reminder (30 mins)",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "current" },
  "content": {
    "type": "text",
    "value": "We noticed you've been away. Need any help?"
  },
  "when": {
    "type": "after_inactivity",
    "duration": {
      "value": 30,
      "unit": "mins"
    }
  }
}
```

**2 Hours Inactivity (via Email):**
```json
{
  "name": "Inactivity Reminder (2 hours)",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "email" },
  "content": {
    "type": "text",
    "value": "We miss you! Come back and continue where you left off."
  },
  "when": {
    "type": "after_inactivity",
    "duration": {
      "value": 2,
      "unit": "hours"
    }
  }
}
```

---

### 4. When Natural (Natural Language)

Use natural language time expressions.

**Tomorrow at 3pm:**
```json
{
  "name": "Natural Language Reminder",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "current" },
  "content": {
    "type": "text",
    "value": "Time for your afternoon check-in!"
  },
  "when": {
    "type": "natural",
    "expression": "tomorrow at 3pm",
    "timezone": "America/New_York"
  }
}
```

**In 1 Hour:**
```json
{
  "when": {
    "type": "natural",
    "expression": "in 1 hour",
    "timezone": "UTC"
  }
}
```

---

### 5. When Recurring

Set up recurring reminders with various intervals.

#### Hourly Recurring

**Every 2 Hours:**
```json
{
  "name": "Recurring Every 2 Hours",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "current" },
  "content": {
    "type": "text",
    "value": "Time for your bi-hourly check-in!"
  },
  "when": {
    "type": "recurring",
    "interval": {
      "every": 2,
      "unit": "hours"
    },
    "start": "now"
  }
}
```

**Hourly with Delayed Start:**
```json
{
  "when": {
    "type": "recurring",
    "interval": {
      "every": 1,
      "unit": "hours"
    },
    "start": {
      "in": {
        "value": 30,
        "unit": "mins"
      }
    }
  }
}
```

#### Daily Recurring

**Daily at 9am:**
```json
{
  "name": "Daily Morning Reminder",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "email" },
  "content": {
    "type": "text",
    "value": "Good morning! Here's your daily reminder."
  },
  "when": {
    "type": "recurring",
    "interval": {
      "every": 1,
      "unit": "days"
    },
    "at": "09:00",
    "timezone": "America/New_York"
  }
}
```

**Every 3 Days:**
```json
{
  "when": {
    "type": "recurring",
    "interval": {
      "every": 3,
      "unit": "days"
    },
    "at": "14:30",
    "timezone": "UTC"
  }
}
```

#### Weekly Recurring

**Mon, Wed, Fri at 10am:**
```json
{
  "name": "Mon Wed Fri Reminder",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "email" },
  "content": {
    "type": "text",
    "value": "It's a check-in day!"
  },
  "when": {
    "type": "recurring",
    "interval": {
      "every": 1,
      "unit": "weeks",
      "on": [1, 3, 5]
    },
    "at": "10:00",
    "timezone": "America/New_York"
  }
}
```

**Days of Week:** `1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun`

**Weekdays at 8am:**
```json
{
  "when": {
    "type": "recurring",
    "interval": {
      "every": 1,
      "unit": "weeks",
      "on": [1, 2, 3, 4, 5]
    },
    "at": "08:00",
    "timezone": "UTC"
  }
}
```

---

## Target Types

### Single Session

Target a specific session by ID.

```json
{
  "target": {
    "type": "session",
    "session_id": "wses_abc123"
  }
}
```

### Multiple Sessions

Target multiple specific sessions.

```json
{
  "target": {
    "type": "sessions",
    "session_ids": ["session-id-1", "session-id-2", "session-id-3"]
  }
}
```

### All Sessions

Target all sessions in the workspace.

```json
{
  "target": {
    "type": "all_sessions"
  }
}
```

### All Sessions with Exclusions

Target all sessions except specified ones.

```json
{
  "target": {
    "type": "all_sessions",
    "exclude": ["session-to-exclude-1", "session-to-exclude-2"]
  }
}
```

---

## Content Types

### Text Content

Direct text message sent exactly as written.

```json
{
  "content": {
    "type": "text",
    "value": "This is a direct text message that will be sent exactly as written."
  }
}
```

### Prompt Content (AI-Generated)

Use AI to generate the reminder message.

```json
{
  "content": {
    "type": "prompt",
    "value": "Generate a friendly and motivational reminder to check in on their progress. Keep it brief and encouraging, under 50 words."
  }
}
```

---

## Delivery Channels

### Current (Browser)

Deliver to user's current browser session.

```json
{
  "delivery": {
    "channel": "current"
  }
}
```

### Email

Deliver via email.

```json
{
  "delivery": {
    "channel": "email"
  }
}
```

### Instagram

Deliver automated reminders via Instagram DM.

**Requirements:**
- The target contact or session must have a valid `ig_user_id` populated in the `funnel_contacts` or `workspace_sessions` table.
- The workspace must have the Meta/Instagram integration configured.
- The `AUDOS_API_KEY` environment variable must be correctly set for the reminder processor.

```json
{
  "delivery": {
    "channel": "instagram"
  }
}
```

#### Behavior
- **Contact Reminders:** When a `funnelContactId` is specified, the `deliverInstagramReminder()` method uses `metaService.sendInstagramMessage()` to route the message using the contact's `ig_user_id`.
- **Session Reminders:** When a `workspaceSessionId` is specified, the `deliverInstagramSessionReminder()` method delivers the DM using the session's Instagram context.
- **Deduplication & Validation:** The system ensures that either a `sessionId` or `contactId` is provided before attempting the Meta API call.

### All Channels

Deliver through all available channels.

```json
{
  "delivery": {
    "channel": "all"
  }
}
```

---

## Status Workflow

### Template Statuses

| Status | Description |
|--------|-------------|
| `pending` | Created but not yet active |
| `active` | Active and will fire at scheduled time |
| `sent` | Reminder has been sent |
| `cancelled` | Template cancelled by user |

### Status Transitions

```
pending → active → sent
           ↓
       cancelled
```

### Activate Template

**Endpoint:** `POST /api/reminder-templates/:workspaceId/:templateId/activate`

Activate a pending template so it can be processed.

### Cancel Template

**Endpoint:** `POST /api/reminder-templates/:workspaceId/:templateId/cancel`

Cancel a template with an optional reason.

```json
{
  "reason": "No longer needed"
}
```

### Mark as Fired

**Endpoint:** `POST /api/reminder-templates/:workspaceId/:templateId/fire`

Manually mark a template as fired. Updates timestamps and schedules next occurrence for recurring templates.

---

## Processor Control

The background processor handles reminder scheduling and delivery.

### Get Processor Stats

**Endpoint:** `GET /api/reminder-templates/processor/stats`

Get the current status of the background reminder processor.

```json
{
  "running": true,
  "interval": 60000,
  "pendingCount": 15,
  "lastRunAt": "2025-12-16T09:00:00Z"
}
```

### Start Processor

**Endpoint:** `POST /api/reminder-templates/processor/start`

Start the background reminder processor.

### Stop Processor

**Endpoint:** `POST /api/reminder-templates/processor/stop`

Stop the background reminder processor.

### Run Processor Now

**Endpoint:** `POST /api/reminder-templates/processor/run-now`

Manually trigger the processor to run immediately and process due reminders.

---

## Auto Apply

Templates can automatically apply to new sessions.

### Create with Auto Apply

```json
{
  "name": "Auto-Apply Welcome Reminder",
  "description": "Automatically applies to new sessions",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "current" },
  "content": {
    "type": "text",
    "value": "Welcome! Let us know if you need any help."
  },
  "when": {
    "type": "in",
    "duration": { "value": 5, "unit": "mins" }
  },
  "autoApply": {
    "enabled": true,
    "apply_to_new_sessions": true
  }
}
```

---

## Complex Examples

### Daily AI Newsletter

Daily email with AI-generated content to all sessions.

```json
{
  "name": "Daily AI Newsletter",
  "description": "Daily email with AI-generated content",
  "target": { "type": "all_sessions" },
  "delivery": { "channel": "email" },
  "content": {
    "type": "prompt",
    "value": "Generate a brief, engaging daily tip about productivity. Keep it under 100 words and include an actionable suggestion."
  },
  "when": {
    "type": "recurring",
    "interval": { "every": 1, "unit": "days" },
    "at": "08:00",
    "timezone": "America/New_York"
  },
  "autoApply": {
    "enabled": true,
    "apply_to_new_sessions": true
  }
}
```

### Personalized Inactivity Follow-up

Inactivity-triggered reminder to a single user via all channels with AI content.

```json
{
  "name": "Personal Follow-up",
  "description": "Personalized follow-up after inactivity",
  "target": {
    "type": "session",
    "session_id": "wses_abc123"
  },
  "delivery": { "channel": "all" },
  "content": {
    "type": "prompt",
    "value": "Generate a warm, personalized check-in message for someone who hasn't engaged in a while. Be friendly and offer help without being pushy."
  },
  "when": {
    "type": "after_inactivity",
    "duration": { "value": 24, "unit": "hours" }
  }
}
```

### Weekly Team Broadcast (Exclude Admins)

Weekly Friday email to all users except admins.

```json
{
  "name": "Weekly Team Update",
  "description": "Weekly update for non-admin users",
  "target": {
    "type": "all_sessions",
    "exclude": ["admin-session-1", "admin-session-2"]
  },
  "delivery": { "channel": "email" },
  "content": {
    "type": "text",
    "value": "Here's your weekly progress summary! Keep up the great work."
  },
  "when": {
    "type": "recurring",
    "interval": {
      "every": 1,
      "unit": "weeks",
      "on": [5]
    },
    "at": "17:00",
    "timezone": "America/New_York"
  }
}
```

---

## Update Operations

### Update Template Name

```json
PATCH /api/reminder-templates/:workspaceId/:templateId

{
  "name": "Updated Reminder Name"
}
```

### Update Template Content

```json
PATCH /api/reminder-templates/:workspaceId/:templateId

{
  "content": {
    "type": "text",
    "value": "Updated reminder message!"
  }
}
```

### Reschedule Template

```json
PATCH /api/reminder-templates/:workspaceId/:templateId

{
  "when": {
    "type": "in",
    "duration": {
      "value": 60,
      "unit": "mins"
    }
  }
}
```

### Update Inactivity Timestamp

**Endpoint:** `POST /api/reminder-templates/:workspaceId/update-inactivity`

Update inactivity-based reminder timestamps when user activity is detected.

```json
{
  "lastActivityAt": "2025-12-05T12:00:00Z"
}
```

---

## Duration Units

| Unit | Description |
|------|-------------|
| `mins` | Minutes |
| `hours` | Hours |
| `days` | Days |
| `weeks` | Weeks |

---

## Database Schema

```sql
CREATE TABLE reminder_templates (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target JSONB NOT NULL,
  delivery JSONB NOT NULL,
  content JSONB NOT NULL,
  when_config JSONB NOT NULL,
  auto_apply JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  next_reminder_at TIMESTAMP,
  last_fired_at TIMESTAMP,
  fire_count INTEGER DEFAULT 0,
  cancelled_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_workspace (workspace_id),
  INDEX idx_status (status),
  INDEX idx_next_reminder (next_reminder_at)
);
```

---

## Related Documentation

- [Mailgun Email API](./mailgun.md) - Email sending integration
- [Session Management](../../architecture/sessions.md) - Session targeting
- [WebSocket Integration](../websocket/README.md) - Real-time delivery

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 2025  
**Maintained By:** Backend Team