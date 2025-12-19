# Runtime Subdomain URL Resolution

**Scheduled**: December 8, 2025 (Afternoon)

## Problem

Autopilot-generated landing pages use absolute URLs (e.g., `https://dev.audos.app/api/apps/app_xxx/run`) which break when served from different environments or custom domains.

## Context

Custom domain architecture uses:
- `www.customdomain.com` for landing pages
- `app.customdomain.com` for spaces

Relative URLs won't work across subdomains.

## Solution (Option B - Runtime Subdomain Resolution)

1. In `server/services/autopilot-v2.ts`: Store space links as relative paths `/space/workspace-123` instead of absolute URLs

2. Add a runtime helper injected into landing page HTML:
   ```javascript
   function resolveAppUrl(relativePath) {
     const origin = window.location.origin;
     const isWww = origin.includes('www.');
     if (isWww) {
       return origin.replace('www.', 'app.') + relativePath;
     }
     return relativePath;
   }
   ```

3. Landing page code uses `resolveAppUrl('/space/workspace-123')` for space links

## Files to Modify

- `server/services/autopilot-v2.ts` - Change URL generation to use relative paths
- `server/services/hosting.ts` - Add the `resolveAppUrl` helper to landing page HTML template

## Notes

- Keep existing URL pattern `/space/workspace-123` (not `/s/`)
- This handles:
  - Dev environment (relative paths work)
  - Production with custom domains (`www.` → `app.` swap)
  - Future domain changes without regenerating code
