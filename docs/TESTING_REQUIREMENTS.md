# Testing Requirements for Documented Endpoints

This document outlines everything needed to test each documented API endpoint.

## 🔧 General Requirements

### Environment Setup

```bash
# Required Environment Variables
BASE_URL=http://localhost:3000  # or https://api.audoapps.com
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=m.audoapps.com
```

### Authentication
- API key or session token (if authentication is implemented)
- Valid workspace access credentials

### Tools Needed
- **Postman** or **Insomnia** (API client)
- **cURL** (command line testing)
- **Browser** (for SSE streaming endpoints)
- **WebSocket client** (for real-time updates)
- **Database access** (to verify data persistence)

---

## 📋 Test Data Requirements by Endpoint Category

### 1. Chat & Messaging APIs

#### Chat Streaming API (`POST /api/space/:spaceId/chat/stream`)

**Required:**
- Valid `spaceId` (workspace configId format)
- Test email address
- Optional: Existing `sessionId` or `sessionUuid`

**Test Data Example:**
```json
{
  "spaceId": "your-workspace-config-id",
  "email": "test@example.com",
  "message": "What is 2+2?",
  "firstName": "Test",
  "lastName": "User"
}
```

**To Test:**
1. Get a valid workspace configId (spaceId)
2. Use a test email address
3. Send a message
4. Verify SSE stream response
5. Check database for saved messages

**What I Need:**
- [ ] Valid workspace `configId` (spaceId format)
- [ ] Test email address
- [ ] Example session ID (if testing with existing session)

---

#### Message Capture API

##### Assistant Message (`POST /api/workspace/:workspaceId/session/:sessionId/message/assistant`)

**Required:**
- Valid `workspaceId` (UUID format)
- Valid `sessionId` (wses_* format)

**Test Data Example:**
```json
{
  "message": "This is a test system notification",
  "channel": "automation",
  "metadata": {
    "source": "test_suite",
    "testId": "test_001"
  }
}
```

**What I Need:**
- [ ] Valid workspace UUID (e.g., `ws_123` or full UUID)
- [ ] Active workspace session ID (e.g., `wses_abc123`)

---

##### User Message (`POST /api/workspace/:workspaceId/session/:sessionId/message/user`)

**Required:**
- Valid `workspaceId`
- Valid `sessionId`
- Optional: `claudeSessionId` for conversation threading

**Test Data Example (without processing):**
```json
{
  "message": "Test user message",
  "process": false,
  "channel": "api"
}
```

**Test Data Example (with processing):**
```json
{
  "message": "What are my tasks?",
  "process": true,
  "claudeSessionId": "session_xyz",
  "contextType": "workspace"
}
```

**What I Need:**
- [ ] Valid workspace UUID
- [ ] Active session ID
- [ ] Optional: Claude session ID for threaded conversations

---

### 2. Email Services APIs

#### Mailgun API

##### Send Email (`POST /api/mailgun/send`)

**Required:**
- Valid `workspaceId`
- Configured Mailgun credentials
- Test recipient email address

**Test Data Example:**
```json
{
  "workspaceId": "ws_123",
  "to": "recipient@example.com",
  "subject": "Test Email",
  "text": "This is a test email",
  "html": "<p>This is a test email</p>",
  "metadata": {
    "testId": "email_001"
  }
}
```

**What I Need:**
- [ ] Valid workspace ID
- [ ] Test recipient email (can receive emails)
- [ ] Mailgun configured and working
- [ ] Optional: Contact ID, Session ID for linking

---

##### Get Messages (`GET /api/mailgun/messages/:workspaceId`)

**Required:**
- Valid `workspaceId` with existing email records

**Test URL:**
```
GET /api/mailgun/messages/ws_123?limit=10&direction=outbound&status=delivered
```

**What I Need:**
- [ ] Workspace ID with email history
- [ ] At least one sent email for testing queries

---

##### Get Single Message (`GET /api/mailgun/messages/:workspaceId/:messageId`)

