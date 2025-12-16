# Integration Guides

Step-by-step guides and tutorials for integrating with the Audos platform.

## Quick Start Guides

### Getting Started
- [Authentication](./authentication.md) - Setting up API authentication
- [First API Call](./first-api-call.md) - Make your first request
- [Postman Setup](./postman-setup.md) - Import and configure collections

## Feature Guides

### Chat & Messaging
- [Implementing Chat Streaming](./chat-streaming-integration.md) - Real-time chat with SSE
- [Message Capture Integration](./message-capture-integration.md) - Programmatic messaging
- [WebSocket Setup](./websocket-integration.md) - Real-time updates

### Email Integration
- [Mailgun Setup](./mailgun-setup.md) - Configure email sending
- [Creating Reminder Templates](./reminder-templates-guide.md) - Automated reminders
- [Email Webhooks](./email-webhooks.md) - Handle email events

### Tagging System
- [Tag Management](./tag-management-guide.md) - Create and organize tags
- [Tagging Contacts](./tagging-contacts-guide.md) - Apply tags to contacts
- [Tag-Based Queries](./tag-queries-guide.md) - Search and filter by tags
- [Bulk Tagging Operations](./bulk-tagging-guide.md) - Efficient mass tagging

## Use Case Examples

### Contact Management
- [Contact Registration Flow](./contact-registration.md) - User onboarding
- [Contact Segmentation](./contact-segmentation.md) - Organize contacts with tags
- [Session Tracking](./session-tracking.md) - Link contacts to sessions

### Multi-Channel Communication
- [Unified Chat System](./unified-chat.md) - Web, mobile, email, API
- [Email-to-Chat Bridge](./email-chat-bridge.md) - Convert emails to chat messages
- [Notification System](./notification-system.md) - Multi-channel alerts

### Analytics & Reporting
- [User Journey Tracking](./user-journey-tracking.md) - Follow user paths
- [Tag Analytics](./tag-analytics.md) - Analyze tag usage
- [Email Performance](./email-analytics.md) - Track email metrics

## Best Practices

### Development
- [Error Handling](./error-handling.md) - Handle API errors gracefully
- [Rate Limiting](./rate-limiting.md) - Manage API limits
- [Testing](./testing-guide.md) - Test your integration

### Production
- [Performance Optimization](./performance-optimization.md) - Optimize API usage
- [Security Best Practices](./security-practices.md) - Secure your integration
- [Monitoring](./monitoring-guide.md) - Monitor API health

## Code Examples

### JavaScript/TypeScript
```typescript
// Example: Send a user message and get AI response
const response = await fetch('/api/workspace/ws_123/session/wses_abc/message/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What are my tasks?',
    process: true
  })
});

const data = await response.json();
console.log('AI Response:', data.assistantMessage.content);
```

### Python
```python
# Example: Tag a contact
import requests

response = requests.post(
    'https://api.audoapps.com/api/entity-tags/contacts/contact_123/tags',
    json={'tagId': 'wtag_abc123'}
)

result = response.json()
print(f"Tagged successfully, propagated to {result['propagatedToSessions']} sessions")
```

### cURL
```bash
# Example: Send an email
curl -X POST "https://api.audoapps.com/api/mailgun/send" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "ws_123",
    "to": "user@example.com",
    "subject": "Welcome!",
    "text": "Welcome to our platform!"
  }'
```

## Resources

- [API Reference](../api/README.md) - Complete API documentation
- [Architecture Overview](../architecture/README.md) - System design
- [Postman Collections](./postman-collections.md) - Import ready-to-use collections

## Support

For additional help:
- Check the specific guide for your use case above
- Review the [API documentation](../api/README.md)
- Search existing examples in code samples

---

**Last Updated:** December 15, 2025  
**Maintained By:** Backend Team