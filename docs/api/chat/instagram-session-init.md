# Instagram Session Init API

## Overview

The Instagram Session Init endpoint provides a resolve-or-create mechanism for Instagram DM integration with Osborn. When Osborn receives Instagram DMs via Meta webhook, it needs to obtain a session ID before calling the existing message endpoints. This endpoint returns the correct existing session if the Instagram user has been seen before, otherwise creates a new session.

## Endpoint

```
POST /api/workspace/:workspaceId/session/init
```

## Purpose

- **Primary Use Case**: Meta webhook integration for Instagram DMs
- **Session Resolution**: Match by stable `ig_user_id` (unchanging Instagram user identifier)
- **Automatic Creation**: Create new session if no match found
- **Contact Linking**: Automatically creates/links `funnel_contact` record

## Request

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | Workspace UUID, configId, or space-{configId} format |

### Request Body

```json
{
  "channel": "instagram",
  "ig_user_id": "1784....",
  "ig_username": "username_here",
  "ig_thread_id": "optional_thread_id",
  "idempotencyKey": "meta_event_id_or_hash_optional"
}
```

#### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channel` | string | Yes | Must be `"instagram"` |
| `ig_user_id` | string | Yes | Stable Instagram user ID from Meta API (unchanging) |
| `ig_username` | string | Yes | Instagram username (display name, can change) |
| `ig_thread_id` | string | No | Instagram thread ID for debugging |
| `idempotencyKey` | string | No | Meta event ID or hash for idempotency (not stored) |

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "sessionId": "wses_abc123",
  "contactId": "fc_xyz789",
  "isNewSession": true,
  "matchType": "created"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` for successful requests |
| `sessionId` | string | Workspace session ID (format: `wses_*`) |
| `contactId` | string | Funnel contact ID (format: `fc_*`) |
| `isNewSession` | boolean | `true` if session was created, `false` if existing |
| `matchType` | string | `"ig_user_id"` if matched existing, `"created"` if new |

### Error Responses

#### 400 Bad Request - Invalid Request Body

```json
{
  "success": false,
  "error": "Invalid request body",
  "details": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["ig_user_id"],
      "message": "ig_user_id is required"
    }
  ]
}
```

#### 404 Not Found - Workspace Not Found

```json
{
  "success": false,
  "error": "Workspace not found"
}
```

#### 500 Internal Server Error

```json
{
  "success": false,
  "error": "Failed to initialize session"
}
```

## Behavior

### Session Resolution Logic

1. **Primary Match**: Search for existing session by `(workspaceId, ig_user_id)`
2. **Username Update**: If session exists but `ig_username` changed, update it
3. **Contact Linking**: Find or create `funnel_contact` linked to session
4. **New Session**: If no match, create new session with all Instagram fields

### Database Operations

#### Existing Session Found

1. Query `workspace_sessions` by `(workspace_id, ig_user_id)`
2. Update `ig_username` if changed
3. Find `funnel_contact` by `workspace_session_id`
4. Create contact if not found
5. Return session and contact IDs

#### New Session Created

1. Generate UUID: `instagram-{ig_user_id}-{workspaceId}`
2. Insert into `workspace_sessions` with:
   - `channel`: `"instagram"`
   - `channel_instagram`: `ig_username`
   - `username`: `ig_username`
   - `ig_user_id`: stable identifier
   - `ig_username`: display name
   - `ig_thread_id`: optional thread ID
3. Insert into `funnel_contacts` with:
   - `workspace_session_id`: new session ID
   - `channel`: `"instagram"`
   - `channel_instagram`: `ig_username`
   - `metadata`: Instagram user details
4. Return new session and contact IDs

## Examples

### Example 1: First-Time Instagram User

**Request:**

```bash
curl -X POST https://api.example.com/api/workspace/ws_123/session/init \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "instagram",
    "ig_user_id": "1784567890",
    "ig_username": "john_doe",
    "ig_thread_id": "t_abc123"
  }'
