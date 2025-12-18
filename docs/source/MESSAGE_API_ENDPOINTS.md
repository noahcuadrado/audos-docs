# Message API Endpoints Documentation

## Overview
Two new endpoints for programmatically capturing messages in workspace chat sessions with optional LLM processing and WebSocket broadcasting.

---

## Endpoints

### 1. POST /api/workspace/:workspaceId/session/:sessionId/message/assistant
**Purpose:** Capture assistant messages (system notifications, automated responses, etc.)

**URL Parameters:**
- `workspaceId` - Workspace UUID or configId
- `sessionId` - Session ID or UUID

**Request Body:**
```json
{
  "message": "string (required)",
  "channel": "string (optional, default: 'api')",
  "metadata": {
    "source": "string (optional)",
    "key": "any (optional)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "id": "number",
    "workspaceId": "string",
    "workspaceSessionId": "string",
    "role": "assistant",
    "content": "string",
    "contentType": "text",
    "channel": "string",
    "createdAt": "Date"
  }
}
```

**Example Request:**
```bash
curl -X POST "https://api.example.com/api/workspace/123/session/wses_abc/message/assistant" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Your task has been completed successfully!",
    "channel": "automation",
    "metadata": {
      "source": "task_scheduler",
      "taskId": "task_789"
    }
  }'
```

**Use Cases:**
- System notifications (task completed, reminder triggered)
- Automated responses from background jobs
- Integration messages from external services
- Bot-initiated messages

---

### 2. POST /api/workspace/:workspaceId/session/:sessionId/message/user
**Purpose:** Capture user messages with optional LLM processing

**URL Parameters:**
- `workspaceId` - Workspace UUID or configId
- `sessionId` - Session ID or UUID

**Request Body:**
```json
{
  "message": "string (required)",
  "process": "boolean (optional, default: false)",
  "channel": "string (optional, default: 'api')",
  "metadata": {
    "source": "string (optional)",
    "key": "any (optional)"
  },
  "claudeSessionId": "string (optional, for conversation threading)",
  "contextType": "string (optional, e.g., 'workspace', 'space')"
}
```

**Response (process=false):**
```json
{
  "success": true,
  "userMessage": {
    "id": "number",
    "uuid": "string",
    "workspaceId": "string",
    "workspaceUserId": "number | null",
    "workspaceSessionId": "string",
    "workspaceSessionUuid": "string",
    "role": "user",
    "content": "string",
    "contentType": "text",
    "messageType": "message",
    "contextType": "string",
    "contextId": "string",
    "channel": "string",
    "username": "string",
    "attachments": "array | null",
    "summarizedUpto": "number | null",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "assistantMessage": null
}
```

**Response (process=true):**
```json
{
  "success": true,
  "userMessage": {
    "id": "number",
    "uuid": "string",
    "workspaceId": "string",
    "workspaceUserId": "number | null",
    "workspaceSessionId": "string",
    "workspaceSessionUuid": "string",
    "role": "user",
    "content": "string",
    "contentType": "text",
    "messageType": "message",
    "contextType": "string",
    "contextId": "string",
    "channel": "string",
    "username": "string",
    "attachments": "array | null",
    "summarizedUpto": "number | null",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "assistantMessage": {
    "id": "number",
    "uuid": "string",
    "workspaceId": "string",
    "workspaceUserId": "number | null",
    "workspaceSessionId": "string",
    "workspaceSessionUuid": "string",
    "role": "assistant",
    "content": "string (JSON string of events)",
    "contentType": "json",
    "messageType": "message",
    "contextType": "string",
    "contextId": "string",
    "channel": "string",
    "username": "string",
    "attachments": "array | null",
    "summarizedUpto": "number | null",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
}
```

**Example Request (No Processing):**
```bash
curl -X POST "https://api.example.com/api/workspace/123/session/wses_abc/message/user" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "User logged in from mobile app",
    "process": false,
    "channel": "mobile",
    "metadata": {
      "deviceType": "iOS",
      "appVersion": "2.1.0"
    }
  }'
```

