---
id: streaming
title: Chat Streaming API
sidebar_label: Streaming API
sidebar_position: 1
---

# Genesis Space Chat - Streaming API

> **Status:** ✅ Documented  
> **Trello Card:** [Genesis Space Chat System](https://trello.com/c/xyz)  
> **Postman:** [Chat API Collection](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-96d2421b-9680-4fe1-84b4-3df4ecb33baf)

## Overview

The Genesis Space Chat streaming API enables real-time AI-powered conversations with Claude within a Space environment. This endpoint is specifically designed for **Customer Mode**, where users interact with a Space through a persistent, email-based chat session.

## Endpoint

```
POST /api/space/:spaceId/chat/stream
```

### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spaceId` | string | Yes | The Space identifier, typically in format `workspace-{configId}` or direct space ID |

### Request Headers

```
Content-Type: application/json
```

### Request Body

```typescript
{
  message: string;              // Required: The user's message/question
  sessionId: string;            // Optional: Browser session ID for isolation
  claudeSessionId?: string;     // Optional: Claude conversation thread ID
  email?: string;               // Optional: User's email for persistent sessions
  attachments?: Array<{         // Optional: File attachments
    id: string;
    url: string;
    contentType: string;
    originalName: string;
    size?: number;
    uploadedAt?: string;
  }>;
}
```

### Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | **Yes** | The user's message or question to send to the AI agent |
| `sessionId` | string | Optional | Unique browser session identifier for file access isolation. If not provided and email is missing, an error will be thrown |
| `claudeSessionId` | string | Optional | Claude conversation thread ID for maintaining multi-turn conversations |
| `email` | string | Optional | User's email address for persistent chat history. If not provided, falls back to session-based identifier |
| `attachments` | Array | Optional | Array of file attachments with metadata |

### Response Format

The endpoint uses **Server-Sent Events (SSE)** for real-time streaming.

#### Response Headers

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

#### Event Stream Format

Each event is sent in the following format:

```
data: {JSON_OBJECT}\n\n
```

The stream ends with:

```
data: [DONE]\n\n
```

---

## Stream Event Types

The API returns a series of events during the streaming process:

### 1. Progress Event
```typescript
{
  type: "progress",
  data: {
    message: string;        // Progress description
    sessionId?: string;     // Effective session ID
    sessionUuid?: string;   // Session UUID for WebSocket subscriptions
  },
  timestamp: number;        // Unix timestamp in milliseconds
}
```

### 2. Text Chunk Event
```typescript
{
  type: "text_chunk",
  data: {
    text: string;          // Chunk of assistant's response text
  },
  timestamp: number;
}
```

### 3. Tool Use Event
```typescript
{
  type: "tool_use",
  data: {
    name: string;          // Tool name (e.g., "read_file", "write_file")
    input: any;            // Tool input parameters
  },
  timestamp: number;
}
```

### 4. Message Event
```typescript
{
  type: "message",
  data: {
    role: "user" | "assistant";
    content: string | Array<{
      type: "text" | "tool_use";
      text?: string;
      name?: string;
      input?: any;
    }>;
    attachments?: Array<AttachmentMeta>;
  },
  timestamp: number;
}
```

### 5. Result Event
```typescript
{
  type: "result",
  data: {
    assistantMessage: string;
    sessionUuid?: string;
  },
  timestamp: number;
}
```

### 6. Error Event
```typescript
{
  type: "error",
  data: {
    error: string;         // Error message
  },
  timestamp: number;
}
```

---

## Chat Context Resolution

### What is ChatContext?

The `ChatContext` is a flexible structure used internally to identify and resolve the workspace, session, and user context for a chat interaction. It enables the system to:

1. **Identify the workspace** - Which Space or Workspace the conversation belongs to
2. **Resolve the user's session** - Track conversation history per user
3. **Maintain conversation threading** - Link messages to Claude's conversation state
4. **Enable persistent storage** - Store messages with proper context

### ChatContext Structure

```typescript
interface ChatContext {
  // Input identifiers (flexible based on caller)
  spaceId?: string;              // Genesis Space Chat: "workspace-{configId}" format
  workspaceId?: string;          // Workspace Chat: UUID, configId, or spaceId format
  sessionId?: string;            // Browser session ID for isolation
  email?: string;                // User email for persistence

  // Claude session for conversation threading
  claudeSessionId?: string;

  // Context specification
  contextType?: 'workspace' | 'studio' | 'space' | 'otto' | 'landing_page' | 'slide_deck';

  // Channel for future multi-channel support
  channel?: 'ui' | 'email' | 'api';
}
```

### Context Resolution Process

When a chat message is received, the system performs the following resolution:

#### Step 1: Mode Detection
```typescript
mode = chatContext.spaceId ? 'customer' : 'entrepreneur'
```

- **Customer Mode** (Genesis Space Chat): User interacting with a deployed Space
- **Entrepreneur Mode** (Workspace Chat): Workspace owner managing their business

#### Step 2: Workspace Resolution

For **Customer Mode** (Genesis Space):
```typescript
// Input: spaceId = "workspace-123"
// 1. Extract configId from spaceId pattern
const configId = parseInt(spaceId.match(/^workspace-(\d+)$/)[1]); // 123

// 2. Lookup workspace by configId
const workspace = await storage.getWorkspaceByConfigId(configId);

// 3. Resolve to workspace.id (UUID)
const workspaceId = workspace.id; // "uuid-abc-123-def"
```

#### Step 3: Session ID Resolution

The system determines an `effectiveSessionId` for file access isolation:

```typescript
if (sessionId) {
  effectiveSessionId = sessionId;  // Use provided browser session
} else if (email) {
  // Generate deterministic ID from email
  effectiveSessionId = `api-${email.replace(/[^a-zA-Z0-9]/g, '-')}`;
} else {
  throw new Error('Session ID or email is required for customer mode');
}
```

#### Step 4: Email Resolution

```typescript
if (email) {
  sessionEmail = email;  // Use customer's email
} else {
  // Fallback to session-based identifier
  sessionEmail = `session-${effectiveSessionId}@fallback.local`;
}
```

#### Step 5: Session UUID Generation

For WebSocket subscriptions and real-time updates:

```typescript
// Format: space-{email}-{workspaceId}
sessionUuid = `space-${sessionEmail}-${workspaceId}`;
```

#### Step 6: Session Context Creation

```typescript
const sessionContext = {
  username: sessionEmail,        // User identifier
  contextType: 'space',          // Always 'space' for Genesis Space Chat
  contextId: workspaceId         // Resolved workspace UUID
};
```

### Resolved Context Output

The resolution process returns a `ResolvedContext` object:

```typescript
interface ResolvedContext {
  workspaceId: string;         // Resolved UUID (e.g., "uuid-abc-123")
  workspaceUuid: string;       // Same as workspaceId
  sessionContext: {
    username: string;          // Email or session identifier
    contextType: 'space';      // Context type
    contextId: string;         // Workspace UUID
  };
  sessionEmail?: string;       // Customer's email
  effectiveSessionId?: string; // Session ID for file isolation
  needsBootstrap: boolean;     // Whether to bootstrap from template
  sessionUuid?: string;        // For WebSocket subscriptions
}
```

---

## Message Flow

### 1. User Message Capture

When a message is received:

1. **Resolve ChatContext** - Determine workspace, session, and user context
2. **Bootstrap Session Data** - If new customer, copy template files to user directory
3. **Load Chat History** - Retrieve previous messages for conversation context
4. **Save User Message** - Store message in database with context metadata

### 2. AI Response Generation

The `processGenesisSpaceChat` method handles response generation:

```typescript
async *processGenesisSpaceChat(
  chatContext: ChatContext,
  message: string,
  attachments: ChatAttachment[] | undefined,
  options: ChatOptions
): AsyncGenerator<StreamEvent>
```

**Process Steps:**

1. **Context Resolution** - Resolve workspace and session
2. **Session Bootstrap** - Copy template files if first-time user
3. **History Loading** - Load previous conversation messages
4. **Stream Initialization** - Send progress event with session info
5. **Claude Agent Invocation** - Stream response from Claude
6. **Event Streaming** - Yield events (text chunks, tool uses, etc.)
7. **Message Capture** - Save assistant's response to database
8. **Completion** - Send final result event

### 3. Message Broadcasting

Messages can be broadcast via WebSocket for real-time updates:

```typescript
websocketService.broadcastSessionMessage(sessionId, {
  id: messageId,
  role: 'assistant',
  content: messageContent,
  contentType: 'text' | 'json',
  metadata: {},
  createdAt: timestamp
});
```

**Broadcasting is controlled by the `broadcast` option:**
- **UI Streaming** (`broadcast: false`) - Messages already shown in real-time via SSE
- **API Endpoints** (`broadcast: true`) - Need WebSocket notifications for other clients

---

## Session Management

### Email-Based Sessions

Genesis Space Chat uses **email-based sessions** for persistent chat history:

```typescript
const sessionContext = {
  username: email,              // User's email
  contextType: 'space',         // Always 'space' for Genesis Space
  contextId: workspaceId        // Workspace UUID
};
```

### Session Persistence

- Sessions are stored in the `workspace_sessions` table
- Messages linked to session via `workspace_session_id`
- Chat history retrieved using email + contextType + contextId
- Session UUID used for WebSocket subscriptions

### Session Bootstrap

For new customers, the system bootstraps their session data:

```typescript
if (resolved.needsBootstrap && resolved.effectiveSessionId) {
  await userFileService.bootstrapFromTemplate(
    resolved.effectiveSessionId,
    chatContext.spaceId
  );
}
```

This copies template files from the Space to the user's isolated directory (`/user/{sessionId}/`).

---

## File Access Isolation

Genesis Space Chat implements file access isolation to prevent data cross-contamination:

### User File Structure

```
/user/{effectiveSessionId}/
  ├── data/
  │   ├── tasks.json
  │   ├── preferences.json
  │   └── ...
  └── files/
      └── user-uploaded-files/
```

### Effective Session ID

The `effectiveSessionId` determines which user directory is accessed:

```typescript
// From browser sessionId
effectiveSessionId = sessionId;

// From API call with email
effectiveSessionId = `api-${email.replace(/[^a-zA-Z0-9]/g, '-')}`;
```

### User File Service

The `userFileService` handles isolated file operations:

```typescript
// Read user file
userFileService.readFile(effectiveSessionId, 'data/tasks.json');

// Write user file
userFileService.writeFile(effectiveSessionId, 'data/preferences.json', content);

// Bootstrap from template
userFileService.bootstrapFromTemplate(effectiveSessionId, spaceId);
```

---

## Example Usage

### Frontend Implementation

```typescript
const sendMessage = async (message: string) => {
  const response = await fetch(`/api/space/${spaceId}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: message,
      sessionId: browserSessionId,
      claudeSessionId: claudeSessionId,
      email: userEmail,
      attachments: []
    })
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          console.log('Stream completed');
          continue;
        }

        const event = JSON.parse(data);
        handleStreamEvent(event);
      }
    }
  }
};

