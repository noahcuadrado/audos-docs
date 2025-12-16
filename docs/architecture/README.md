# Architecture Documentation

System architecture, database design, and data flow documentation for the Audos platform.

## Overview

This section documents the technical architecture of the platform including:
- Database schema and relationships
- System design patterns
- Data flow and integrations
- Service architecture

## Database

### Tables
- [Funnel Contacts](./database/tables/funnel-contacts.md) - Contact management
- [Workspace Sessions](./database/tables/workspace-sessions.md) - Session tracking
- [Workspace Tags](./database/tables/workspace-tags.md) - Tag definitions
- [Entity Tags](./database/tables/entity-tags.md) - Tag associations

### Relationships
- **[Contacts ↔ Sessions](./database/relationships/contacts-sessions.md)** ✅ Documented
  - Foreign key relationship
  - Session linking and tracking
  - User journey analytics

## System Architecture

### Tagging System
The platform uses a comprehensive tagging system with two main components:

#### 1. Workspace Tags
- Tag definitions and management
- Color-coded organization
- Hierarchical structure support
- See: [Workspace Tags API](../api/tagging/workspace-tags.md)

#### 2. Entity Tags
- Apply tags to contacts and sessions
- Automatic tag inheritance (contact → sessions)
- Source tracking (direct vs inherited)
- See: [Entity Tags API](../api/tagging/entity-tags.md)

**Complete Documentation:** `WORKSPACE_TAGGING_SYSTEM.md` (project root)

### Chat & Messaging Architecture

#### Chat Context Resolution
The chat system handles flexible input parameters to resolve:
- Workspace identification from spaceId
- Session management (email-based or session ID)
- User context for permissions
- WebSocket subscriptions

**Key Components:**
- Genesis Space chat (public-facing)
- Internal workspace chat
- Message capture system
- Real-time WebSocket broadcasting

See: [Chat Streaming API](../api/chat/streaming.md)

#### Message Flow
```
User Input → Message Capture → LLM Processing → Response Generation
     ↓              ↓                                    ↓
  Database    WebSocket Broadcast              Assistant Message
```

### Email Architecture

#### Mailgun Integration
- Transactional email delivery
- Email tracking (delivered, opened, clicked)
- Webhook event processing
- Message history and analytics

See: [Mailgun API](../api/email/mailgun.md)

#### Reminder System
- Template-based reminders
- Contact personalization
- Automated scheduling
- Integration with chat system

See: [Reminder Templates API](../api/email/reminders.md)

## Data Flow Patterns

### Contact Registration Flow
```
1. User submits email
   ↓
2. Create/Get funnel_contact
   ↓
3. Create workspace_session
   ↓
4. Link contact to session
   ↓
5. Return registration confirmation
```

### Tag Inheritance Flow
```
1. Tag applied to contact
   ↓
2. Find all linked sessions
   ↓
3. Create inherited entity_tags for each session
   ↓
4. Track source (contact → session)
   ↓
5. Sessions now show inherited tags
```

### Message Capture Flow
```
1. Message received (user or assistant)
   ↓
2. Validate and save to database
   ↓
3. Broadcast via WebSocket to subscribers
   ↓
4. If user message + process=true:
   ├─ Call LLM for response
   ├─ Generate assistant message
   └─ Save and broadcast response
```

## Design Patterns

### Polymorphic Associations
The `entity_tags` table uses polymorphic associations:
- Single table for multiple entity types (contacts, sessions)
- `entity_type` + `entity_id` columns for flexibility
- Efficient queries with composite indexes

### Event Broadcasting
WebSocket-based real-time updates:
- Session-based subscriptions
- Message broadcasting
- Status updates
- Multi-client synchronization

### Prefixed UUIDs
Consistent ID prefixing for clarity:
- `wtag_*` - Workspace tags
- `etag_*` - Entity tags
- `wses_*` - Workspace sessions
- `wemail_*` - Workspace emails
- `rtmpl_*` - Reminder templates

## Performance Considerations

### Database Optimization
- Composite indexes on foreign keys
- Index on entity_type + entity_id for entity_tags
- Efficient pagination for large datasets
- Bulk operations for tagging

### Caching Strategy
- Session data cached for active sessions
- Tag definitions cached per workspace
- Contact lookup optimized with indexes

### Async Processing
- Email sending via background jobs
- Tag inheritance propagation for large datasets
- Webhook processing in separate queue

## Security

### Data Access
- Workspace-level isolation
- Session-based authentication
- Email-based user identification
- File access per user directory

### API Security
- Authentication required for sensitive endpoints
- Rate limiting per workspace
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM

## Related Documentation

- [API Reference](../api/README.md) - Complete API documentation
- [Guides](../guides/README.md) - Integration guides and tutorials

---

**Last Updated:** December 15, 2025  
**Maintained By:** Backend Team