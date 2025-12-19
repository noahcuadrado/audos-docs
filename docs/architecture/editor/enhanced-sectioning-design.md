# Enhanced Granular Sectioning for Landing Pages & Mini-Apps

## Current State (3 Sections)
```typescript
// === SECTION 1: IMPORTS AND TYPES ===
// === SECTION 2: MAIN COMPONENT ===  ← TOO BROAD! 90% of code here
// === SECTION 3: EXPORT (FINAL) ===
```

**Problem:** SECTION 2 contains everything - makes editing inefficient

---

## Proposed Enhanced Structure

### **Landing Pages (8 Sections)**

```typescript
// === SECTION 1: IMPORTS AND TYPES ===
import { useState, useEffect } from 'react';

interface HeroProps { ... }
interface FeatureProps { ... }

// === SECTION 2: CONSTANTS AND CONFIGURATION ===
const BRAND_COLORS = { ... };
const CTA_LINK = '...';
const FEATURES = [...];

// === SECTION 3: UTILITY FUNCTIONS ===
const scrollToSection = (id: string) => { ... };
const handleCTAClick = () => { ... };

// === SECTION 4: HERO SECTION ===
const HeroSection = () => {
  return (
    <section className="hero">
      {/* Hero content */}
    </section>
  );
};

// === SECTION 5: FEATURES SECTION ===
const FeaturesSection = () => {
  return (
    <section className="features">
      {/* Features content */}
    </section>
  );
};

// === SECTION 6: CTA SECTION ===
const CTASection = () => {
  return (
    <section className="cta">
      {/* CTA content */}
    </section>
  );
};

// === SECTION 7: MAIN COMPONENT ===
export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <CTASection />
    </div>
  );
}

// === SECTION 8: EXPORT (FINAL) ===
// Mount the component
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<LandingPage />);
}
```

---

### **Mini-Apps (9 Sections)**

```typescript
// === SECTION 1: IMPORTS AND TYPES ===
import { useState, useEffect } from 'react';

interface TodoItem { ... }
interface SessionData { ... }

// === SECTION 2: CONSTANTS AND CONFIGURATION ===
const API_ENDPOINTS = { ... };
const DEFAULT_STATE = { ... };

// === SECTION 3: API AND DATA FUNCTIONS ===
async function loadSession() { ... }
async function saveSession(data) { ... }
async function fetchExternalData() { ... }

// === SECTION 4: BUSINESS LOGIC FUNCTIONS ===
function calculateTotal(items: TodoItem[]) { ... }
function validateInput(value: string) { ... }
function processData(raw: any) { ... }

// === SECTION 5: UI COMPONENTS ===
const TodoListItem = ({ item }) => { ... };
const TodoForm = ({ onSubmit }) => { ... };
const EmptyState = () => { ... };

// === SECTION 6: CUSTOM HOOKS ===
function useTodoList() {
  const [todos, setTodos] = useState([]);
  // hook logic
  return { todos, addTodo, removeTodo };
}

// === SECTION 7: MAIN COMPONENT ===
export default function TodoApp() {
  const { todos, addTodo } = useTodoList();
  
  useEffect(() => {
    loadSession();
  }, []);
  
  return (
    <div>
      <TodoForm onSubmit={addTodo} />
      <TodoList items={todos} />
    </div>
  );
}

// === SECTION 8: SESSION MANAGEMENT ===
// Auto-save on unmount
useEffect(() => {
  return () => {
    saveSession({ todos });
  };
}, [todos]);

// === SECTION 9: EXPORT (FINAL) ===
// Mount the component
import { createRoot } from 'react-dom/client';
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<TodoApp />);
}
```

---

## Benefits of Granular Sections

### 1. **Surgical Editing** ✂️
- Change request: "Update hero button color" → Only edit SECTION 4
- Change request: "Add new feature card" → Only edit SECTION 5
- Change request: "Fix validation logic" → Only edit SECTION 4 (business logic)

### 2. **Better Token Efficiency** 💰
- **Current:** 3 sections, LLM must regenerate ~2000 tokens for any change
- **Enhanced:** 8-9 sections, LLM regenerates only ~300 tokens for specific section

### 3. **Improved Reliability** 🛡️
- Failed edit in SECTION 4? Retry just that section
- Other sections remain untouched and working
- Easier to debug which section has issues

### 4. **Clearer Organization** 📁
- Developers can understand code structure at a glance
- Natural separation of concerns
- Easier to find specific functionality

---

## Section Definitions

### **Landing Pages:**
1. **IMPORTS AND TYPES** - Dependencies and TypeScript interfaces
2. **CONSTANTS AND CONFIGURATION** - Brand colors, CTAs, static data
3. **UTILITY FUNCTIONS** - Helpers like scrollTo, analytics tracking
4. **HERO SECTION** - Above-the-fold content component
5. **FEATURES SECTION** - Product/service features component
6. **CTA SECTION** - Call-to-action and conversion component
7. **MAIN COMPONENT** - Root component that composes sections
8. **EXPORT (FINAL)** - DOM mounting code

### **Mini-Apps:**
1. **IMPORTS AND TYPES** - Dependencies and TypeScript interfaces
2. **CONSTANTS AND CONFIGURATION** - API endpoints, defaults, config
3. **API AND DATA FUNCTIONS** - Session management, external APIs
4. **BUSINESS LOGIC FUNCTIONS** - Pure functions for data processing
5. **UI COMPONENTS** - Reusable presentation components
6. **CUSTOM HOOKS** - React hooks for state and logic
7. **MAIN COMPONENT** - Root component that uses hooks/components
8. **SESSION MANAGEMENT** - Load/save session, lifecycle effects
9. **EXPORT (FINAL)** - DOM mounting code

---

## Migration Strategy

### Phase 1: Update Generation Prompts ✅ (Current Task)
- Enhance llm.ts prompts with new section markers
- Add clear section guidelines and examples
- Test with autopilot generation

### Phase 2: Validate Output Quality
- Generate sample landing pages and mini-apps
- Review section boundaries and content
- Refine section definitions if needed

### Phase 3: Build Section-Based Editor
- Create section parser
- Implement multi-section editing in editing-kernel
- Add section-aware LLM editing prompts
- Test with real edit scenarios

---

## Section Marker Format

**Standard marker:**
```typescript
// === SECTION N: DESCRIPTIVE NAME ===
```

**Rules:**
- Must start with `// ===`
- Include section number
- Include clear descriptive name
- End with `===`
- Blank line after marker before content

**Example:**
```typescript
// === SECTION 4: HERO SECTION ===

const HeroSection = () => {
  // implementation
};
```
