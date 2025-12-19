# Claude Agent SDK Implementations

AppSmith uses 4 distinct Claude Agent SDK implementations, each with different system prompts and file access patterns.

## 1. Otto (Workspace Agent)

**Location**: `server/services/workspace-claude-agent.ts` → `chatWithWorkspace()` method  
**Endpoint**: `POST /api/workspace/:id/chat/stream`  
**Purpose**: Help users manage their entire workspace - CRM, Ads, Wallet, Posts, Analytics, etc.

### System Prompt
- Location: `workspaces/templates/otto-system-prompt.md`
- Loaded dynamically with workspace context (brand info, app counts, etc.)
- Can open windows via deep links: `[WINDOW:posts]`, `[EDITOR:filename]`

### File Access (Entrepreneur Mode)
Otto needs FULL workspace data access to answer questions:
- `apps/CRM/data/contacts.json` - Customer data
- `apps/Wallet/data/transactions.json` - Financial data
- `apps/Posts/data/posts.json` - Content data
- `apps/Ads/data/campaigns.json` - Ad campaign data
- `apps/Analytics/data/events.json` - Analytics events
- `workspace-branding.json` - Brand identity (auto-generated)
- `landing-pages/*.tsx` - Landing page source (from database)
- **Excluded**: `agent/`, `tools/*.ts` (security)

### Tools Available
- Standard Claude SDK tools: `read`, `write`, `edit`, `grep`, `glob`, `ls`
- Custom MCP tools: `generate_image`, `generate_video`, `recompile`
  - All custom tools use MCP (Model Context Protocol) format
  - Image/video generation auto-uploads to GCS
  - Recompile triggers OS workspace bundle regeneration
- **Excluded**: `bash` (security)

---

## 2. Studio > Edit > Landing Page

**Location**: `server/services/workspace-claude-agent.ts` → Different method (TODO: needs refactoring)  
**Endpoint**: TBD (currently shares Otto's endpoint - THIS IS THE BUG!)  
**Purpose**: Edit a specific landing page's code

### System Prompt
- Focused on React/TypeScript/Tailwind development
- Landing page best practices
- Brand consistency guidelines

### File Access (Landing Page Editing Mode)
Should ONLY have access to:
- `landing-pages/landing.tsx` - The landing page being edited
- `workspace-branding.json` - Brand identity for consistency
- **Excluded**: All workspace app data (`apps/*/data/`)
- **Excluded**: Other landing pages
- **Excluded**: `agent/`, `tools/*.ts`

### Tools Available
- Standard Claude SDK tools: `read`, `write`, `edit`, `grep`, `glob`, `ls`
- Custom MCP tools: `generate_image`, `generate_video`, `recompile`
  - All custom tools use MCP (Model Context Protocol) format
  - Image/video generation auto-uploads to GCS
  - Recompile triggers landing page bundle regeneration

---

## 3. Studio > Edit > Space

**Location**: `server/services/workspace-claude-agent.ts` → Same as Otto but `mode='entrepreneur'` + `isSpace=true`  
**Endpoint**: Same as Otto but with space ID  
**Purpose**: Edit space templates (full app bundles)

### System Prompt
- Location: Extracted from `space/agent/system-prompt.md` if it exists
- Includes space-specific coding conventions
- Full TypeScript/React development capabilities

### File Access (Space Editing Mode)
Full space bundle access:
- `Desktop.tsx`, `SpaceRuntimeContext.tsx` - Core files
- `components/**/*.tsx` - All components (recursively)
- `hooks/**/*.ts` - All hooks (recursively)
- `apps/*/App.tsx` - App components
- `apps/*/data/*.json` - App data files
- `config.json` - Space configuration
- `README.md`, `TESTING.md` - Documentation
- `data/*.json`, `community/*.json` - Shared data
- **`integrations/*/docs.md`** - Integration documentation (auto-injected)
- **`integrations/*/example.tsx`** - Integration examples (auto-injected)
- **`tools/*.ts`** - Executable discovery/testing tools (auto-injected)
- **Excluded**: `agent/` (custom agent config - security)

**Auto-Injection (Entrepreneur Mode)**:
1. **Integrations folder** (`integrations/`): All integration docs and examples (10 integrations × 2 files = 20 files)
2. **Tools folder** (`tools/`): Executable TypeScript tools for discovery and testing:
   - `apify-search-actors.ts` - Search Apify Store for actors (no API key required)
   - `apify-test-actor.ts` - Test actors and generate TypeScript code (requires API keys)

These folders are automatically copied from the local filesystem into the workspace directory during space editing sessions, giving Claude immediate access to integration documentation and discovery tools.

### Tools Available
- Standard Claude SDK tools: `read`, `write`, `edit`, `grep`, `glob`, `ls`, `bash`
- Custom MCP tools: `generate_image`, `generate_video`, `recompile`
  - All custom tools use MCP (Model Context Protocol) format
  - Image/video generation auto-uploads to GCS
  - Recompile triggers space bundle regeneration
- **Bash access**: Enabled for running discovery tools (apify-search-actors, apify-test-actor)

---

## 4. Space Runtime Agent (In-Space Agent)

**Location**: `spaces/genesis-space/components/AgentChat.tsx` (embedded in space)  
**Endpoint**: `POST /api/space/:id/chat/stream`  
**Purpose**: Help end-users interact with a deployed space app

### System Prompt
- Location: `space/agent/system-prompt.md` (if custom) or default
- User-assistance focused (not code editing)
- App-specific help and guidance

### File Access (Customer Mode)
Limited to user session data:
- `/user/{sessionId}/*.json` - User's personal data only
- App-specific data for the current user
- **Excluded**: Template files, other users' data, source code

### Tools Available
- Limited toolkit: `read`, `write` (user data only)
- **Excluded**: `edit`, `bash`, `grep`, `glob` (no code editing)

---

## Key Distinctions

| Feature | Otto | Landing Page Edit | Space Edit | Space Runtime |
|---------|------|-------------------|------------|---------------|
| **Mode** | entrepreneur | entrepreneur | entrepreneur | customer |
| **Scope** | Workspace data | Single landing page | Full space bundle | User session |
| **Can edit code?** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Can access workspace data?** | ✅ Yes | ❌ No | ✅ Yes (space data) | ⚠️ Limited (session only) |
| **Can run bash?** | ❌ No (uses custom tools) | ❌ No | ✅ Yes (for discovery tools) | ❌ No |
| **Deep links?** | ✅ Yes (windows) | ❌ No | ✅ Yes (apps) | ✅ Yes (apps) |

---

## Current Issues to Fix

1. **Otto lacks workspace data access** - Currently only syncing `.md` files for workspaces, should sync `apps/*/data/` 
2. **Landing page editing shares Otto's endpoint** - Needs separate method/flag to exclude workspace data
3. **File sync logic conflates use cases** - The `syncWorkspaceFiles()` method has a comment about "not needed when editing landing pages" but is being used by Otto
