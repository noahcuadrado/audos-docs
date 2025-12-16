# API Documentation

Complete reference for all Audos platform APIs.

## Available APIs

### 💬 Chat & Messaging
- **[Chat Streaming API](./chat/streaming.md)** - Real-time chat with Server-Sent Events (SSE)
  - Genesis Space chat endpoint
  - Context resolution and session management
  - WebSocket integration

- **[Message Capture API](./chat/messages.md)** - Programmatic message insertion
  - Send messages as user
  - Insert messages as assistant
  - Multi-channel support (web, mobile, email, API)

### 📧 Email Services
- **[Mailgun Integration](./email/mailgun.md)** - Email sending and tracking
  - Send emails via Mailgun
  - Query email history
  - Webhook handling
  - Status tracking (delivered, opened, clicked, etc.)

- **[Reminder Templates API](./email/reminders.md)** - Automated reminder system
  - Template management
  - Contact-based email delivery
  - Name personalization

### 🏷️ Tagging System
- **[Workspace Tags API](./tagging/workspace-tags.md)** - Tag definitions
  - Create and manage tags
  - Bulk operations
  - Tag organization

- **[Entity Tags API](./tagging/entity-tags.md)** - Contact and session tagging
  - Tag contacts and sessions
  - Automatic tag inheritance
  - Query entities by tags
  - Bulk tagging operations

## Postman Collections

Each API section includes links to Postman collections for easy testing:
- [Workspace Tagging System](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-a5933b28-eb0f-4303-942b-1f94802949c2)
- [Message API](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-96d2421b-9680-4fe1-84b4-3df4ecb33baf)
- [Mailgun API](https://lunar-escape-826616.postman.co/workspace/741e2a20-0047-4eba-8e76-85e9bd2f42a2/collection/33570542-d560cd71-f0c6-4ca4-9c94-a42b8335174b)

## Authentication

Most endpoints require authentication. See the [Authentication Guide](../guides/authentication.md) for details.

## Rate Limiting

API rate limits vary by endpoint. Check individual endpoint documentation for specific limits.

## Error Handling

All APIs use standard HTTP status codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Missing or invalid authentication
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Base URLs

- **Production:** `https://api.audoapps.com`
- **Staging:** TBD
- **Development:** `http://localhost:3000`

---

**Need Help?** Check the specific API documentation linked above.