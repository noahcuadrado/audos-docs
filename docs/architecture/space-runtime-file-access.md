# SpaceRuntimeContext File Access Patterns

This document describes how file access works in spaces for entrepreneur (owner) and customer (visitor) modes.

## Overview

The SpaceRuntimeContext provides mode-aware storage operations that automatically route file operations to the correct storage location based on who is accessing the space:

- **Entrepreneur Mode**: Full read/write access to space template files
- **Customer Mode**: Read/write access only to personal instance files

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SpaceRuntimeContext                               │
│                      (client-side React context)                         │
│                                                                          │
│  mode: 'entrepreneur' | 'customer'                                      │
│  spaceId: string                                                         │
│  sessionId: string (customer mode only)                                 │
│                                                                          │
│  Storage Operations (mode-aware):                                        │
│  ├── readFile(path)  → automatically routes based on mode              │
│  ├── writeFile(path, content)  → automatically routes based on mode    │
│  └── listFiles(dirPath?)  → automatically routes based on mode         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                          │
          Entrepreneur Mode              Customer Mode
                    │                          │
                    ▼                          ▼
┌───────────────────────────────┐  ┌───────────────────────────────────────┐
│ GET/PUT /api/space/:spaceId/  │  │ GET/PUT /api/space/:spaceId/user/     │
│        file/{path}            │  │        :sessionId/file/{path}         │
│                               │  │                                        │
│ Uses: spaceFileService        │  │ Uses: userFileService                 │
│ Storage: /spaces/{spaceId}/   │  │ Storage: /user/{sessionId}/           │
└───────────────────────────────┘  └───────────────────────────────────────┘
```

## Client-Side: SpaceRuntimeContext

### Location
`spaces/genesis-space/SpaceRuntimeContext.tsx`

### API Routing Logic

```typescript
// Get API base path based on mode
const getApiBasePath = () => {
  if (mode === 'entrepreneur') {
    return `/api/space/${spaceId}`;
  } else {
    return `/api/space/${spaceId}/user/${sessionId}`;
  }
};
```

### Storage Operations

#### `readFile(path: string)`
- Reads a file from mode-appropriate storage
- Returns `Promise<string>`
- **Entrepreneur mode**: Throws error for non-existent files (template files should exist)
- **Customer mode**: Returns empty object `{}` for non-existent files (graceful fallback for new instances)
- Security: Validates path to prevent traversal attacks

#### `writeFile(path: string, content: string)`
- Writes content to mode-appropriate storage
- Returns `Promise<void>`
- Security: Validates path to prevent traversal attacks

#### `listFiles(dirPath?: string)`
- Lists files in a directory
- Returns `Promise<FileInfo[]>`
- Returns array of `{ path, size, isDirectory }`

### Path Security Validation

All paths are validated with multiple security layers:

```typescript
const validatePath = (logicalPath: string): void => {
  // Layer 1: Prevent path traversal with ..
  if (logicalPath.includes('..')) throw new Error('Invalid path');
  
  // Layer 2: Reject absolute paths
  if (logicalPath.startsWith('/')) throw new Error('Invalid path');
  
  // Layer 3: Reject protocol-prefixed paths
  if (logicalPath.includes(':')) throw new Error('Invalid path');
  
  // Layer 4: Reject backslashes
  if (logicalPath.includes('\\')) throw new Error('Invalid path');
};
```

## Server-Side: API Routes

### Location
`server/routes/api/space.routes.ts`

### Entrepreneur Mode Routes

| Route | Method | Description | Service |
|-------|--------|-------------|---------|
| `/api/space/:spaceId/file/*` | GET | Read template file | spaceFileService |
| `/api/space/:spaceId/file/*` | PUT | Write template file | spaceFileService |
| `/api/space/:spaceId/files` | GET | List template files | spaceFileService |

**Storage Path**: `/spaces/{spaceId}/{filePath}`

### Customer Mode Routes

| Route | Method | Description | Service |
|-------|--------|-------------|---------|
| `/api/space/:spaceId/user/:sessionId/file/*` | GET | Read instance file | userFileService |
| `/api/space/:spaceId/user/:sessionId/file/*` | PUT | Write instance file | userFileService |
| `/api/space/:spaceId/user/:sessionId/files` | GET | List instance files | userFileService |

**Storage Path**: `/user/{sessionId}/{filePath}`

## useSpaceData Hook

### Location
`spaces/genesis-space/hooks/useSpaceData.ts`

### Usage

```typescript
import { useSpaceData } from '../../hooks/useSpaceData';

interface Activity {
  id: string;
  name: string;
}

export default function MyApp({ dataFile }: { dataFile: string }) {
  const { data, update, loading, error } = useSpaceData<Activity[]>({
    dataFile,
    autoFetch: true
  });

  const items = data || [];

  const addItem = async (item: Activity) => {
    await update([...items, item]);
  };

  return (/* ... */);
}
```

### How It Works

1. Hook receives `dataFile` prop (e.g., `"data/activities.json"`)
2. Uses `useSpaceRuntime()` to get mode-aware `readFile`/`writeFile`
3. Auto-fetches data on mount if `autoFetch: true`
4. Provides `update()` function for persisting changes

## Data Flow Examples

### Example 1: Entrepreneur Editing Template Data

```
Entrepreneur opens space → mode = 'entrepreneur'
App reads data/activities.json
  → SpaceRuntimeContext.readFile('data/activities.json')
  → GET /api/space/workspace-557275/file/data/activities.json
  → spaceFileService.readFile('workspace-557275', 'data/activities.json')
  → Returns content from /spaces/workspace-557275/data/activities.json

