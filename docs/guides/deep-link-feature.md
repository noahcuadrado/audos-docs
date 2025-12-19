# App Deep Linking Feature

## Overview

The customer-facing AI agent in spaces can now create **clickable deep links** to apps using a custom markdown syntax. This provides a much better UX than telling users to "open the XYZ app" - they can simply click a button.

## How It Works

### 1. Agent Uses Custom Markdown Syntax

When a customer asks to do something the agent can't handle directly (web search, image generation, payments, etc.), the agent creates a deep link:

```markdown
[Open Search App](app://web-search)
```

### 2. Custom ReactMarkdown Component Renderer

The `AgentChat` component (spaces/genesis-space/components/AgentChat.tsx) uses a custom link renderer:

```tsx
<ReactMarkdown
  components={{
    a: ({ href, children }) => {
      if (href?.startsWith('app://')) {
        const appId = href.replace('app://', '');
        return (
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('openApp', { detail: { appId } }));
            }}
            className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium mx-1"
          >
            {children}
          </button>
        );
      }
      // Regular links
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    }
  }}
>
  {message}
</ReactMarkdown>
```

### 3. Desktop Listens for Custom Events

The `Desktop` component (spaces/genesis-space/Desktop.tsx) listens for the `openApp` event:

```tsx
useEffect(() => {
  const handleOpenApp = (event: CustomEvent) => {
    const { appId } = event.detail;
    if (appId) {
      setActiveWindowId(appId);
      setIsAgentMinimized(false); // Show agent in split view if minimized
    }
  };

  window.addEventListener('openApp', handleOpenApp as EventListener);
  return () => window.removeEventListener('openApp', handleOpenApp as EventListener);
}, []);
```

## Example Conversation

**User**: "Can you search the web for healthy smoothie recipes?"

**Agent**: "I can help you manage your saved recipes, but for web searches, try [Open Search App](app://web-search). Once you find recipes you like, I can help you organize them in your data files!"

**Result**: User sees a clickable purple button labeled "Open Search App" that instantly opens the web search app.

## Visual Design

Deep links render as:
- **Purple button** (`bg-purple-600`)
- **Inline** with text flow
- **Hover state** (`hover:bg-purple-700`)
- **Small size** (text-xs) to not overwhelm the message
- **Rounded corners** for friendly appearance

## Agent Training

The agent is trained with this instruction in its system prompt:

```
When a customer asks to do something you cannot do directly, 
provide a clickable deep link to the relevant app using markdown syntax:

**Deep Link Syntax**: `[App Name](app://app-id)`

Examples:
- "To search the web, try [Open Search](app://web-search)"
- "For creating images, check out [Image Generator](app://image-creator)"

The deep link will render as a clickable purple button that opens the app instantly.
Use the exact app ID from the available apps list above.
```

## Benefits

1. **Better UX**: One click vs. hunting through the dock
2. **Contextual**: Agent suggests the right app at the right time
3. **Discoverable**: Users learn about apps through natural conversation
4. **Seamless**: No page navigation, just opens in side-by-side view
5. **Accessible**: Works on both desktop and mobile

## Implementation Notes

- Uses **custom events** (not React props) for loose coupling between AgentChat and Desktop
- Works in **compiled spaces** - no special build configuration needed
- **App IDs** must match exactly between config.json and the deep link
- Links work in both **streaming** and **completed** messages
- Agent automatically has access to app IDs and descriptions from config.json

## Future Enhancements

Potential improvements:
- Add app icons to the button
- Support deep links with query parameters: `app://search?query=recipes`
- Visual preview of the app on hover
- History of clicked deep links
- Analytics on which apps users discover through agent suggestions
