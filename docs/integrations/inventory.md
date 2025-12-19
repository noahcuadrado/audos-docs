# Integration Inventory

## Overview
Complete catalog of all platform capabilities available for autopilot mini-app generation. All integrations are managed in `server/services/integrationStore.ts` and automatically surfaced to the autopilot when relevant keywords are detected.

## Total Integrations: 9

### 1. OpenAI Realtime Audio
- **ID**: `openai-realtime`
- **Category**: AI/ML
- **Description**: Real-time voice conversations with AI using OpenAI's Realtime API
- **Required Keys**: `OPENAI_API_KEY`
- **API Endpoint**: `GET /api/realtime/token` (ephemeral token generation)
- **Trigger Keywords**: voice, speak, talk, audio, conversation, realtime
- **Popularity Score**: 85
- **Tags**: openai, realtime, audio, voice, ai

### 2. OpenAI Text Generation (GPT)
- **ID**: `openai-text-generation`
- **Category**: AI/ML
- **Description**: Generate text, chatbots, content creation, and AI responses using OpenAI GPT models
- **Required Keys**: `OPENAI_API_KEY`
- **API Endpoint**: `POST /proxy/openai/v1/chat/completions` (text generation)
- **Trigger Keywords**: chat, chatbot, assistant, text, content, conversation, ai
- **Popularity Score**: 95
- **Tags**: openai, gpt, chat, text, ai, chatbot, content

### 3. Session Management
- **ID**: `session-management`
- **Category**: Authentication
- **Description**: User authentication and session handling with secure state management
- **Required Keys**: None
- **API Endpoint**: `POST /api/session`, `GET /api/session`, `DELETE /api/session`
- **Trigger Keywords**: Always included as core capability
- **Popularity Score**: 90
- **Tags**: auth, session, login, security

### 4. AI Video & Image Generation (Veo3 + DALL-E 3)
- **ID**: `google-veo3`
- **Category**: AI/ML
- **Description**: Generate AI-powered videos and images using Google Veo3, Gemini 2.5 Flash, or OpenAI DALL-E 3
- **Required Keys**: `GOOGLE_API_KEY`, `GEMINI_API_KEY`
- **API Endpoint**: `POST /api/generate/video`, `POST /api/generate/image`
- **Trigger Keywords**: video, image, generate, visual, media, veo, dall-e, picture, photo
- **Popularity Score**: 80
- **Tags**: google, veo3, video, image, generation, ai, gemini

### 5. Web Search (SerpAPI)
- **ID**: `web-search`
- **Category**: Data & Search
- **Description**: Search Google, News, Images, Shopping, and Scholar for real-time web data
- **Required Keys**: `SERPAPI_API_KEY`
- **API Endpoint**: `POST /api/search`
- **Trigger Keywords**: search, google, news, find, lookup, query, research
- **Popularity Score**: 85
- **Tags**: serpapi, search, google, web, news, data
- **Request Format**:
  ```typescript
  {
    query: string,
    searchType?: 'web' | 'news' | 'images' | 'shopping' | 'scholar',
    num?: number (1-100),
    location?: string,
    language?: string,
    dateRange?: 'day' | 'week' | 'month' | 'year',
    page?: number,
    domain?: string
  }
  ```

### 6. Web Scraping & Automation (Apify)
- **ID**: `web-scraping`
- **Category**: Data & Search
- **Description**: Scrape websites, extract data, automate web tasks using Apify actors
- **Required Keys**: `APIFY_API_TOKEN`
- **API Endpoint**: `POST /api/apify/run`
- **Trigger Keywords**: scrape, scraping, extract, crawl, automation, apify
- **Popularity Score**: 75
- **Tags**: apify, scraping, automation, data, extraction
- **Request Format**:
  ```typescript
  {
    actorId: string,
    input: object,
    timeout?: number (minutes)
  }
  ```

### 7. File Storage (Google Cloud Storage)
- **ID**: `file-storage`
- **Category**: Storage
- **Description**: Permanently store images and files in GCS with public URLs
- **Required Keys**: `GCS_BUCKET_NAME`, `GCP_PROJECT_ID`, `GCP_CREDENTIALS`
- **API Endpoint**: `POST /api/upload/image`, `POST /api/upload/image-url`
- **Trigger Keywords**: upload, storage, store, save, file, persist, cloud
- **Popularity Score**: 70
- **Tags**: storage, gcs, upload, images, files, cloud

