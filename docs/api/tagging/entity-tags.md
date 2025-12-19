---
id: entity-tags
title: Entity Tags API
sidebar_label: Entity Tags
sidebar_position: 1
---

# Entity Tags API

> **Status:** ✅ Documented  
> **Trello Card:** [Backend Entity - Tagging System](https://trello.com/c/ogWaJYwT/3177)  
> **Postman:** [Workspace Tagging System Collection](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-a5933b28-eb0f-4303-942b-1f94802949c2)

## Overview

Contact and session tagging system with automatic tag inheritance. Tags are stored on both contacts and sessions for bidirectional visibility.

**Base URL:** `/api/entity-tags`

> **Important:** All entity tag endpoints require a `workspaceId` query parameter for authorization and context.

## Features

- ✅ Dual-anchor design (tags on both contacts and sessions)
- ✅ Automatic tag inheritance (contact → sessions)
- ✅ Inheritance tracking (direct vs inherited tags)
- ✅ Bulk operations for efficient tagging
- ✅ Polymorphic design (single table for both entity types)
- ✅ Prefixed UUIDs (`etag_*`)

## Endpoints

### Tag Contact

**Endpoint:** `POST /api/entity-tags/contacts/:contactId/tags?workspaceId={workspaceId}`

Tag a contact. Automatically propagates to all linked sessions.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Request Body

```json
{
  "tagId": "wtag_abc123 (required)"
}
```

#### Response

```json
{
  "success": true,
  "contactTag": {
    "id": "etag_xyz789",
    "entityType": "contact",
    "entityId": "contact_123",
    "tagId": "wtag_abc123",
    "sourceType": "direct",
    "createdAt": "2025-12-15T12:00:00.000Z"
  },
  "propagatedToSessions": 3
}
```

---

### Tag Session

**Endpoint:** `POST /api/entity-tags/sessions/:sessionId/tags?workspaceId={workspaceId}`

Tag a session with optional contact propagation.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Request Body

```json
{
  "tagId": "wtag_abc123 (required)",
  "propagateToContact": "boolean (optional, default: false)"
}
```

#### Response

```json
{
  "success": true,
  "sessionTag": {
    "id": "etag_xyz789",
    "entityType": "session",
    "entityId": "wses_abc",
    "tagId": "wtag_abc123",
    "sourceType": "direct",
    "createdAt": "2025-12-15T12:00:00.000Z"
  },
  "propagatedToContact": false
}
```

---

### Get Contact Tags

**Endpoint:** `GET /api/entity-tags/contacts/:contactId/tags?workspaceId={workspaceId}`

Get all tags for a contact (direct tags only).

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Response

```json
{
  "tags": [
    {
      "id": "etag_abc123",
      "tag": {
        "id": "wtag_def456",
        "name": "VIP Customer",
        "color": "#FF5733"
      },
      "sourceType": "direct",
      "createdAt": "2025-12-15T12:00:00.000Z"
    }
  ]
}
```

---

### Get Session Tags

**Endpoint:** `GET /api/entity-tags/sessions/:sessionId/tags?workspaceId={workspaceId}`

Get all tags for a session (includes both direct and inherited tags).

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Response

```json
{
  "tags": [
    {
      "id": "etag_abc123",
      "tag": {
        "id": "wtag_def456",
        "name": "VIP Customer",
        "color": "#FF5733"
      },
      "sourceType": "direct",
      "createdAt": "2025-12-15T12:00:00.000Z"
    },
    {
      "id": "etag_xyz789",
      "tag": {
        "id": "wtag_ghi012",
        "name": "Follow Up",
        "color": "#33FF57"
      },
      "sourceType": "inherited",
      "sourceEntityType": "contact",
      "sourceEntityId": "contact_123",
      "createdAt": "2025-12-15T12:05:00.000Z"
    }
  ]
}
```

---

### Untag Contact

**Endpoint:** `DELETE /api/entity-tags/contacts/:contactId/tags/:tagId?workspaceId={workspaceId}`

Remove tag from contact. Automatically removes inherited tags from linked sessions.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Response

```json
{
  "success": true,
  "removedFromSessions": 3
}
```

---

### Untag Session

**Endpoint:** `DELETE /api/entity-tags/sessions/:sessionId/tags/:tagId?workspaceId={workspaceId}`

Remove direct tag from session only (does not affect contact).

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Response

```json
{
  "success": true
}
```

---

### Sync Session Tags

**Endpoint:** `POST /api/entity-tags/sessions/:sessionId/sync-tags?workspaceId={workspaceId}`

Sync all contact tags to a session (refresh inherited tags). This endpoint recalculates inheritance rules and ensures the session reflects all tags currently applied to its linked contact.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Response

```json
{
  "success": true,
  "addedTags": 2,
  "removedTags": 0
}
```

---

### Query Entities by Tag

**Endpoint:** `GET /api/entity-tags/tags/:tagId/entities?workspaceId={workspaceId}`

Find all entities (contacts and sessions) with a specific tag.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |
| `entityType` | string | No | Filter by type: `contact` or `session` |
| `sourceType` | string | No | Filter by source: `direct` or `inherited` |

#### Response

```json
{
  "entities": [
    {
      "entityType": "contact",
      "entityId": "contact_123",
      "sourceType": "direct",
      "createdAt": "2025-12-15T12:00:00.000Z"
    },
    {
      "entityType": "session",
      "entityId": "wses_abc",
      "sourceType": "inherited",
      "sourceEntityType": "contact",
      "sourceEntityId": "contact_123",
      "createdAt": "2025-12-15T12:05:00.000Z"
    }
  ]
}
```

---

### Bulk Tag Entities

**Endpoint:** `POST /api/entity-tags/bulk/tag?workspaceId={workspaceId}`

Tag multiple entities at once.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Request Body

```json
{
  "entities": [
    {
      "entityType": "contact",
      "entityId": "contact_123"
    },
    {
      "entityType": "session",
      "entityId": "wses_abc"
    }
  ],
  "tagId": "wtag_abc123"
}
```

#### Response

```json
{
  "success": true,
  "tagged": 2,
  "skipped": 0,
  "errors": []
}
```

---

### Bulk Untag Entities

**Endpoint:** `POST /api/entity-tags/bulk/untag?workspaceId={workspaceId}`

Remove tags from multiple entities at once.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | The workspace ID for authorization |

#### Request Body

```json
{
  "entities": [
    {
      "entityType": "contact",
      "entityId": "contact_123"
    },
    {
      "entityType": "session",
      "entityId": "wses_abc"
    }
  ],
  "tagId": "wtag_abc123"
}
```

## Tag Inheritance System

### How It Works

1. **Tag a Contact** → Automatically propagates to all linked sessions
2. **Tag a Session Directly** → Only that session gets the tag
3. **Untag a Contact** → Removes inherited tags from all sessions
4. **Untag a Session** → Removes only direct tags, not inherited ones

### Inheritance Tracking

Entity tags include source tracking:

| Field | Description |
|-------|-------------|
| `sourceType` | `direct` (manually applied) or `inherited` (from contact) |
| `sourceEntityType` | Where inherited from: `contact` or `session` |
| `sourceEntityId` | ID of the source entity |

### Visual Example

```
Contact: contact_123
  ├─ Tag: "VIP Customer" (direct)
  └─ Linked Sessions:
      ├─ Session: wses_abc
      │   ├─ Tag: "VIP Customer" (inherited from contact_123)
      │   └─ Tag: "Follow Up" (direct)
      └─ Session: wses_def
          └─ Tag: "VIP Customer" (inherited from contact_123)
```

## Entity Tag Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (format: `etag_*`) |
| `entityType` | string | `contact` or `session` |
| `entityId` | string | ID of the tagged entity |
| `tagId` | string | Workspace tag ID (`wtag_*`) |
| `sourceType` | string | `direct` or `inherited` |
| `sourceEntityType` | string | Where inherited from (nullable) |
| `sourceEntityId` | string | Source entity ID (nullable) |
| `createdAt` | timestamp | When tag was applied |

## Database Schema

```sql
entity_tags {
  id: VARCHAR(255) PRIMARY KEY,        -- Format: etag_*
  entity_type: ENUM('contact', 'session') NOT NULL,
  entity_id: VARCHAR(255) NOT NULL,
  tag_id: VARCHAR(255) NOT NULL,       -- References workspace_tags
  source_type: ENUM('direct', 'inherited') NOT NULL,
  source_entity_type: ENUM('contact', 'session'),
  source_entity_id: VARCHAR(255),
  created_at: TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, tag_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_tag (tag_id),
  INDEX idx_source (source_entity_type, source_entity_id)
}
```

## Use Cases

### 1. Contact Segmentation
```javascript
// Tag all VIP customers
await bulkTag({
  entities: vipContacts.map(c => ({
    entityType: 'contact',
    entityId: c.id
  })),
  tagId: 'wtag_vip'
});
```

### 2. Session Tracking
```javascript
// Tag sessions that need follow-up
await tagSession('wses_abc', {
  tagId: 'wtag_followup'
});
```

### 3. Automatic Inheritance
```javascript
// Tag contact - automatically tags all their sessions
await tagContact('contact_123', {
  tagId: 'wtag_priority'
});
// All linked sessions now have "Priority" tag inherited
```

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Validation error (invalid entity type, missing tagId) |
| 404 | Entity or tag not found |
| 409 | Tag already applied to entity |
| 500 | Internal server error |

## Performance Considerations

- Entity tags table uses composite indexes for fast lookups
- Bulk operations are optimized with batch inserts
- Inheritance propagation is async for large session counts
- Query by tag endpoint supports pagination

## Related Documentation

- [Workspace Tags API](./workspace-tags.md) - Tag definitions
- [Contacts & Sessions Relationship](../../architecture/database/relationships/contacts-sessions.md)
- [Complete Tagging Architecture](../../architecture/tagging-system.md)

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 2025  
**Maintained By:** Backend Team