**Example Request (With Processing):**
```bash
curl -X POST "https://api.example.com/api/workspace/123/session/wses_abc/message/user" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my account balance?",
    "process": true,
    "claudeSessionId": "session_xyz",
    "contextType": "workspace"
  }'
```

**Response (With Processing):**
```json
{
  "success": true,
  "userMessage": {
    "id": 2574,
    "uuid": "wmsg_d1b3e3c0440347a58d5840e0e2bf6346",
    "workspaceId": "79849043-88b5-40ba-a93a-c1e088c4d9b0",
    "workspaceSessionId": "wses_976cf4c4c61540539c7154f2bf9b0466",
    "role": "user",
    "content": "Greet me with one line.",
    "contentType": "text",
    "channel": "api",
    "createdAt": "2025-12-18T10:45:27.626Z",
    "updatedAt": "2025-12-18T10:45:27.626Z"
  },
  "assistantMessage": {
    "id": 2575,
    "uuid": "wmsg_df9f802909a345c49008697289ec2b01",
    "workspaceId": "79849043-88b5-40ba-a93a-c1e088c4d9b0",
    "workspaceSessionId": "wses_976cf4c4c61540539c7154f2bf9b0466",
    "role": "assistant",
    "content": "[{\"type\":\"progress\"...}]",
    "contentType": "json",
    "channel": "api",
    "createdAt": "2025-12-18T10:45:38.259Z",
    "updatedAt": "2025-12-18T10:45:38.259Z"
  }
}
```

---

## Features

### WebSocket Broadcasting
Both endpoints automatically broadcast messages to all connected WebSocket clients subscribed to the session:

**WebSocket Message Format:**
```json
{
  "type": "session_message",
  "sessionUuid": "wses_abc",
  "message": {
    "id": "456",
    "role": "user" | "assistant",
    "content": "message content",
    "metadata": {},
    "createdAt": "2025-12-10T12:00:00.000Z"
  }
}
```

### Session Resolution
Both endpoints support flexible session identification:
- By session ID (`wses_abc`)
- By session UUID
- Automatic workspace verification

### Database Persistence
All messages are stored in `workspace_session_messages` table with:
- Auto-detected content type (text/json)
- Channel tracking
- Metadata storage
- Timestamp tracking
- Session relationship

---

## Use Cases

### Use Case 1: API-Driven Chatbot
External service sends user messages and gets AI responses:

```javascript
// User asks a question via external API
const response = await fetch('/api/workspace/123/session/wses_abc/message/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What are my open tasks?',
    process: true,
    claudeSessionId: conversationId
  })
});

const data = await response.json();
console.log('AI Response:', data.assistantMessage.content);

// Send AI response back to user via your channel (Slack, email, etc.)
await sendToUserChannel(data.assistantMessage.content);
```

### Use Case 2: Message Archiving
Log user activity without processing:

```javascript
// Archive user action
await fetch('/api/workspace/123/session/wses_abc/message/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'User viewed dashboard',
    process: false,
    metadata: {
      action: 'page_view',
      page: 'dashboard',
      timestamp: Date.now()
    }
  })
});
```

### Use Case 3: System Notifications
Send automated assistant messages:

```javascript
// Scheduled job completes
await fetch('/api/workspace/123/session/wses_abc/message/assistant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Your weekly report is ready! View it here: https://...',
    metadata: {
      source: 'report_generator',
      reportId: 'report_456'
    }
  })
});
```

### Use Case 4: Email Integration
Process incoming emails as chat messages:

```javascript
// Incoming email webhook
app.post('/webhook/email/inbound', async (req, res) => {
  const { from, subject, body, workspaceId, sessionId } = req.body;

  // Capture user message (email) and get AI response
  const response = await fetch(`/api/workspace/${workspaceId}/session/${sessionId}/message/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `${subject}\n\n${body}`,
      process: true,
      channel: 'email',
      metadata: {
        from,
        subject,
        receivedAt: new Date()
      }
    })
  });

  const data = await response.json();

  // Send AI response back via email
  await sendEmail({
    to: from,
    subject: `Re: ${subject}`,
    body: data.assistantMessage.content
  });

  res.json({ success: true });
});
```

### Use Case 5: Multi-Channel Support
Same conversation across web, mobile, email, API:

```javascript
// All these messages appear in the same session
// and trigger WebSocket updates to all connected clients

