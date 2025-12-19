---
id: contacts-sessions
title: Contacts & Sessions Relationship
sidebar_label: Contacts ↔ Sessions
sidebar_position: 1
---

# Contacts & Sessions Relationship

> **Status:** ✅ Documented  
> **Trello Card:** [Implement relationship between funnel_contacts and workspace_sessions](https://trello.com/c/0g8tGBdR/3176)

## Overview

This document describes the relationship between the `funnel_contacts` and `workspace_sessions` modules, enabling user journey tracking across the system.

## Relationship Details

### Primary-Foreign Key Structure

```sql
-- Primary Identifier
workspace_sessions.id (e.g., "wses_abc123")

-- Foreign Key
funnel_contacts.workspace_session_id → workspace_sessions.id
```

### Characteristics

| Aspect | Details |
|--------|---------|
| **Type** | One-to-One (Contact → Session) |
| **Nullable** | Yes (contact can exist before session) |
| **On Delete** | SET NULL (prevents orphaned records) |
| **Indexed** | Yes (for efficient queries) |

## Database Schema

### Migration: `0023_add_workspace_session_to_contacts.sql`

```sql
-- Add nullable foreign key column to funnel_contacts
ALTER TABLE funnel_contacts 
ADD COLUMN workspace_session_id VARCHAR(255) 
REFERENCES workspace_sessions(id) 
ON DELETE SET NULL;

-- Create index for efficient queries
CREATE INDEX idx_funnel_contacts_workspace_session 
ON funnel_contacts(workspace_session_id);
```

### Schema Definition (Drizzle ORM)

```typescript
// shared/schema.ts

// funnel_contacts table with session reference
export const funnelContacts = pgTable('funnel_contacts', {
  id: varchar('id', { length: 255 }).primaryKey(),
  // ... other fields
  workspaceSessionId: varchar('workspace_session_id', { length: 255 })
    .references(() => workspaceSessions.id, { onDelete: 'set null' }),
});

// Relations
export const funnelContactsRelations = relations(funnelContacts, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [funnelContacts.workspaceId],
    references: [workspaces.id]
  }),
  workspaceSession: one(workspaceSessions, {
    fields: [funnelContacts.workspaceSessionId],
    references: [workspaceSessions.id]
  })
}));
```

## Insertion Order

The relationship follows a specific creation order:

```
1. Contact Created (user submits email)
   └─ funnel_contact created
   └─ workspace_session_id = NULL

2. Session Created (user starts chatting)
   └─ workspace_session created
   └─ Contact linked via updateFunnelContact()

3. Relationship Established
   └─ funnel_contacts.workspace_session_id = workspace_sessions.id
```

### Sequence Diagram

```
User                Space Route              Database
 │                      │                        │
 ├─ Submit Email ───────►│                       │
 │                      ├─ createFunnelContact()─►│
 │                      │◄──── contact_123 ──────┤
 │                      │                        │
 ├─ Start Chat ─────────►│                       │
 │                      ├─ createWorkspaceSession()►│
 │                      │◄───── wses_abc ────────┤
 │                      │                        │
 │                      ├─ linkFunnelContactToSession()─►│
 │                      │    (contact_123 → wses_abc)   │
 │                      │◄────── success ────────┤
```

## Implementation

### Storage Layer Interface

```typescript
// server/storage.ts

interface IStorage {
  // Link a funnel contact to a workspace session
  linkFunnelContactToSession(
    contactId: string, 
    sessionId: string
  ): Promise<void>;
  
  // Get contact by session ID
  getFunnelContactBySessionId(
    sessionId: string
  ): Promise<FunnelContact | null>;
}
```

### Space Routes Integration

**File:** `server/routes/api/space.routes.ts`

#### Registration Endpoint

```typescript
// POST /api/space/:spaceId/register
router.post('/:spaceId/register', async (req, res) => {
  // 1. Create contact
  const contact = await storage.createFunnelContact({
    workspaceId,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName
  });

  // 2. Create session immediately
  const session = await workspaceSessionService.createSession({
    workspaceId,
    email: req.body.email,
    contextType: 'space'
  });

  // 3. Link contact to session
  await storage.linkFunnelContactToSession(contact.id, session.id);

  return res.json({ contact, session });
});
```

#### Chat Stream Endpoint

```typescript
// POST /api/space/:spaceId/chat/stream
router.post('/:spaceId/chat/stream', async (req, res) => {
  const { email } = req.body;

  // 1. Find or create session
  const session = await workspaceSessionService.findOrCreateSession({
    workspaceId,
    email,
    contextType: 'space'
  });

  // 2. Find existing contact by email
  const contact = await storage.getFunnelContactByEmail(workspaceId, email);

  // 3. Link if contact exists but not linked
  if (contact && !contact.workspaceSessionId) {
    await storage.linkFunnelContactToSession(contact.id, session.id);
  }

  // 4. Continue with chat processing
  // ...
});
```

### Landing Page Integration

**File:** `server/routes/api/landing.routes.ts`

```typescript
// POST /api/landing/:appId/register
router.post('/:appId/register', async (req, res) => {
  // 1. Deduplicate & Create contact
  // Emails are normalized (lowercased and trimmed) for consistent lookup
  const email = req.body.email.toLowerCase().trim();
  
  // Find existing contact or create new one
  let contact = await storage.getFunnelContactByEmail(email, 'landing_page', appId);
  
  if (!contact) {
    contact = await storage.createFunnelContact({
      workspaceId: app.workspaceId,
      email: email,
      // ...
    });
  }

  // 2. Create session
  const session = await workspaceSessionService.createSession({
    workspaceId: app.workspaceId,
    email: req.body.email,
    contextType: 'landing_page'
  });

  // 3. Link contact to session
  await storage.linkFunnelContactToSession(contact.id, session.id);

  return res.json({ success: true, contactId: contact.id });
});
```

## Query Examples

### Get Contact with Session

```typescript
// Using Drizzle ORM relations
const contactWithSession = await db.query.funnelContacts.findFirst({
  where: eq(funnelContacts.id, contactId),
  with: {
    workspaceSession: true
  }
});
```

### Get Session with Contact

```typescript
// Find contact for a session
const contact = await db.query.funnelContacts.findFirst({
  where: eq(funnelContacts.workspaceSessionId, sessionId)
});
```

### Analytics Query

```typescript
// Get contacts with chat history
const activeContacts = await db
  .select()
  .from(funnelContacts)
  .innerJoin(
    workspaceSessions,
    eq(funnelContacts.workspaceSessionId, workspaceSessions.id)
  )
  .where(eq(funnelContacts.workspaceId, workspaceId));
```

## Benefits

✅ **Referential Integrity** - Database enforces valid relationships

✅ **Nullable Foreign Key** - Contact creation doesn't require session

✅ **Efficient Queries** - Indexed foreign key for fast lookups

✅ **Type-Safe Joins** - Drizzle relations enable type-safe queries

✅ **ON DELETE SET NULL** - Prevents orphaned records on session deletion

✅ **Automatic Linking** - Both space and landing page flows auto-link

✅ **Contact Deduplication** - Landing page registrations reuse existing contact records based on email normalization (lowercase + trim)

## Use Cases

### 1. User Journey Tracking

Track a user's progression from lead capture to active engagement:

```typescript
// Get complete user journey
const journey = await getContactJourney(contactId);
// Returns: registration → first message → conversation history
```

### 2. Email Campaign Attribution

Link email engagement back to chat sessions:

```typescript
// Find session for email recipient
const contact = await storage.getFunnelContactByEmail(workspaceId, email);
if (contact?.workspaceSessionId) {
  // Can send messages to their chat session
  await chatService.captureMessage({
    sessionId: contact.workspaceSessionId,
    message: 'Follow-up from your recent email inquiry',
    role: 'assistant'
  });
}
```

### 3. Contact Enrichment

Enrich contact data with session activity:

```typescript
// Get contact activity
const contact = await getContactWithActivity(contactId);
// Returns: contact info + message count + last activity
```

## Related Documentation

- [Entity Tags API](../../api/tagging/entity-tags.md) - Tag contacts and sessions
- [Chat Streaming API](../../api/chat/streaming.md) - Session chat handling
- [Message Capture API](../../api/chat/messages.md) - Session messaging

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 2025  
**Maintained By:** Backend Team