**Required:**
- Valid `workspaceId`
- Valid `messageId` (wemail_* format)

**Test URL:**
```
GET /api/mailgun/messages/ws_123/wemail_abc123
```

**What I Need:**
- [ ] Valid workspace ID
- [ ] Existing email message ID from database

---

#### Reminder Templates API

##### Create Template (`POST /api/reminders/templates`)

**Required:**
- Valid `workspaceId`

**Test Data Example:**
```json
{
  "workspaceId": "ws_123",
  "name": "Test Reminder",
  "subject": "Test Subject",
  "bodyText": "Hello {{contact_name}}, this is a test.",
  "bodyHtml": "<p>Hello {{contact_name}}, this is a test.</p>",
  "delayMinutes": 5
}
```

**What I Need:**
- [ ] Valid workspace ID

---

##### Send Reminder (`POST /api/reminders/send`)

**Required:**
- Valid `workspaceId`
- Valid `templateId` (rtmpl_* format)
- Valid `contactId` with email in funnel_contacts

**Test Data Example:**
```json
{
  "workspaceId": "ws_123",
  "templateId": "rtmpl_abc123",
  "contactId": "contact_456",
  "sessionId": "wses_xyz789"
}
```

**What I Need:**
- [ ] Valid workspace ID
- [ ] Created reminder template ID
- [ ] Contact ID with valid email address in database
- [ ] Optional: Session ID for linking

---

### 3. Tagging System APIs

#### Workspace Tags API

##### Create Tag (`POST /api/workspace-tags`)

**Required:**
- Valid `workspaceId`

**Test Data Example:**
```json
{
  "workspaceId": "ws_123",
  "name": "Test Tag",
  "description": "A test tag for testing",
  "color": "#FF5733",
  "metadata": {
    "category": "test"
  }
}
```

**What I Need:**
- [ ] Valid workspace ID

---

##### Get Tags (`GET /api/workspace-tags/:workspaceId`)

**Required:**
- Valid `workspaceId` with existing tags

**Test URL:**
```
GET /api/workspace-tags/ws_123
```

**What I Need:**
- [ ] Workspace ID
- [ ] At least one tag created for that workspace

---

##### Update/Delete Tag (`PATCH/DELETE /api/workspace-tags/:workspaceId/:tagId`)

**Required:**
- Valid `workspaceId`
- Valid `tagId` (wtag_* format)

**What I Need:**
- [ ] Valid workspace ID
- [ ] Existing tag ID to update/delete

---

#### Entity Tags API

##### Tag Contact (`POST /api/entity-tags/contacts/:contactId/tags`)

**Required:**
- Valid `contactId` from funnel_contacts table
- Valid `tagId` (wtag_* format)

**Test Data Example:**
```json
{
  "tagId": "wtag_abc123"
}
```

**What I Need:**
- [ ] Valid contact ID from database
- [ ] Valid workspace tag ID
- [ ] Contact should ideally have linked sessions to test inheritance

---

##### Tag Session (`POST /api/entity-tags/sessions/:sessionId/tags`)

**Required:**
- Valid `sessionId` (wses_* format)
- Valid `tagId`

**Test Data Example:**
```json
{
  "tagId": "wtag_abc123",
  "propagateToContact": false
}
```

**What I Need:**
- [ ] Valid workspace session ID
- [ ] Valid tag ID
- [ ] Optional: Session with linked contact to test propagation

---

##### Get Tags (`GET /api/entity-tags/contacts/:contactId/tags` or `/sessions/:sessionId/tags`)

**Required:**
- Valid entity ID (contact or session)

**What I Need:**
- [ ] Contact ID or Session ID with at least one tag applied

---

##### Query Entities by Tag (`GET /api/entity-tags/tags/:tagId/entities`)

**Required:**
- Valid `tagId` with entities tagged

**Test URL:**
```
GET /api/entity-tags/tags/wtag_abc123/entities?entityType=contact
```

**What I Need:**
- [ ] Tag ID with at least some contacts or sessions tagged

---