const handleStreamEvent = (event) => {
  switch (event.type) {
    case 'progress':
      console.log('Progress:', event.data.message);
      break;
    case 'text_chunk':
      appendTextToMessage(event.data.text);
      break;
    case 'tool_use':
      showToolActivity(event.data.name);
      break;
    case 'message':
      addMessageToChat(event.data);
      break;
    case 'error':
      showError(event.data.error);
      break;
  }
};
```

### cURL Example

```bash
curl -X POST "https://your-domain.com/api/space/workspace-123/chat/stream" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What can you help me with?",
    "sessionId": "session-abc-123",
    "email": "customer@example.com"
  }' \
  --no-buffer
```

---

## Related Endpoints

### Get Chat History

```
GET /api/space/:spaceId/chat/history?email={email}&sessionId={sessionId}
```

Returns previous chat messages for the session.

**Response:**
```typescript
{
  hasHistory: boolean;
  summary?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string | any[];
    contentType: 'text' | 'json';
    createdAt: string;
  }>;
  messageCount: number;
  workspaceSessionId: string;  // For WebSocket subscription
}
```

### Upgrade Session to Email

```
POST /api/space/:spaceId/chat/upgrade-session
```

Migrates an anonymous session to an email-based session.

**Request Body:**
```typescript
{
  sessionId: string;
  email: string;
}
```

---

## Error Handling

### Common Errors

| Error | Status | Description |
|-------|--------|-------------|
| Missing message | 400 | The `message` parameter is required |
| Invalid email | 400 | Email format validation failed |
| Missing session ID | 400 | Neither sessionId nor email provided |
| Space not found | 404 | The specified spaceId does not exist |
| Workspace not found | 404 | Unable to resolve workspace from spaceId |
| Stream error | 500 | Error during response generation |

### Error Event Example

```json
{
  "type": "error",
  "data": {
    "error": "Session ID or email is required for customer mode"
  },
  "timestamp": 1702345678901
}
```

---

## Best Practices

### 1. Session Persistence
- **Always provide email** when possible for persistent chat history
- Use consistent sessionId for the same browser session
- Store claudeSessionId to maintain conversation context

### 2. Error Handling
- Always listen for error events in the stream
- Implement reconnection logic for network failures
- Show user-friendly error messages

### 3. Performance
- Use WebSocket subscriptions for multi-device sync
- Cache workspaceSessionId for efficient reconnection
- Buffer text chunks before rendering to reduce UI updates

### 4. Security
- Validate email format on client side
- Never expose sessionIds in URLs
- Use HTTPS for all API calls

### 5. User Experience
- Show typing indicators during streaming
- Display tool usage with friendly names
- Buffer rapid text chunks to avoid UI flicker
- Provide feedback during file uploads

---

## WebSocket Integration

For real-time message notifications across devices:

```typescript
// Subscribe to session updates
const ws = new WebSocket(`wss://your-domain.com/ws`);

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe_session',
    sessionId: workspaceSessionId
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'session_message') {
    // Handle real-time message from other device
    addMessageToChat(message.data);
  }
};
```

---

## Architecture Diagram

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ POST /api/space/:spaceId/chat/stream
       │ { message, sessionId, email }
       ▼
┌─────────────────────────────────────────┐
│      Space Routes                       │
│  /api/space/:spaceId/chat/stream        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│      Chat Service                       │
│  processGenesisSpaceChat()              │
│  ┌─────────────────────────────────┐   │
│  │ 1. resolveChatContext()         │   │
│  │    - Resolve workspace UUID     │   │
│  │    - Generate effectiveSessionId│   │
│  │    - Create sessionContext      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 2. Bootstrap Session            │   │
│  │    - Copy template files        │   │
│  │    - Create user directory      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 3. Load Chat History            │   │
│  │    - Get previous messages      │   │
│  │    - Build conversation context │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 4. Stream Claude Response       │   │
│  │    - Yield text chunks          │   │
│  │    - Yield tool uses            │   │
│  │    - Yield progress events      │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 5. Capture Messages             │   │
│  │    - Save to database           │   │
│  │    - Broadcast via WebSocket    │   │
│  └─────────────────────────────────┘   │
└──────┬──────────────────────────────────┘
       │
       ├──────────────────────┐
       ▼                      ▼
┌──────────────┐      ┌──────────────┐
│   Database   │      │  WebSocket   │
│  (Messages)  │      │  (Broadcast) │
└──────────────┘      └──────────────┘
```

