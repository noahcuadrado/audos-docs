---
id: intro
title: Audos API Documentation
sidebar_label: Introduction
slug: /intro
sidebar_position: 1
---

# Audos API Documentation

Welcome to the Audos API documentation. This comprehensive guide covers all API endpoints, architecture details, and integration patterns.

## Quick Navigation

### API Reference

| API | Description |
|-----|-------------|
| [Chat Streaming API](./api/chat/streaming) | Real-time AI chat with Server-Sent Events |
| [Message Capture API](./api/chat/messages) | Programmatic message capture and processing |
| [Mailgun Email API](./api/email/mailgun) | Send and track emails via Mailgun |
| [Reminder Templates API](./api/email/reminders) | Scheduled reminder system |
| [Entity Tags API](./api/tagging/entity-tags) | Tag contacts and sessions |
| [Workspace Tags API](./api/tagging/workspace-tags) | Define and manage workspace tags |

### Architecture

| Topic | Description |
|-------|-------------|
| [Contacts ↔ Sessions](./architecture/database/relationships/contacts-sessions) | Database relationship between funnel_contacts and workspace_sessions |

## Getting Started

### Base URL

```
https://audos.com
```

### Authentication

Most endpoints require JWT Bearer token authentication:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  https://audos.com/api/endpoint
```

### Response Format

All API responses are returned in JSON format:

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Handling

Errors include a descriptive message:

```json
{
  "success": false,
  "error": "Error description"
}
```

## Key Concepts

### Workspace

A workspace represents a business or organization using the Audos platform. Most API operations are scoped to a workspace.

### Session

A session tracks a user's interaction history within a workspace. Sessions can be linked to contacts for persistent tracking.

### Contact

A contact (funnel_contact) represents a lead or customer captured through forms, landing pages, or other touchpoints.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/audoapps/documentation/issues)
- **Email**: support@audoapps.com

---

*Last updated: December 2025*