##### Bulk Operations (`POST /api/entity-tags/bulk/tag` or `/bulk/untag`)

**Required:**
- Multiple valid entity IDs
- Valid `tagId`

**Test Data Example:**
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

**What I Need:**
- [ ] Multiple contact IDs and/or session IDs
- [ ] Valid tag ID

---

## 📊 Complete Test Data Checklist

### Workspace Level
- [ ] Valid workspace UUID (e.g., `2e5c08f3-1234-5678-9abc-def012345678`)
- [ ] Workspace configId/spaceId (for Genesis Space endpoints)
- [ ] Workspace name and settings

### Session Level
- [ ] Active workspace session ID (format: `wses_*`)
- [ ] Session UUID (standard UUID format)
- [ ] Session email address
- [ ] Optional: Claude session ID for conversation threading

### Contact Level
- [ ] Contact ID from funnel_contacts (format: `contact_*` or custom)
- [ ] Contact email address (valid, can receive emails)
- [ ] Contact firstName and lastName
- [ ] Contact with linked workspace session (for testing relationships)

### Tag Level
- [ ] Workspace tag ID (format: `wtag_*`)
- [ ] Tag name, color, description
- [ ] Tags associated with contacts and sessions (for testing queries)

### Email Level
- [ ] Email message ID (format: `wemail_*`)
- [ ] Reminder template ID (format: `rtmpl_*`)
- [ ] Mailgun credentials configured
- [ ] Test email addresses for sending/receiving

---

## 🧪 Testing Workflow

### 1. Setup Phase
```bash
# 1. Get workspace details
curl GET /api/workspace-tags/YOUR_WORKSPACE_ID

# 2. Create test contact
# (via registration endpoint or direct DB insert)

# 3. Create test session
# (via chat endpoint or direct DB insert)

# 4. Create test tags
curl -X POST /api/workspace-tags \
  -d '{"workspaceId":"YOUR_WORKSPACE_ID","name":"Test Tag","color":"#FF0000"}'
```

### 2. Test Each Endpoint Category

**Order of Testing:**
1. ✅ Workspace Tags (create tags first)
2. ✅ Chat/Messaging (creates contacts and sessions)
3. ✅ Entity Tags (tag the contacts/sessions)
4. ✅ Email Services (send emails to contacts)
5. ✅ Query operations (verify all data)

### 3. Verification

After each test:
- [ ] Check API response status and body
- [ ] Verify data in database
- [ ] Check WebSocket broadcasts (if applicable)
- [ ] Verify side effects (e.g., tag inheritance)

---

## 🔍 What I Specifically Need From You

To create a complete, runnable test suite, please provide:

### Critical Information
1. **One valid workspace ID** (UUID format)
   - Example: `2e5c08f3-1234-5678-9abc-def012345678`

2. **One valid workspace configId/spaceId** (for Genesis Space)
   - Example: `my-workspace-config`

3. **One active workspace session ID**
   - Example: `wses_abc123def456`

4. **One contact ID from funnel_contacts**
   - Example: `contact_123` or UUID format

5. **Test email addresses**
   - For sending: `test-sender@example.com`
   - For receiving: `test-recipient@example.com`

### Optional but Helpful
6. **Existing tag ID** (if any tags exist)
   - Example: `wtag_abc123`

7. **Existing email message ID** (if any emails sent)
   - Example: `wemail_xyz789`

8. **Database access details** (read-only is fine)
   - To verify data persistence and query results

9. **Postman workspace link** (if you want me to create a collection)

10. **Environment** (development, staging, production)
    - Base URL: `http://localhost:3000` or `https://api.audoapps.com`

---

## 📝 Next Steps

Once you provide the test data above, I can:

1. ✅ Create a complete Postman collection with real IDs
2. ✅ Write cURL scripts for automated testing
3. ✅ Create a test execution plan
4. ✅ Document expected results for each endpoint
5. ✅ Create validation scripts to verify responses

Would you like me to create a Postman collection template now, or do you have the test data ready to provide?