---

## Technical Implementation Details

### Service Layer Architecture

The chat streaming functionality is implemented across multiple services:

1. **ChatService** (`chat-service.ts`)
   - Context resolution
   - Message routing
   - Stream orchestration

2. **WorkspaceSessionService** (`workspace-session.service.js`)
   - Session management
   - Message persistence
   - History retrieval

3. **WorkspaceClaudeAgent** (`workspace-claude-agent.js`)
   - Claude API integration
   - Tool execution
   - Response streaming

4. **UserFileService** (`user-file.service.js`)
   - User file isolation
   - Template bootstrapping
   - File operations

### Database Schema

Messages are stored in the `workspace_session_messages` table:

```sql
CREATE TABLE workspace_session_messages (
  id SERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL,
  workspace_session_id VARCHAR NOT NULL,
  workspace_session_uuid VARCHAR NOT NULL,
  role VARCHAR NOT NULL,  -- 'user' | 'assistant' | 'system'
  content TEXT NOT NULL,
  content_type VARCHAR NOT NULL,  -- 'text' | 'json'
  channel VARCHAR,  -- 'ui' | 'email' | 'api'
  username VARCHAR,
  context_type VARCHAR,
  context_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Key Features Summary

- ✅ Real-time streaming with SSE
- ✅ Email-based persistent sessions
- ✅ File access isolation per user
- ✅ WebSocket broadcasting support
- ✅ Flexible context resolution
- ✅ Attachment support
- ✅ Tool usage tracking
- ✅ Conversation threading with Claude

---

## Related Documentation

- [Message Capture API](./messages.md) - Programmatic message capture
- [WebSocket Integration](../websocket/README.md) - Real-time updates
- [Session Management](../../architecture/sessions.md)

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 2025  
**Maintained By:** Backend Team