Entrepreneur adds activity
  → SpaceRuntimeContext.writeFile('data/activities.json', newContent)
  → PUT /api/space/workspace-557275/file/data/activities.json
  → spaceFileService.writeFile('workspace-557275', 'data/activities.json', content)
  → Saves to /spaces/workspace-557275/data/activities.json
```

### Example 2: Customer Using Their Instance

```
Customer opens space → mode = 'customer', sessionId = 'session-abc123'
App reads data/activities.json
  → SpaceRuntimeContext.readFile('data/activities.json')
  → GET /api/space/workspace-557275/user/session-abc123/file/data/activities.json
  → userFileService.readFile('session-abc123', 'data/activities.json')
  → Returns content from /user/session-abc123/data/activities.json
  → If file doesn't exist, returns '{}'

Customer adds activity
  → SpaceRuntimeContext.writeFile('data/activities.json', newContent)
  → PUT /api/space/workspace-557275/user/session-abc123/file/data/activities.json
  → userFileService.writeFile('session-abc123', 'data/activities.json', content)
  → Saves to /user/session-abc123/data/activities.json
```

## Key Principles

### 1. Data Isolation
- Entrepreneurs edit the **template** that defines the starting state
- Each customer gets their own **isolated copy** of data
- Customer data is private and not visible to other customers

### 2. Session Persistence
- Customer sessions are identified by sessionId
- Session data persists across browser sessions (same device)
- Email-authenticated sessions use email-based sessionId for cross-device access

### 3. Graceful Fallbacks
- **Customer mode**: Reading non-existent files returns `{}` (empty object) to support first-time users
- **Entrepreneur mode**: Missing files throw errors (template files should be created via the compiler validation)
- Apps should handle empty initial state gracefully
- The `useSpaceData` hook converts empty objects to empty arrays when expected
- The space compiler auto-creates missing data files referenced in config.json

### 4. Security First
- All file paths validated against traversal attacks
- No access to parent directories or system files
- Customer mode restricts access to `/user/{sessionId}/` only

## Related Files

| File | Purpose |
|------|---------|
| `spaces/genesis-space/SpaceRuntimeContext.tsx` | Client-side mode-aware storage context |
| `spaces/genesis-space/hooks/useSpaceData.ts` | React hook for data persistence |
| `server/routes/api/space.routes.ts` | API endpoints for file operations |
| `server/services/space-file.service.ts` | Entrepreneur mode file service |
| `server/services/user-file.service.ts` | Customer mode file service |
| `spaces/genesis-space/agent/system-prompt.md` | Agent guidance for data file patterns |
| `spaces/genesis-space/agent/customer-prompt.md` | Customer agent with data-only access |
