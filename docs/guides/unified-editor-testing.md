# Unified Agentic Editor - Testing Guide

## Overview
Comprehensive test suite for the unified agentic editor system, validating all three file types: mini-apps, landing pages, and OS instances.

## Test Script

The test script (`test-unified-editor.ts`) provides automated end-to-end testing for:

1. **Session Creation** - Creating editor sessions for all file types
2. **WebSocket Streaming** - Real-time LLM code generation
3. **Preview Generation** - Compilation and preview URL generation
4. **Apply/Rollback** - Production updates and rollback workflows
5. **Checkpoints** - Session checkpoint management

## Prerequisites

Before running tests, ensure you have:

1. **Running Server**: The application must be running on `http://localhost:5000`
2. **Test Data**: Valid IDs for testing (mini-app, landing page, OS instance)
3. **Dependencies**: All packages installed (`npm install`)

## Quick Start

### Option 1: Using Environment Variables (Recommended)

```bash
# Set test IDs
export TEST_APP_ID="your-mini-app-id"
export TEST_LANDING_ID="your-landing-page-id"
export TEST_OS_ID="your-os-instance-id"

# Run tests
npm run test:unified-editor
```

### Option 2: Using Script Configuration

Edit `test-unified-editor.ts` and replace the placeholder IDs:

```typescript
const testConfigs: TestConfig[] = [
  {
    name: 'Mini-App Edit Test',
    fileType: 'mini_app',
    targetId: 'abc123',  // Replace with actual app ID
    instruction: 'Add a new button...',
    expectedChanges: ['button element'],
  },
  // ...
];
```

Then run:

```bash
tsx test-unified-editor.ts
```

## Getting Test IDs

### From Database

```sql
-- Get mini-app ID
SELECT id, name FROM apps WHERE type = 'mini_app' LIMIT 1;

-- Get landing page ID
SELECT id, name FROM landing_pages LIMIT 1;

-- Get OS instance ID
SELECT id, name FROM os_instances LIMIT 1;
```

### From API

```bash
# List apps
curl http://localhost:5000/api/apps

# List landing pages
curl http://localhost:5000/api/landing-pages

# List OS instances
curl http://localhost:5000/api/os
```

## Test Suite Structure

### Test 1: Session Creation
- Creates a new editor session
- Validates session response structure
- Checks metadata storage

### Test 2: Edit Streaming
- Establishes WebSocket connection
- Sends edit instruction
- Monitors phase transitions (thinking → editing → preview)
- Collects code chunks
- Validates preview generation

### Test 3: Session Status
- Fetches current session state
- Validates status updates
- Checks metadata persistence

### Test 4: Checkpoints
- Lists all session checkpoints
- Validates checkpoint structure
- Checks creation timestamps

### Test 5: Apply Changes
- Applies edits to production
- Validates application timestamp
- Confirms production update

### Test 6: Final Status
- Re-checks session after apply
- Validates final state
- Confirms completion

## Expected Output

```
╔════════════════════════════════════════════════════════════╗
║      UNIFIED AGENTIC EDITOR - COMPREHENSIVE TEST SUITE     ║
╚════════════════════════════════════════════════════════════╝

************************************************************
  TESTING: Mini-App Edit Test
************************************************************

============================================================
TEST: Create Session for mini_app
============================================================

Creating editor session for Mini-App Edit Test...
✓ Session created: sess_abc123
  File Type: mini_app
  Status: active

============================================================
TEST: Stream Edit via WebSocket
============================================================

✓ WebSocket connected
Sending edit instruction: "Add a new button..."
  Phase: thinking
    Analyzing instruction...
  Phase: editing
    Generating code...
.......................
✓ Preview generated
  Preview URL: /preview/sess_abc123
✓ Edit workflow complete
  Total phases: 3
  Code chunks received: 23

[... more tests ...]

============================================================
TEST SUITE SUMMARY
============================================================

✓ Mini-App Edit Test
✓ Landing Page Edit Test
✓ OS Instance Edit Test

Total: 3/3 tests passed
```

## Test Customization

### Custom Instructions

Modify the `instruction` field in test configs to test different scenarios:

```typescript
{
  name: 'Complex Layout Change',
  fileType: 'mini_app',
  targetId: 'app-123',
  instruction: 'Add a sidebar navigation with 5 menu items and icons',
  expectedChanges: ['sidebar', 'navigation', 'menu items'],
}
```

### Custom Assertions

Add validation logic after each test step:

```typescript
const session = await testSessionStatus(sessionId);
console.assert(session.status === 'active', 'Session should be active');
console.assert(session.fileType === 'mini_app', 'File type mismatch');
```

## Troubleshooting

### WebSocket Connection Fails

```
✗ WebSocket error: connect ECONNREFUSED
```

**Solution**: Ensure the server is running on port 5000:
```bash
npm run dev
```

### Invalid Target ID

```
✗ API Error (404): Target not found
```

**Solution**: Verify the target ID exists in the database:
```bash
npm run db:studio
# Check apps, landing_pages, or os_instances table
```

### Timeout Errors

```
✗ Error: Edit streaming timeout
```

**Solution**: Increase timeout values in the test script:
```typescript
setTimeout(() => {
  // ...
}, 120000); // Increase from 60s to 120s
```

### Preview Not Generated

```
✗ Error: Preview generation failed
```

**Solution**: Check server logs for compilation errors:
```bash
# Server logs will show ESBuild errors
tail -f logs/server.log
```

## Manual Testing Workflow

For manual testing without the script:

### 1. Create Session

```bash
curl -X POST http://localhost:5000/api/unified-editor/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "fileType": "mini_app",
    "targetId": "your-app-id",
    "metadata": {
      "source": "manual_test"
    }
  }'
```

### 2. Connect WebSocket

```javascript
const ws = new WebSocket('ws://localhost:5000/ws?unified_editor=true');

ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'unified_edit',
    sessionId: 'sess_abc123',
    instruction: 'Add a new feature...',
  }));
});

ws.on('message', (data) => {
  console.log(JSON.parse(data.toString()));
});
```

### 3. Check Session

```bash
curl http://localhost:5000/api/unified-editor/sessions/sess_abc123
```

### 4. Apply Changes

```bash
curl -X POST http://localhost:5000/api/unified-editor/sessions/sess_abc123/apply
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/test.yml
- name: Test Unified Editor
  env:
    TEST_APP_ID: ${{ secrets.TEST_APP_ID }}
    TEST_LANDING_ID: ${{ secrets.TEST_LANDING_ID }}
    TEST_OS_ID: ${{ secrets.TEST_OS_ID }}
  run: |
    npm run dev &
    sleep 5
    npm run test:unified-editor
```

## Performance Benchmarks

Expected performance metrics:

- **Session Creation**: < 200ms
- **WebSocket Connection**: < 100ms
- **Code Generation**: 5-30 seconds (depends on complexity)
- **Preview Compilation**: 2-10 seconds
- **Apply Changes**: < 500ms

## Next Steps

After successful testing:

1. **UI Testing**: Test the editor UI in browser
2. **Integration Testing**: Test with real workspace data
3. **Load Testing**: Test multiple concurrent sessions
4. **Error Recovery**: Test interruption handling

## Support

For issues or questions:
- Check server logs: `/tmp/logs/`
- Review API documentation: `API_DOCUMENTATION.md`
- Check implementation plan: `COMPLETE_UNIFIED_EDITOR_ROADMAP.md`
