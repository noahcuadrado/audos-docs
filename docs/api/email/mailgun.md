---
id: mailgun
title: Mailgun Email API
sidebar_label: Mailgun API
sidebar_position: 1
---

# Mailgun Email API

> **Status:** ✅ Documented  
> **Trello Card:** [Email Integration Mailgun](https://trello.com/c/xyz)  
> **Postman:** [Mailgun Email API Collection](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-d560cd71-f0c6-4ca4-9c94-a42b8335174b)

## Overview

Complete Mailgun email integration API for sending emails, tracking delivery, and managing email messages. This API handles both outbound and inbound email operations.

**Base URL:** `/api/mailgun`

## Authentication

Most endpoints require JWT Bearer token authentication. Add your JWT token to the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /api/mailgun/health`

Check if the Mailgun service is properly configured and ready.

**Authentication:** Not required

#### Response (Configured)

```json
{
  "status": "ok",
  "configured": true,
  "domain": "m.audoapps.com",
  "defaultFrom": "noreply@m.audoapps.com"
}
```

#### Response (Not Configured)

```json
{
  "status": "not_configured",
  "configured": false,
  "domain": "",
  "defaultFrom": null
}
```

| Status | Description |
|--------|-------------|
| 200 | Service is configured and ready |
| 503 | Service is not configured |

---

### 2. Send Email

**Endpoint:** `POST /api/mailgun/send`

Send an email via Mailgun and store it in the database.

**Authentication:** JWT Bearer token required

#### Request Body

```json
{
  "workspaceId": "string (required)",
  "to": "string (required) - recipient email",
  "subject": "string (required)",
  "text": "string (required) - plain text content",
  "html": "string (optional) - HTML content",
  "from": "string (optional) - custom sender email",
  "replyTo": "string (optional) - reply-to address",
  "sessionId": "string (optional) - workspace session ID",
  "sessionUuid": "string (optional) - session UUID for linking",
  "userId": "string (optional) - workspace user ID",
  "contactId": "string (optional) - funnel contact ID",
  "metadata": {
    "source": "string (optional)",
    "key": "any (optional)"
  }
}
```

#### Response

```json
{
  "success": true,
  "id": "email-uuid-123",
  "uuid": "email-abc-def-456",
  "mailgunMessageId": "<20251209120000.1.abc@m.audoapps.com>",
  "status": "sent"
}
```

#### Example: Basic Email

```bash
curl -X POST "https://app.audos.com/api/mailgun/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "workspaceId": "79849043-88b5-40ba-a93a-c1e088c4d9b0",
    "to": "user@example.com",
    "subject": "Test Email from Postman",
    "text": "This is a test email sent from Postman",
    "html": "<h1>Test Email</h1><p>This is a test email sent from Postman.</p>",
    "metadata": {
      "source": "postman",
      "test": true
    }
  }'
```

#### Example: Email with Session Link

```bash
curl -X POST "https://app.audos.com/api/mailgun/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "workspaceId": "79849043-88b5-40ba-a93a-c1e088c4d9b0",
    "to": "user@example.com",
    "subject": "Email Linked to Session",
    "text": "This email is linked to a workspace session.",
    "html": "<h1>Session Email</h1><p>This email is linked to a workspace session.</p>",
    "sessionId": "wses_7a2219c3d54a45eaa277046abebee943",
    "sessionUuid": "space-me+crickify1@ehussain.in-7cd75493-4d0a-407b-a8dd-de74f864c6ae",
    "metadata": {
      "campaign": "onboarding",
      "step": "welcome"
    }
  }'
