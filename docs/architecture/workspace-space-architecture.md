# Workspace & Space Architecture

## Overview

AppSmith uses a dual-layer architecture for user workspaces:
- **Workspaces**: Business-level containers with Otto agent, brand assets, landing pages, and workspace app data
- **Spaces**: Customer-facing OS environments with custom apps, AI agents, and runtime contexts

## Data Storage Architecture

### 1. Workspace App Data (`apps/` directory)

**Location**: `/workspaces/{workspaceId}/apps/`

**Purpose**: Stores workspace-level application data that Otto can read/write

**Structure**:
```
apps/
├── Wallet/
│   └── data/
│       └── transactions.json
├── CRM/
│   └── data/
│       └── contacts.json
├── Ads/
│   └── data/
│       └── campaigns.json
├── Posts/
│   └── data/
│       └── drafts.json
└── Analytics/
    └── data/
        └── events.json
```

**Characteristics**:
- **Created on-demand**: Directories are created when first needed (not pre-initialized)
- **Otto access**: Otto (workspace agent) has full read/write access via file sync
- **Entrepreneur-scoped**: Data belongs to the workspace owner/entrepreneur
- **Storage adapter**: GCS in production, local filesystem in development

**Current Status**:
✅ Otto can access workspace app data
✅ Files sync correctly to/from Otto's working directory
⚠️  Only Wallet/ is currently initialized by default ($150 credit system)
⚠️  Other apps (CRM, Ads, Posts, Analytics) created on first use

---

### 2. Space App Data (`data/` directory in spaces)

**Location**: `/spaces/{spaceId}/data/`

**Purpose**: Stores app data for Space runtime apps (customer-facing OS environment)

**Structure**:
```
data/
├── activities.json      # ActivityTracker app data
├── notes.json          # NotesLogger app data
└── [custom].json       # Additional app data files
```

**How It Works**:

1. **Genesis Space Template** (`spaces/genesis-space/`):
   - Source template with pre-built apps and components
   - Contains initial data files with empty arrays: `[]`
   - Apps reference data files via `config.json`:
     ```json
     {
       "apps": [
         {
           "id": "activity-tracker",
           "component": "apps/ActivityTracker/App.tsx",
           "dataFile": "data/activities.json"
         }
       ]
     }
     ```

2. **App Data Access Pattern**:
   - Apps use `useSpaceData` hook:
     ```typescript
     const { data, update, loading } = useSpaceData({
       dataFile: 'data/activities.json',
       autoFetch: true
     });
     ```
   - Hook uses `SpaceRuntimeContext` for mode-aware routing:
     - **Entrepreneur mode**: Reads/writes `/spaces/{spaceId}/{dataFile}` (template editing)
     - **Customer mode**: Reads/writes `/user/{sessionId}/{dataFile}` (instance data)

3. **Data File API Routes**:
   - Read: `GET /api/spaces/{spaceId}/file/{dataFile}`
   - Write: `POST /api/spaces/{spaceId}/file/{dataFile}`
   - Customer mode: `GET /api/user/{sessionId}/file/{dataFile}`

**Current Status**:
❌ **CRITICAL BUG**: When workspaces are created with cloned spaces, data files are NOT copied to GCS
❌ Space instances have `spaceId` references but no actual files in GCS
❌ Apps fail to load because data files don't exist
❌ No initialization process ensures space files are properly cloned

---

## Workspace Creation Flow

### Current Flow (BROKEN)

1. **Workspace Created**:
   ```typescript
   const workspace = await storage.createWorkspace({
     configId: 883383,
     businessName: 'MamaRise',
     spaceId: 'test-space-883383'  // Reference assigned
   });
   ```

2. **Space Reference Assigned**:
   - Database row created with `space_id = 'test-space-883383'`
   - ❌ BUT no files copied to GCS

3. **Result**:
   - Workspace exists in database ✅
   - Space ID reference exists ✅
   - **Space files in GCS** ❌ (MISSING)
   - **Data files** ❌ (MISSING)
   - **Apps cannot load** ❌ (BROKEN)

### Required Fix

