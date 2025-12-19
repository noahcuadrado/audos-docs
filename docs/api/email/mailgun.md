# Mailgun API Endpoints

Base URL: `{{baseUrl}}/api/mailgun`

## Overview

The Mailgun API provides endpoints for sending emails, receiving inbound emails via webhooks, and managing email messages. All API routes (except webhooks) require authentication.

---

## Webhook Endpoints (No Authentication)

These endpoints are called by Mailgun servers and do not require authentication. They verify requests using Mailgun's webhook signature.

### POST /webhooks/inbound

Receive inbound emails from Mailgun.

**Request Body** (multipart/form-data from Mailgun):

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | string | Unix timestamp of the event |
| `token` | string | Unique token for signature verification |
| `signature` | string | HMAC signature for verification |
| `from` | string | Sender email address |
| `sender` | string | Alternative sender field |
| `recipient` | string | Recipient email address |
| `To` | string | Alternative recipient field |
| `subject` | string | Email subject |
| `body-plain` | string | Plain text body |
| `body-html` | string | HTML body |
| `stripped-text` | string | Body with quoted text removed |
| `stripped-signature` | string | Signature extracted from email |
| `stripped-html` | string | HTML with quoted text removed |
| `message-headers` | string | JSON string of email headers |
| `Message-Id` | string | Unique message identifier |
| `attachment-count` | string | Number of attachments |

**Response:**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Missing sender or recipient information |
| 401 | Invalid webhook signature |
| 500 | Internal server error |

---

### POST /webhooks/delivery

Receive delivery events from Mailgun (delivered, opened, clicked, bounced, etc.).

**Request Body** (JSON from Mailgun):

```json
{
  "signature": {
    "timestamp": "1234567890",
    "token": "unique-token",
    "signature": "hmac-signature"
  },
  "event-data": {
    "event": "delivered",
    "message": {
      "headers": {
        "message-id": "message-id@domain.com"
      }
    },
    "recipient": "user@example.com",
    "recipient-domain": "example.com",
    "delivery-status": {
      "code": 250,
      "message": "OK"
    }
  }
}
```

**Supported Events:**

- `accepted` - Email accepted by Mailgun
- `delivered` - Email delivered to recipient
- `opened` - Email opened by recipient
- `clicked` - Link in email clicked
- `bounced` - Email bounced
- `complained` - Recipient marked as spam
- `unsubscribed` - Recipient unsubscribed

**Response:**