```

---

### 3. Get Email Messages

**Endpoint:** `GET /api/mailgun/messages/:workspaceId`

Retrieve email messages for a workspace with pagination and filtering.

**Authentication:** JWT Bearer token required

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | No | Number of messages (1-100, default: 50) |
| `offset` | number | No | Pagination offset (default: 0) |
| `direction` | string | No | Filter: `inbound` or `outbound` |
| `status` | string | No | Filter: `pending`, `sent`, `delivered`, `failed`, `bounced`, `opened`, `clicked` |
| `from` | string | No | Filter by sender (partial match) |
| `to` | string | No | Filter by recipient (partial match) |
| `startDate` | string | No | ISO 8601 date filter start |
| `endDate` | string | No | ISO 8601 date filter end |
| `sessionId` | string | No | Filter by workspace session ID |
| `contactId` | string | No | Filter by funnel contact ID |

#### Response

```json
{
  "messages": [
    {
      "id": "email-123",
      "uuid": "email-abc-123",
      "workspaceId": "workspace-123",
      "direction": "outbound",
      "from": "Audos <noreply@m.audoapps.com>",
      "to": "user@example.com",
      "subject": "Welcome Email",
      "status": "delivered",
      "deliveredAt": "2025-12-09T12:30:00Z",
      "createdAt": "2025-12-09T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### Example: Get All Messages

```bash
curl -X GET "https://app.audos.com/api/mailgun/messages/79849043-88b5-40ba-a93a-c1e088c4d9b0?limit=50&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Example: Get Outbound Emails

```bash
curl -X GET "https://app.audos.com/api/mailgun/messages/79849043-88b5-40ba-a93a-c1e088c4d9b0?direction=outbound&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Example: Get Delivered Emails

```bash
curl -X GET "https://app.audos.com/api/mailgun/messages/79849043-88b5-40ba-a93a-c1e088c4d9b0?status=delivered&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Example: Get Emails by Date Range

```bash
curl -X GET "https://app.audos.com/api/mailgun/messages/79849043-88b5-40ba-a93a-c1e088c4d9b0?startDate=2025-12-01T00:00:00Z&endDate=2025-12-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get Single Email Message

**Endpoint:** `GET /api/mailgun/messages/:workspaceId/:emailId`

Retrieve a specific email message by ID or UUID.

**Authentication:** JWT Bearer token required

#### URL Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspaceId` | string | Yes | Workspace ID |
| `emailId` | string | Yes | Email message ID or UUID |

#### Response

```json
{
  "id": "email-123",
  "uuid": "email-abc-123",
  "workspaceId": "workspace-123",
  "mailgunMessageId": "<20251209120000.1.abc@m.audoapps.com>",
  "direction": "outbound",
  "from": "Audos <noreply@m.audoapps.com>",
  "to": "user@example.com",
  "subject": "Welcome Email",
  "bodyPlain": "Plain text content",
  "bodyHtml": "<h1>Welcome</h1>",
  "status": "delivered",
  "deliveredAt": "2025-12-09T12:30:00Z",
  "openedAt": "2025-12-09T12:35:00Z",
  "createdAt": "2025-12-09T12:00:00Z"
}
```

#### Example

```bash
curl -X GET "https://app.audos.com/api/mailgun/messages/79849043-88b5-40ba-a93a-c1e088c4d9b0/email-abc-123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Email Status Tracking

### Status Flow

```
pending → sent → delivered → opened → clicked
                    ↓
                 bounced
                    ↓
                  failed
```

### Status Descriptions

| Status | Description |
|--------|-------------|
| `pending` | Email queued for sending |
| `sent` | Email sent to Mailgun servers |
| `delivered` | Email delivered to recipient's inbox |
| `opened` | Recipient opened the email |
| `clicked` | Recipient clicked a link in the email |
| `bounced` | Email bounced (invalid address, full inbox, etc.) |
| `failed` | Delivery permanently failed |

---

## Webhooks

Mailgun sends webhook events for email status updates:

### Webhook Events

| Event | Description |
|-------|-------------|
| `delivered` | Email successfully delivered |
| `opened` | Email opened by recipient |
| `clicked` | Link clicked in email |
| `bounced` | Email bounced |
| `dropped` | Email dropped (spam, etc.) |
| `complained` | Recipient marked as spam |
| `unsubscribed` | Recipient unsubscribed |

### Webhook Handler

The system automatically processes Mailgun webhooks at:

```
POST /api/mailgun/webhooks
```

---

## Email Object Schema

```typescript
interface Email {
  id: string;              // Internal ID
  uuid: string;            // Public UUID
  workspaceId: string;     // Workspace ID
  mailgunMessageId: string; // Mailgun's message ID
  direction: 'inbound' | 'outbound';
  from: string;            // Sender email
  to: string;              // Recipient email
  subject: string;
  bodyPlain: string;       // Plain text content
  bodyHtml?: string;       // HTML content
  status: EmailStatus;
  metadata?: object;       // Custom metadata
  sessionId?: string;      // Linked session ID
  contactId?: string;      // Linked contact ID
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  failedAt?: Date;
}
```

---

## Use Cases

### 1. Transactional Emails

```javascript
// Send order confirmation
await fetch('/api/mailgun/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    workspaceId: 'workspace-123',
    to: 'customer@example.com',
    subject: 'Order Confirmation #12345',
    text: 'Thank you for your order!',
    html: '<h1>Order Confirmed</h1><p>Thank you for your order!</p>',
    metadata: {
      type: 'order_confirmation',
      orderId: '12345'
    }
  })
});
```

### 2. Session-Linked Emails

```javascript
// Send email linked to chat session
await fetch('/api/mailgun/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    workspaceId: 'workspace-123',
    to: 'customer@example.com',
    subject: 'Following up on our conversation',
    text: 'Hi there, following up on our chat...',
    sessionId: 'wses_abc123',
    metadata: {
      source: 'chat_followup'
    }
  })
});
```

### 3. Bulk Email Retrieval

```javascript
// Get all undelivered emails for retry
const response = await fetch(
  '/api/mailgun/messages/workspace-123?status=pending&limit=100',
  {
    headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
  }
);

const { messages } = await response.json();
console.log(`${messages.length} emails pending delivery`);
```

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or missing JWT token |
| 404 | Not Found - Email or workspace not found |
| 500 | Server Error - Mailgun API error |
| 503 | Service Unavailable - Mailgun not configured |

### Error Response Format

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": {}
}
```

---

## Database Schema

```sql
CREATE TABLE mailgun_emails (
  id VARCHAR(255) PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  workspace_id UUID NOT NULL,
  mailgun_message_id VARCHAR(255),
  direction ENUM('inbound', 'outbound') NOT NULL,
  from_email VARCHAR(255) NOT NULL,
  to_email VARCHAR(255) NOT NULL,
  subject TEXT,
  body_plain TEXT,
  body_html TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  session_id VARCHAR(255),
  contact_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounced_at TIMESTAMP,
  failed_at TIMESTAMP,
  INDEX idx_workspace (workspace_id),
  INDEX idx_status (status),
  INDEX idx_session (session_id),
  INDEX idx_contact (contact_id)
);
```

---

## Related Documentation

- [Reminder Templates API](./reminders.md) - Scheduled email reminders
- [Webhook Integration](../webhooks/mailgun.md) - Email event webhooks
- [Contact Management](../contacts/README.md) - Link emails to contacts

---

**Implementation Status:** ✅ Complete  
**Last Updated:** December 2025  
**Maintained By:** Backend Team