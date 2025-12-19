# Secure Workspace Session Link API

## Overview

The Secure Workspace Session Link API allows external systems to generate secure, time-limited access links for workspace sessions. Users can open these links to directly access their Space section and view conversation history without going through the normal login flow.

## Use Cases

1. **External System Integration**: Generate links from CRM, support systems, or other platforms to give users direct access to their conversation history
2. **Email Notifications**: Include secure links in email notifications that take users directly to their chat session
3. **Customer Support**: Support agents can generate links for customers to access their specific session

## API Endpoints

### Generate Secure Link

Generate a secure access link for a workspace session.

**Endpoint:** `POST /api/workspace/:workspaceId/session/:sessionId/generate-link`

**Parameters:**
- `workspaceId` (path, required): The workspace UUID
- `sessionId` (path, required): The workspace session ID (e.g., `wses_xxx`)

**Request Body:**
```json
{
  "expiresInHours": 24,
  "maxUses": 1,
  "createdBy": "system@example.com",
  "metadata": {
    "source": "email_notification",
    "campaign": "welcome_series"
  }
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `expiresInHours` | number | No | 24 | Hours until the link expires |
| `maxUses` | number | No | 1 | Maximum number of times the link can be used |
| `createdBy` | string | No | null | Identifier of who/what created the link |
| `metadata` | object | No | null | Additional metadata to store with the token |

**Response (200 OK):**
```json
{
  "success": true,
  "token": "a1b2c3d4e5f6...",
  "link": "https://example.com/space/access/a1b2c3d4e5f6...",
  "accessToken": {
    "id": "wsat_abc123",
    "token": "a1b2c3d4e5f6...",
    "workspaceId": "ws_xxx",
    "workspaceSessionId": "wses_xxx",
    "expiresAt": "2024-12-18T12:00:00.000Z",
    "maxUses": 1,
    "useCount": 0,
    "createdAt": "2024-12-17T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required parameters
- `404 Not Found`: Workspace or session not found
- `500 Internal Server Error`: Server error

---

### Validate Token

Validate a token without consuming a use. Useful for checking if a link is still valid before presenting it to a user.

**Endpoint:** `POST /api/workspace/session/validate-token`

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6..."
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "accessToken": {
    "id": "wsat_abc123",
    "expiresAt": "2024-12-18T12:00:00.000Z",
    "maxUses": 1,
    "useCount": 0
  },
  "session": {
    "id": "wses_xxx",
    "workspaceId": "ws_xxx",
    "username": "user@example.com",
    "contextType": "space"
  },
  "workspace": {
    "id": "ws_xxx",
    "name": "My Workspace",
    "slug": "my-workspace"
  }
}
```

**Error Response (200 OK with valid: false):**
```json
{
  "valid": false,
  "error": "Token has expired",
  "errorCode": "TOKEN_EXPIRED"
}
```

**Error Codes:**
| Code | Description |
|------|-------------|
| `TOKEN_NOT_FOUND` | Token does not exist |
| `TOKEN_EXPIRED` | Token has passed its expiration time |
| `TOKEN_EXHAUSTED` | Token has reached maximum uses |
| `TOKEN_REVOKED` | Token has been manually revoked |
| `SESSION_NOT_FOUND` | Associated session no longer exists |
| `WORKSPACE_NOT_FOUND` | Associated workspace no longer exists |

---

### Redeem Token

Redeem a token to get session information. This increments the use count.

**Endpoint:** `POST /api/workspace/session/redeem-token`

**Request Body:**
```json
{
  "token": "a1b2c3d4e5f6..."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "accessToken": {
    "id": "wsat_abc123",
    "useCount": 1
  },
  "session": {
    "id": "wses_xxx",
    "workspaceId": "ws_xxx",
    "username": "user@example.com",
    "contextType": "space"
  },
  "workspace": {
    "id": "ws_xxx",
    "name": "My Workspace",
    "slug": "my-workspace"
  }
}
```

---

### List Access Tokens

Get all access tokens for a specific session.

**Endpoint:** `GET /api/workspace/:workspaceId/session/:sessionId/access-tokens`

**Response (200 OK):**
```json
{
  "tokens": [
    {
      "id": "wsat_abc123",
      "expiresAt": "2024-12-18T12:00:00.000Z",
      "maxUses": 1,
      "useCount": 0,
      "usedAt": null,
      "createdAt": "2024-12-17T12:00:00.000Z",
      "createdBy": "system@example.com",
      "metadata": {
        "source": "email_notification"
      }
    }
  ]
}
```

---

### Revoke Token

Revoke an access token so it can no longer be used.

**Endpoint:** `DELETE /api/workspace/:workspaceId/session/access-token/:tokenId`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "Token not found"
}
```

---

## Frontend Access Route

When a user opens a secure link, they are directed to:

**URL:** `/space/access/:token`

This route:
1. Validates the token
2. Redeems the token (increments use count)
3. Sets up the browser session in `sessionStorage`
4. Redirects to the Space page (`/space/workspace-{configId}`)

The session stored includes:
- `id`: Browser session ID
- `email`: Username from the workspace session
- `workspaceSessionId`: The workspace session ID for chat history
- `accessToken`: Flag indicating this was from a secure access link

---

## Security Considerations

1. **Token Length**: Tokens are 64-character hex strings (256 bits of entropy)
2. **Single Use by Default**: Tokens default to single-use to prevent sharing
3. **Time-Limited**: Tokens expire after 24 hours by default
4. **Revocable**: Tokens can be revoked at any time
5. **No Token Storage in URL**: The token is only in the URL during initial access; session data is stored in `sessionStorage`

---

## Database Schema

The `workspace_session_access_tokens` table stores:

| Column | Type | Description |
|--------|------|-------------|
| `id` | text | Primary key (wsat_xxx format) |
| `token` | text | The secure token (64 hex chars) |
| `workspace_id` | text | Foreign key to workspaces |
| `workspace_session_id` | text | Foreign key to workspace_sessions |
| `expires_at` | timestamp | When the token expires |
| `max_uses` | integer | Maximum allowed uses |
| `use_count` | integer | Current use count |
| `used_at` | timestamp | When first used |
| `created_at` | timestamp | Creation time |
| `created_by` | text | Who created the token |
| `metadata` | jsonb | Additional metadata |

---

## Example Integration

### Generate Link from External System

```javascript
// Generate a secure link for a customer's session
const response = await fetch('/api/workspace/ws_xxx/session/wses_xxx/generate-link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    expiresInHours: 48,
    maxUses: 3,
    createdBy: 'support-system',
    metadata: {
      ticketId: 'TICKET-123',
      agentId: 'agent@support.com'
    }
  })
});

const { link } = await response.json();
// link = "https://example.com/space/access/a1b2c3d4..."

// Send this link to the customer via email, SMS, etc.
```

### Check Link Validity Before Sending

```javascript
// Validate a token before including in an email
const response = await fetch('/api/workspace/session/validate-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: 'a1b2c3d4...' })
});

const { valid, error } = await response.json();
if (!valid) {
  console.log('Token is invalid:', error);
  // Generate a new token instead
}