Need atomic space initialization that:
1. Clones ALL files from genesis-space to new space ID in GCS
2. Copies Desktop.tsx, config.json, components, hooks, apps, **AND data/**
3. Initializes data files with proper default values
4. Verifies all files exist before marking workspace as ready

---

## File Sync Systems

### Otto Workspace Agent File Sync

**Location**: `server/services/workspace-claude-agent.ts`

**What Gets Synced**:
```typescript
const directories = ['data', 'apps', 'community', 'tools'];
// Does NOT sync landing-pages/ or space template files
```

**Process**:
1. Reads files from workspace file service (GCS or local)
2. Writes to `/tmp/workspace-{workspaceId}/`
3. Otto SDK has access to this directory
4. After editing, files sync back to GCS
5. Recursive sync captures nested directories (e.g., `apps/Wallet/data/`)

**Status**: ✅ Working correctly

---

### Space File Sync (BROKEN)

**What Should Happen**:
1. Workspace created with `spaceId` reference
2. Space cloning triggered automatically
3. All genesis-space files copied to GCS
4. Space becomes available for customer access

**What Actually Happens**:
1. Workspace created with `spaceId` reference
2. ❌ Space cloning NOT triggered
3. ❌ GCS bucket empty for new space
4. ❌ Apps fail to load

**Manual Script Exists**: `server/scripts/create-test-workspace.ts`
- Can clone spaces correctly
- NOT integrated into workspace creation flow
- Must be run manually

---

## Mode-Aware Data Access

### Entrepreneur Mode
- **Who**: Workspace owner/entrepreneur editing space templates
- **Storage**: `/spaces/{spaceId}/data/activities.json`
- **Purpose**: Edit template/default data that new customer instances will clone

### Customer Mode
- **Who**: End customers using the deployed space
- **Storage**: `/user/{sessionId}/data/activities.json`
- **Purpose**: Per-customer instance data (isolated, private)
- **Requires**: Valid `sessionId` parameter

### Example: ActivityTracker App

```typescript
// App component receives dataFile from config
<ActivityTracker dataFile="data/activities.json" />

// Inside component
const { data, update } = useSpaceData({ 
  dataFile // Will route to correct storage based on mode
});
```

**SpaceRuntimeContext** handles routing:
```typescript
const apiPath = mode === 'entrepreneur'
  ? `/api/spaces/${spaceId}/file/${dataFile}`
  : `/api/user/${sessionId}/file/${dataFile}`;
```

---

## Critical Issues & Required Fixes

### Issue #1: Space Files Not Cloned on Workspace Creation

**Problem**: Workspaces reference space IDs that don't exist in GCS

**Impact**:
- Space apps can't load (missing Desktop.tsx, config.json)
- Data files don't exist (apps fail on useSpaceData fetch)
- Customer-facing spaces are completely broken

**Required Fix**:
1. Integrate space cloning into workspace creation flow
2. Ensure atomic operation (workspace + space together)
3. Add verification step to confirm all files copied
4. Add retry logic for GCS failures

---

### Issue #2: Workspace Apps Not Pre-Initialized

**Problem**: Only Wallet app has initialized data directory

**Impact**:
- Otto sees only "apps/Wallet" when running `ls apps/`
- Other apps (CRM, Ads, Posts, Analytics) missing
- Otto gives incomplete/confusing responses about available apps

**Current Behavior**:
- Apps created on first use (lazy initialization)
- Otto doesn't know they exist until used

**Options**:
1. **Pre-initialize all app directories** on workspace creation
2. **Add app manifest** that Otto can reference (even if directories don't exist yet)
3. **Hybrid**: Pre-create empty directories with placeholder JSON files

**Recommendation**: Option 3 (hybrid) - create empty directories with `[]` or `{}` default values

---

### Issue #3: No Central App Registry

**Problem**: App data directories scattered without clear inventory

**Current State**:
- Workspace apps: Wallet, CRM, Ads, Posts, Analytics (hardcoded in code)
- Space apps: Defined in space config.json (dynamic)
- No unified manifest or discovery mechanism

**Proposed Solution**:
Add `workspace-apps.json` manifest:
```json
{
  "apps": [
    {
      "id": "wallet",
      "name": "Wallet",
      "dataPath": "apps/Wallet/data/transactions.json",
      "initialized": true
    },
    {
      "id": "crm",
      "name": "CRM",
      "dataPath": "apps/CRM/data/contacts.json",
      "initialized": false
    }
  ]
}
```

Benefits:
- Otto can discover all available apps
- Track initialization status
- Enable on-demand initialization
- Support dynamic app registration

---

## Implementation Priorities

### P0 (Critical - Blocks Users)
1. **Fix space cloning on workspace creation**
   - Integrate create-test-workspace logic into main flow
   - Ensure data/ directory files are copied
   - Add verification step

### P1 (High - Poor UX)
2. **Pre-initialize all workspace app directories**
   - Create apps/CRM/data/contacts.json with `[]`
   - Create apps/Ads/data/campaigns.json with `[]`
   - Create apps/Posts/data/drafts.json with `[]`
   - Create apps/Analytics/data/events.json with `[]`

### P2 (Medium - Nice to Have)
3. **Add workspace apps manifest**
   - Create workspace-apps.json
   - Update Otto system prompt to reference it
   - Enable dynamic app discovery

---

## Related Files

### Workspace File Service
- `server/services/workspace-file.service.ts`
- `server/services/workspace-claude-agent.ts`

### Space File Service
- `server/services/space-file.service.ts`
- `server/scripts/create-test-workspace.ts`

### Space Runtime
- `spaces/genesis-space/SpaceRuntimeContext.tsx`
- `spaces/genesis-space/hooks/useSpaceData.ts`

### Database Schema
- `shared/schema.ts` - Workspace model with `spaceId` reference