// From web UI (existing)
POST /api/space/:spaceId/chat/stream

// From mobile app
POST /api/workspace/123/session/wses_abc/message/user
{ "message": "Hello from mobile", "channel": "mobile" }

// From email
POST /api/workspace/123/session/wses_abc/message/user
{ "message": "Hello from email", "channel": "email", "process": true }

// From automation
POST /api/workspace/123/session/wses_abc/message/assistant
{ "message": "Task reminder", "channel": "automation" }
```

---

## Error Handling

### 400 Bad Request
```json
{
  "error": "Message is required and must be a string"
}
```

### 404 Not Found
```json
{
  "error": "Session not found or message could not be saved"
}
```

### 500 Server Error (with processing error)
```json
{
  "success": true,
  "userMessage": { ... },
  "processingError": "Error details from LLM processing"
}
```
*Note: User message is still saved even if processing fails*

---

## Technical Details

### Message Capture Flow
```
1. Endpoint receives request
   ↓
2. Validate message content
   ↓
3. Call chatService.captureMessage()
   ├─ Resolve session (by ID or UUID)
   ├─ Save to database (workspace_session_messages)
   └─ Broadcast via WebSocket
   ↓
4. If process=true (user endpoint only):
   ├─ Call chatService.processChatFull()
   ├─ LLM generates response
   ├─ Assistant message auto-saved via captureMessage()
   └─ Return both messages
   ↓
5. Return response
```

### Database Schema
Messages stored in `workspace_session_messages`:
```sql
{
  id: SERIAL PRIMARY KEY,
  workspace_id: UUID,
  workspace_session_id: VARCHAR,
  workspace_session_uuid: UUID,
  role: ENUM('user', 'assistant', 'system'),
  content: TEXT,
  content_type: ENUM('text', 'json'),
  channel: VARCHAR,
  metadata: JSONB,
  created_at: TIMESTAMP
}
```

### WebSocket Subscriptions
Clients subscribe to session updates:
```javascript
// Frontend WebSocket subscription
ws.send(JSON.stringify({
  type: 'subscribe_session',
  sessionId: 'wses_abc'
}));

// Receive real-time message updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'session_message') {
    console.log('New message:', data.message);
    // Update UI with new message
  }
};
```

---

## Migration Notes

### Breaking Changes
❌ **None** - Old endpoint still works for backward compatibility

### Deprecated Endpoints
⚠️ `/api/workspace/:workspaceId/session/:sessionId/message` (without `/assistant` suffix)
- Still functional but deprecated
- Use `/message/assistant` for new integrations

---

## Testing

### Test Assistant Message Endpoint
```bash
# Test basic assistant message
curl -X POST "http://localhost:3000/api/workspace/123/session/wses_abc/message/assistant" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test notification"}'

# Expected: Message saved, WebSocket broadcast sent
```

### Test User Message Endpoint (No Processing)
```bash
# Test user message capture only
curl -X POST "http://localhost:3000/api/workspace/123/session/wses_abc/message/user" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test user message", "process": false}'

# Expected: User message saved, no AI response
```

### Test User Message Endpoint (With Processing)
```bash
# Test user message with AI response
curl -X POST "http://localhost:3000/api/workspace/123/session/wses_abc/message/user" \
  -H "Content-Type: application/json" \
  -d '{"message": "What is 2+2?", "process": true}'

# Expected: User message saved, AI generates response, assistant message saved
```

---

## Summary

✅ **Two Clear Endpoints:**
- `/message/assistant` - For system/automated assistant messages
- `/message/user` - For user messages with optional AI processing

✅ **Flexible Processing:**
- `process=false` - Fast message capture only
- `process=true` - Full AI conversation

✅ **Real-Time Updates:**
- WebSocket broadcasting for all messages
- Multi-device sync

✅ **Multi-Channel Support:**
- UI, API, email, mobile, automation
- Channel tracking in database

✅ **Production Ready:**
- Error handling
- Backward compatibility
- Database persistence
- Session management
