# Section-Based Editing System

## Overview
Section-based editing enables surgical, token-efficient modifications to mini-apps and landing pages by allowing LLM edits to target specific code sections rather than regenerating entire files.

## Implementation Status
✅ **Completed (Mini-Apps)** - Fully implemented and tested
⏳ **Pending (Landing Pages)** - Implementation complete, testing pending

## Architecture

### Workflow
```
Parse → Edit → Assemble → Compile
```

1. **Parse**: Extract sections from source code using markers (`// === SECTION N: NAME ===`)
2. **Edit**: LLM modifies specific section with context from other sections
3. **Assemble**: Reconstruct full source from edited sections
4. **Compile**: ESBuild compiles updated code

### Section Structure

#### Mini-Apps (9 sections)
1. IMPORTS AND TYPES
2. CONSTANTS AND CONFIGURATION
3. API AND DATA FUNCTIONS
4. BUSINESS LOGIC FUNCTIONS
5. UI COMPONENTS
6. CUSTOM HOOKS
7. MAIN COMPONENT
8. SESSION MANAGEMENT
9. EXPORT (FINAL)

#### Landing Pages (8 sections)
1. IMPORTS AND TYPES
2. CONSTANTS AND CONFIGURATION
3. UTILITY FUNCTIONS
4. HERO SECTION
5. FEATURES SECTION
6. CTA SECTION
7. MAIN COMPONENT
8. EXPORT (FINAL)

## API Endpoint

### POST /api/apps/:app_id/edit-section

**Request Body:**
```json
{
  "sectionNumber": 2,
  "editInstruction": "Add a new constant called MAX_ITEMS with value 50"
}
```

**Response:**
```json
{
  "ok": true,
  "sectionEdited": 2,
  "file_name": "app.tsx",
  "code_url": "https://.../api/apps/{id}/code",
  "app_url": "https://.../api/apps/{id}/run",
  "bundle_size_kb": 20
}
```

## Test Results

### Mini-App Test (app_947ff90e - listen-shelf)
- ✅ Parsed 9 sections successfully
- ✅ Edited section 2 (CONSTANTS AND CONFIGURATION)
- ✅ Added MAX_ITEMS constant as requested
- ✅ Reassembled and compiled (20 KB bundle)
- ✅ Verification passed

### Landing Page Test
- ⏳ Not yet tested

## Key Functions

### LLMService Methods
```typescript
// Parse source into sections
parseSections(source: string): Map<number, { marker: string; content: string }>

// Edit specific section
editSection(sectionNumber, currentContent, editInstruction, appType, contextSections?)

// Reassemble sections
assembleSections(sections: Map<...>): string

// High-level edit function
editAppBySection(source, sectionNumber, editInstruction, appType): Promise<string>
```

## Advantages
1. **Token Efficiency**: Edit only the relevant section instead of entire file
2. **Precision**: Surgical modifications reduce unintended changes
3. **Context Aware**: LLM receives snippets of other sections for compatibility
4. **Fast Compilation**: Smaller edits = faster compile times
5. **Predictable**: Section structure makes code organization consistent

## Architect Review Findings

### ✅ Strengths
- Parse→edit→assemble workflow aligns with editing kernel design
- End-to-end pipeline validated for mini-apps
- Section taxonomies cover required functionality
- API design consistent with existing patterns

### ⚠️ Improvement Areas
1. **Testing**: Add automated tests for both mini-apps and landing pages
2. **Error Handling**: Improve edge case handling (missing markers, invalid sections)
3. **Logging**: Expand LLM prompt/context logging for debugging
4. **Documentation**: Document behavior when markers are missing/mismatched

## Future Enhancements
1. Multi-section edits in single API call
2. Section diff visualization
3. Rollback to previous section versions
4. Section-level validation and testing
5. Automated test suite for regression prevention

## Usage Example

```bash
curl -X POST https://your-domain/api/apps/app_123/edit-section \
  -H "Content-Type: application/json" \
  -d '{
    "sectionNumber": 5,
    "editInstruction": "Change the primary button color to blue"
  }'
```

## Testing Script
See `scripts/test-section-edit.ts` for a complete test implementation.