### 8. Task Scheduler (Cron Jobs)
- **ID**: `task-scheduler`
- **Category**: Automation
- **Description**: Schedule recurring tasks and automations using cron expressions
- **Required Keys**: None
- **API Endpoint**: `POST /api/schedules`, `GET /api/apps/:appId/schedules`
- **Trigger Keywords**: schedule, cron, recurring, automate, repeat, periodic
- **Popularity Score**: 65
- **Tags**: scheduler, cron, automation, recurring, tasks
- **Request Format**:
  ```typescript
  {
    appId: string,
    rrule: string, // e.g., 'FREQ=DAILY;INTERVAL=1'
    timezone: string,
    webhookUrl?: string
  }
  ```

### 9. Document Analysis (GPT-4 Vision)
- **ID**: `document-analysis`
- **Category**: AI/ML
- **Description**: Analyze uploaded PDFs and images with GPT-4 vision - extract data from invoices, forms, diagrams
- **Required Keys**: `OPENAI_API_KEY`
- **API Endpoint**: `POST /api/analyze-document`
- **Trigger Keywords**: document, pdf, invoice, form, analyze, extract, scan, upload
- **Popularity Score**: 85
- **Tags**: gpt4, vision, ocr, pdf, invoice, analysis, document, image
- **Request Format**:
  ```typescript
  {
    documentUrl: string,
    analysisPrompt: string,
    documentType: 'image' | 'pdf'
  }
  ```

## Autopilot Integration

### Capability Detection Flow
1. Autopilot analyzes concept summary and journey narrative
2. Keywords are matched against integration tags and categories
3. Relevant integrations are identified and included in:
   - **Brief Context**: Concise capability menu for ideation
   - **Code Context**: Detailed install patterns for code generation
4. Generated apps automatically include appropriate integration code

### Keyword Matching Logic
Located in `server/services/autopilot-v2.ts`:
```typescript
// Voice/audio → OpenAI Realtime
voice|speak|talk|audio|conversation|realtime

// Text/chat → OpenAI Text Generation
chat|chatbot|assistant|text|content|conversation|ai

// Documents → Document Analysis
document|pdf|invoice|form|analyze|extract|scan|upload

// Media → Veo3/DALL-E
video|image|generate|visual|media|veo|dall-e|picture|photo

// Search → SerpAPI
search|google|news|find|lookup|query|research

// Scraping → Apify
scrape|scraping|extract|crawl|automation|apify

// Storage → GCS
upload|storage|store|save|file|persist|cloud

// Scheduling → Cron
schedule|cron|recurring|automate|repeat|periodic
```

## Architecture Notes

### Integration Store
- **Location**: `server/services/integrationStore.ts`
- **Persistence**: JSON file at `data/integration-store.json`
- **Initialization**: Automatically loads defaults on server startup
- **Server-side only**: No REST API exposure (used internally by autopilot)

### Health Checks
All integrations are validated on server bootup via `server/services/bootup.ts`:
- Checks for required API keys
- Tests service connectivity
- Logs availability status

### Code Generation
Integrations provide two code templates:
1. **installCode**: Helper functions for the integration
2. **exampleCode**: Complete React component example

Both are injected into generated apps when relevant.

## Removed Integrations

### Stripe (removed)
- **Reason**: Non-working implementation, incomplete setup
- **Removed on**: 2025-10-17

### Twilio (removed)
- **Reason**: Non-working implementation, missing SMS service
- **Removed on**: 2025-10-17

## Usage Statistics

### By Category
- **AI/ML**: 4 integrations (44%)
- **Data & Search**: 2 integrations (22%)
- **Storage**: 1 integration (11%)
- **Automation**: 1 integration (11%)
- **Authentication**: 1 integration (11%)

### By Popularity (Top 5)
1. OpenAI Text Generation (95)
2. Session Management (90)
3. OpenAI Realtime Audio (85)
4. Web Search (85)
5. Document Analysis (85)

## Future Expansion

### Planned Integrations
- Payment processing (Stripe/PayPal)
- SMS/notifications (Twilio/SendGrid)
- Analytics (Google Analytics/Mixpanel)
- Authentication providers (Auth0/Clerk)

### Integration Criteria
1. Must have working service implementation in `server/services/`
2. Must include health check in `server/services/bootup.ts`
3. Must provide API endpoint(s) in `server/routes.ts`
4. Must include complete install and example code
5. Must define clear keyword triggers for autopilot detection