```json
{
  "success": true
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 401 | Invalid webhook signature |
| 500 | Internal server error |

---

## API Endpoints (Authenticated)

### POST /send

Send an email via Mailgun.

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `workspaceId` | string | Yes | Workspace identifier |
| `to` | string | Yes | Recipient email address |
| `subject` | string | Yes | Email subject (min 1 char) |
| `text` | string | Yes | Plain text body (min 1 char) |
| `html` | string | No | HTML body |
| `from` | string | No | Sender address (defaults to workspace default) |
| `replyTo` | string | No | Reply-to email address |
| `sessionId` | string | No | Link to workspace session |
| `sessionUuid` | string | No | Workspace session UUID |
| `userId` | string | No | Link to workspace user |
| `contactId` | string | No | Link to funnel contact |
| `metadata` | object | No | Custom metadata for tracking |

**Example Request:**

```json
{
  "workspaceId": "ws_123",
  "to": "user@example.com",
  "subject": "Welcome!",
  "text": "Hello and welcome to our platform.",
  "html": "<h1>Hello</h1><p>Welcome to our platform.</p>",
  "metadata": {
    "campaign": "onboarding",
    "step": "welcome"
  }
}
```

**Response:**

```json
{
  "success": true,
  "id": "wemail_abc123def456",
  "mailgunMessageId": "<20231211120000.abc123@domain.com>",
  "status": "sent"
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Validation error (invalid email, missing fields) |
| 500 | Internal server error |

---

### GET /messages/:workspaceId

Get email messages for a workspace with pagination and filtering.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `workspaceId` | string | Workspace identifier |

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Results per page (1-100) |
| `offset` | number | 0 | Pagination offset |
| `direction` | string | - | Filter by `inbound` or `outbound` |
| `status` | string | - | Filter by status (see below) |
| `from` | string | - | Filter by sender (partial match) |
| `to` | string | - | Filter by recipient (partial match) |
| `startDate` | string | - | Filter by date (ISO 8601 datetime) |
| `endDate` | string | - | Filter by date (ISO 8601 datetime) |
| `sessionId` | string | - | Filter by workspace session ID |
| `contactId` | string | - | Filter by funnel contact ID |

**Status Values:**

- `pending`
- `sent`
- `delivered`
- `failed`
- `bounced`
- `opened`
- `clicked`
- `complained`
- `unsubscribed`

**Example Request:**

```
GET /api/mailgun/messages/ws_123?limit=10&direction=outbound&status=delivered
```

**Response:**

```json
{
  "messages": [
    {
      "id": "wemail_abc123",
      "workspaceId": "ws_123",
      "direction": "outbound",
      "from": "sender@example.com",
      "to": "recipient@example.com",
      "subject": "Hello",
      "status": "delivered",
      "createdAt": "2023-12-11T12:00:00.000Z",
      ...
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Validation error |
| 500 | Internal server error |

---

### GET /messages/:workspaceId/:messageId

Get a specific email message by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `workspaceId` | string | Workspace identifier |
| `messageId` | string | Email message ID (e.g., `wemail_abc123`) |

**Example Request:**

```
GET /api/mailgun/messages/ws_123/wemail_abc123
```

**Response:**

```json
{
  "id": "wemail_abc123",
  "workspaceId": "ws_123",
  "workspaceSessionId": "wses_xyz789",
  "workspaceSessionUuid": "session-uuid",
  "funnelContactId": "contact_456",
  "mailgunMessageId": "<20231211120000.abc123@domain.com>",
  "direction": "outbound",
  "from": "Sender Name <sender@example.com>",
  "fromName": "Sender Name",
  "fromEmail": "sender@example.com",
  "to": "recipient@example.com",
  "toName": null,
  "toEmail": "recipient@example.com",
  "subject": "Hello World",
  "bodyPlain": "Hello, this is the email content.",
  "bodyHtml": "<p>Hello, this is the email content.</p>",
  "strippedText": "Hello, this is the email content.",
  "attachments": [],
  "attachmentCount": 0,
  "status": "delivered",
  "deliveredAt": "2023-12-11T12:00:05.000Z",
  "openedAt": null,
  "clickedAt": null,
  "failedAt": null,
  "errorMessage": null,
  "createdAt": "2023-12-11T12:00:00.000Z",
  "updatedAt": "2023-12-11T12:00:05.000Z"
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 404 | Email message not found |
| 500 | Internal server error |

---

### GET /health

Check Mailgun service health and configuration status.

**Example Request:**

```
GET /api/mailgun/health
```

**Response (Configured):**

```json
{
  "status": "ok",
  "configured": true,
  "domain": "m.example.com",
  "defaultFrom": "noreply@m.example.com"
}
```

**Response (Not Configured):**

```json
{
  "status": "not_configured",
  "configured": false,
  "domain": null,
  "defaultFrom": null
}
```

**Status Codes:**

| Status | Description |
|--------|-------------|
| 200 | Service is configured and ready |
| 503 | Service is not configured |

---

## Email Message Object

The full email message object contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (e.g., `wemail_abc123`) |
| `workspaceId` | string | Associated workspace |
| `workspaceSessionId` | string | Linked workspace session (nullable) |
| `workspaceSessionUuid` | string | Session UUID (nullable) |
| `workspaceUserId` | string | Linked workspace user (nullable) |
| `funnelContactId` | string | Linked funnel contact (nullable) |
| `mailgunMessageId` | string | Mailgun's message ID |
| `mailgunTimestamp` | timestamp | Mailgun event timestamp |
| `direction` | string | `inbound` or `outbound` |
| `from` | string | Full sender string |
| `fromName` | string | Sender display name (nullable) |
| `fromEmail` | string | Sender email address |
| `to` | string | Full recipient string |
| `toName` | string | Recipient display name (nullable) |
| `toEmail` | string | Recipient email address |
| `cc` | string | CC recipients (nullable) |
| `bcc` | string | BCC recipients (nullable) |
| `replyTo` | string | Reply-to address (nullable) |
| `subject` | string | Email subject |
| `bodyPlain` | string | Plain text body |
| `bodyHtml` | string | HTML body (nullable) |
| `strippedText` | string | Body without quoted text |
| `strippedSignature` | string | Extracted signature |
| `strippedHtml` | string | HTML without quoted text |
| `attachments` | array | Attachment metadata |
| `attachmentCount` | number | Number of attachments |
| `messageHeaders` | object | Raw email headers |
| `status` | string | Current status |
| `deliveredAt` | timestamp | Delivery timestamp |
| `openedAt` | timestamp | First open timestamp |
| `clickedAt` | timestamp | First click timestamp |
| `failedAt` | timestamp | Failure timestamp |
| `bouncedAt` | timestamp | Bounce timestamp |
| `errorMessage` | string | Error details (nullable) |
| `createdAt` | timestamp | Record creation time |
| `updatedAt` | timestamp | Last update time |

---

## Environment Variables

The Mailgun service requires the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `MAILGUN_API_KEY` | Yes | Mailgun API key |
| `MAILGUN_DOMAIN` | Yes | Mailgun sending domain |
| `MAILGUN_WEBHOOK_SIGNING_KEY` | Yes | Webhook signature verification key |
| `MAILGUN_FROM_EMAIL` | No | Default sender email |
| `MAILGUN_FROM_NAME` | No | Default sender name |
| `MAILGUN_SKIP_SIGNATURE_VERIFICATION` | No | Skip signature check in development |
