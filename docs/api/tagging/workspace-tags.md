---
id: workspace-tags
title: Workspace Tags API
sidebar_label: Workspace Tags
sidebar_position: 2
---

# Workspace Tags API

> **Status:** ✅ Documented  
> **Trello Card:** [Workspace - Tagging Documentation & Postman](https://trello.com/c/U9CGXbVk/3175)  
> **Postman:** [Workspace Tagging System Collection](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-a5933b28-eb0f-4303-942b-1f94802949c2)

## Overview

Tag definition and management system for workspaces. Workspace tags are reusable labels that can be applied to contacts and sessions for organization and filtering.

**Base URL:** `/api/workspace-tags`

## Features

- ✅ Create and manage workspace tags
- ✅ Color-coded tag system
- ✅ Hierarchical organization (optional parent tags)
- ✅ Bulk operations
- ✅ Prefixed UUIDs (`wtag_*`)

## Endpoints

### Create Tag

**Endpoint:** `POST /api/workspace-tags`

Create a new workspace tag.

#### Request Body

```json
{
  "workspaceId": "string (required)",
  "name": "string (required, 1-100 chars)",
  "description": "string (optional, max 500 chars)",
  "color": "string (optional, hex color)",
  "parentTagId": "string (optional, wtag_* format)",
  "metadata": "object (optional)"
}
```

#### Response

```json
{
  "id": "wtag_abc123def456",
  "workspaceId": "ws_123",
  "name": "VIP Customer",
  "description": "High-value customer segment",
  "color": "#FF5733",
  "parentTagId": null,
  "metadata": {},
  "createdAt": "2025-12-15T12:00:00.000Z",
  "updatedAt": "2025-12-15T12:00:00.000Z"
}
```

---

### Get Tags

**Endpoint:** `GET /api/workspace-tags/:workspaceId`

Get all tags for a workspace.

#### Response

```json
{
  "tags": [
    {
      "id": "wtag_abc123",
      "name": "VIP Customer",
      "description": "High-value customer segment",
      "color": "#FF5733",
      "parentTagId": null,
      "createdAt": "2025-12-15T12:00:00.000Z"
    },
    {
      "id": "wtag_def456",
      "name": "Urgent",
      "description": "Requires immediate attention",
      "color": "#FF0000",
      "parentTagId": null,
      "createdAt": "2025-12-15T12:00:00.000Z"
    }
  ]
}
```

---

### Get Single Tag

**Endpoint:** `GET /api/workspace-tags/:workspaceId/:tagId`

Get details of a specific tag.

#### Response

```json
{
  "id": "wtag_abc123",
  "workspaceId": "ws_123",
  "name": "VIP Customer",
  "description": "High-value customer segment",
  "color": "#FF5733",
  "parentTagId": null,
  "metadata": {
    "priority": "high",
    "category": "customer-type"
  },
  "createdAt": "2025-12-15T12:00:00.000Z",
  "updatedAt": "2025-12-15T12:00:00.000Z"
}
```

---

### Update Tag

**Endpoint:** `PATCH /api/workspace-tags/:workspaceId/:tagId`

Update tag details.

#### Request Body

```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "color": "string (optional)",
  "parentTagId": "string (optional)",
  "metadata": "object (optional)"
}
```

---

### Delete Tag

**Endpoint:** `DELETE /api/workspace-tags/:workspaceId/:tagId`

Delete a workspace tag. This will also remove all entity associations.

#### Response

```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

---

### Bulk Create Tags

**Endpoint:** `POST /api/workspace-tags/bulk/create`

Create multiple tags at once.

#### Request Body

```json
{
  "workspaceId": "string (required)",
  "tags": [
    {
      "name": "string (required)",
      "description": "string (optional)",
      "color": "string (optional)"
    }
  ]
}
```

#### Response

```json
{
  "created": [
    {
      "id": "wtag_abc123",
      "name": "Tag 1"
    },
    {
      "id": "wtag_def456",
      "name": "Tag 2"
    }
  ]
}
```

---

### Bulk Delete Tags

**Endpoint:** `DELETE /api/workspace-tags/bulk/delete`

Delete multiple tags at once.

#### Request Body

```json
{
  "workspaceId": "string (required)",
  "tagIds": ["wtag_abc123", "wtag_def456"]
}
```

## Tag Structure

### Workspace Tag Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (format: `wtag_*`) |
| `workspaceId` | string | Associated workspace |
| `name` | string | Tag name (1-100 chars, unique per workspace) |
| `description` | string | Optional description (max 500 chars) |
| `color` | string | Hex color code (e.g., `#FF5733`) |
| `parentTagId` | string | Optional parent tag for hierarchy |
| `metadata` | object | Custom metadata (JSONB) |
| `createdAt` | timestamp | Creation timestamp |
| `updatedAt` | timestamp | Last update timestamp |

## Color Coding

Tags support hex color codes for visual organization:

```javascript
// Example colors
{
  "VIP Customer": "#FF5733",     // Red
  "New Lead": "#33FF57",         // Green
  "Follow Up": "#3357FF",        // Blue
  "Urgent": "#FF0000",           // Red
  "Low Priority": "#CCCCCC"      // Gray
}
```

## Hierarchical Tags

Tags can have parent-child relationships:

```javascript
// Parent tag
{
  "id": "wtag_parent",
  "name": "Customers",
  "parentTagId": null
}

// Child tags
{
  "id": "wtag_child1",
  "name": "VIP",
  "parentTagId": "wtag_parent"
}
{
  "id": "wtag_child2",
  "name": "Regular",
  "parentTagId": "wtag_parent"
}
```

## Best Practices

### Naming Conventions
- Use descriptive, consistent names
- Consider using prefixes for categories (e.g., "Priority: High", "Type: Lead")
- Keep names concise but meaningful

### Color Guidelines
- Use consistent colors for related tags
- Consider color-blind friendly palettes
- Use distinct colors for important tags

### Organization
- Use parent tags for major categories
- Keep tag hierarchies shallow (1-2 levels max)
- Regularly review and clean up unused tags

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Validation error (invalid name, color format, etc.) |
| 404 | Tag or workspace not found |
| 409 | Duplicate tag name in workspace |
| 500 | Internal server error |

## Database Schema

```sql
workspace_tags {
  id: VARCHAR(255) PRIMARY KEY,  -- Format: wtag_*
  workspace_id: UUID NOT NULL,
  name: VARCHAR(100) NOT NULL,
  description: TEXT,
  color: VARCHAR(7),               -- Hex color code
  parent_tag_id: VARCHAR(255),
  metadata: JSONB,
  created_at: TIMESTAMP DEFAULT NOW(),
  updated_at: TIMESTAMP DEFAULT NOW(),
  UNIQUE(workspace_id, name),
  FOREIGN KEY (parent_tag_id) REFERENCES workspace_tags(id)
}
```

## Related Documentation

- [Entity Tags API](./entity-tags.md) - Apply tags to contacts and sessions
- [Workspace Tagging System](../../architecture/tagging-system.md) - Complete architecture

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 2025  
**Maintained By:** Backend Team