```

**Response:**

```json
{
  "success": true,
  "sessionId": "wses_new123",
  "contactId": "fc_contact456",
  "isNewSession": true,
  "matchType": "created"
}
```

### Example 2: Returning Instagram User

**Request:**

```bash
curl -X POST https://api.example.com/api/workspace/ws_123/session/init \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "instagram",
    "ig_user_id": "1784567890",
    "ig_username": "john_doe_updated",
    "ig_thread_id": "t_xyz789"
  }'
```

**Response:**

```json
{
  "success": true,
  "sessionId": "wses_existing123",
  "contactId": "fc_contact456",
  "isNewSession": false,
  "matchType": "ig_user_id"
}
```

**Note:** The username was updated from `"john_doe"` to `"john_doe_updated"` in the database.

### Example 3: Using with Message Endpoint

After obtaining the session ID, use it to send messages:

```bash
# Step 1: Initialize session
SESSION_ID=$(curl -X POST .../session/init -d '{"channel":"instagram",...}' | jq -r '.sessionId')

# Step 2: Send message using the session ID
curl -X POST https://api.example.com/api/workspace/ws_123/session/$SESSION_ID/message/user \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from Instagram!",
    "channel": "instagram"
  }'
```

## Integration Notes

### Meta Webhook Integration

When receiving Instagram DM webhooks from Meta:

1. Extract `ig_user_id` from webhook payload (stable identifier)
2. Extract `ig_username` from webhook payload (display name)
3. Call `/session/init` to get `sessionId`
4. Use `sessionId` to call existing message endpoints

### Idempotency

- The `idempotencyKey` parameter is accepted but **not stored**
- Session resolution is naturally idempotent via `ig_user_id` matching
- Multiple calls with same `ig_user_id` return the same `sessionId`

### Username Changes

- Instagram usernames can change over time
- The endpoint automatically updates `ig_username` when detected
- `ig_user_id` remains the stable identifier for matching

## Database Schema

### workspace_sessions Table

New columns added for Instagram integration:

```sql
ALTER TABLE workspace_sessions
ADD COLUMN ig_user_id TEXT,
ADD COLUMN ig_username TEXT,
ADD COLUMN ig_thread_id TEXT;

CREATE INDEX idx_workspace_sessions_ig_user_id
ON workspace_sessions(workspace_id, ig_user_id)
WHERE ig_user_id IS NOT NULL;
```

### funnel_contacts Table

Linked via `workspace_session_id`:

```sql
-- Existing schema, no changes needed
-- Links to workspace_sessions.id
```

## Performance Considerations

- **Index Usage**: Composite index on `(workspace_id, ig_user_id)` for fast lookups
- **Partial Index**: Only indexes rows where `ig_user_id IS NOT NULL`
- **Single Query**: Session resolution uses single indexed query
- **Atomic Operations**: Session and contact creation in single transaction

## Security Considerations

- **Workspace Validation**: Always validates workspace exists before creating session
- **Input Validation**: Zod schema validates all required fields
- **SQL Injection**: Uses parameterized queries via Drizzle ORM
- **Rate Limiting**: Consider implementing rate limiting for webhook endpoints

## Testing

See `server/routes/api/__tests__/instagram-session-init.test.ts` for comprehensive unit tests covering:

- New session creation
- Existing session resolution
- Username updates
- Contact linking
- Error handling
- Edge cases

## Related Endpoints

- `POST /api/workspace/:workspaceId/session/:sessionId/message/user` - Send user message
- `POST /api/workspace/:workspaceId/session/:sessionId/message/assistant` - Send assistant message
- `GET /api/workspace/:workspaceId/chat/history` - Get chat history

## Changelog

### Version 1.0.0 (2025-12-16)

- Initial implementation
- Instagram DM integration support
- Automatic funnel_contact creation
- Username update detection