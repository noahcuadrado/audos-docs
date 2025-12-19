# Document Analysis Capability

## Overview
The Document Analysis system enables mini-apps and landing pages to analyze uploaded PDF files and images using GPT-4o via OpenAI's Responses API. This powerful capability allows apps to extract insights, answer questions, and process visual data from user-uploaded documents.

## 🚨 CRITICAL: Responses API Usage

**Both PDFs and Images** use the **Responses API** for consistent handling:

### Images (Direct URL)
✅ Use `input_image` with direct image URL  
✅ No file upload required  
✅ Works with URLs or base64 data URLs

### PDFs (File Upload)
⚠️ Must upload to OpenAI Files API first  
⚠️ Get `file_id` back  
⚠️ Use `input_file` with file_id in Responses API  
⚠️ Must clean up file after analysis

## API Endpoint

### POST /api/analyze-document

Analyzes a document (image or PDF) using GPT-4o vision and returns structured analysis based on a custom prompt.

#### Request Body
```typescript
{
  documentUrl: string;        // Public URL of the document to analyze (required)
  analysisPrompt: string;     // Custom prompt describing what to analyze (required)
  documentType: 'image' | 'pdf'; // Type of document (default: 'image')
}
```

#### Response
```typescript
{
  success: boolean;
  analysis: string;           // The AI-generated analysis
  documentUrl: string;        // Echo of the document URL
  documentType: string;       // Echo of the document type
}
```

#### Example Request
```javascript
const response = await fetch('/api/analyze-document', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-App-Id': window.__APP_ID__
  },
  body: JSON.stringify({
    documentUrl: 'https://storage.googleapis.com/example/invoice.jpg',
    analysisPrompt: 'Extract all line items, quantities, and prices from this invoice. Return as a structured list.',
    documentType: 'image'
  })
});

const data = await response.json();
console.log(data.analysis); // Structured analysis from GPT-4o
```

## Implementation Using Responses API

### The Complete Document Analysis Flow

Both PDFs and images use OpenAI's **Responses API** for consistent handling:

```typescript
import OpenAI from "openai";

const openai = new OpenAI();

async function analyzeDocument(
  documentUrl: string,        // base64 data URL from frontend
  analysisPrompt: string,
  documentType: 'image' | 'pdf'
): Promise<string> {
  try {
    if (documentType === 'pdf') {
      // ==== PDF Path: Upload file, use input_file ====
      
      // STEP 1: Convert base64 to Buffer
      const base64Data = documentUrl.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // STEP 2: Create File object
      const file = new File([buffer], 'document.pdf', { 
        type: 'application/pdf' 
      });
      
      // STEP 3: Upload to OpenAI Files API with purpose: 'user_data'
      const uploadedFile = await openai.files.create({
        file: file,
        purpose: 'user_data'  // ← CRITICAL: Must be 'user_data' for Responses API
      });
      
      console.log(`PDF uploaded: ${uploadedFile.id}`);
      
      // STEP 4: Use Responses API with input_file
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: analysisPrompt
              },
              {
                type: "input_file",
                file_id: uploadedFile.id  // ← Reference uploaded file
              }
            ]
          }
        ]
      });

      // Extract text from response
      const analysis = response.output?.[0]?.content?.[0]?.text || '';
      
      // STEP 5: Cleanup uploaded file
      try {
        await openai.files.delete(uploadedFile.id);
        console.log(`Cleaned up file: ${uploadedFile.id}`);
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }
      
      return analysis;
      
    } else {
      // ==== Image Path: Direct URL with input_image ====
      
      const response = await openai.responses.create({
        model: "gpt-4o",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: analysisPrompt
              },
              {
                type: "input_image",
                image_url: documentUrl  // Direct base64 URL works
              }
            ]
          }
        ]
      });

      // Extract text from response
      const analysis = response.output?.[0]?.content?.[0]?.text || '';
      
      return analysis;
    }
  } catch (error) {
    console.error('Document analysis error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}
```

### Key Differences Table

| Feature | Images | PDFs |
|---------|--------|------|
| **Upload Required?** | ❌ No | ✅ Yes (to Files API) |
| **API Used** | Responses API | Responses API |
| **Content Type** | `input_image` | `input_file` |
| **Data Format** | Direct URL or base64 | `file_id` reference |
| **File Upload** | Not needed | Files API with `purpose: 'user_data'` |
| **Cleanup Needed?** | No | **Yes** (delete after) |
| **File Size Limit** | ~5MB recommended | Up to 32MB |
| **Pages Supported** | 1 | Up to 100 |
| **Response Access** | `response.output[0].content[0].text` | `response.output[0].content[0].text` |

### Common Errors & Fixes

#### ❌ Error: File purpose must be 'user_data'

**Cause:** Using wrong purpose when uploading PDF files

**Wrong:**
```javascript
const uploadedFile = await openai.files.create({
  file: pdfFile,
  purpose: 'assistants'  // ❌ WRONG for Responses API
});
```

**Correct:**
```javascript
const uploadedFile = await openai.files.create({
  file: pdfFile,
  purpose: 'user_data'  // ✅ CORRECT for Responses API
});
```

#### ❌ Error: Cannot access response content

**Cause:** Using Chat Completions API response structure with Responses API

**Wrong:**
```javascript
const analysis = response.choices[0]?.message?.content || '';  // ❌ WRONG API
```

**Correct:**
```javascript
const analysis = response.output?.[0]?.content?.[0]?.text || '';  // ✅ CORRECT
```

### Deployment Checklist for Audos Team

When deploying Audoapps with document analysis:

- [ ] **OpenAI API key** is available in environment
- [ ] **Responses API implemented** for both images and PDFs
- [ ] **Image path**: Uses `input_image` with direct URL
- [ ] **PDF path**: Upload with `purpose: 'user_data'`, then use `input_file` with file_id
- [ ] **File cleanup implemented** (`openai.files.delete()` after PDF analysis)
- [ ] **Response parsing** uses `response.output[0].content[0].text`
- [ ] **Error handling** for file upload failures
- [ ] **Monitor Files API quota** (PDFs consume storage until deleted)
- [ ] **Test both file types** independently
- [ ] **Handle upload timeouts** (large PDFs may take time)

### Testing Commands

```bash
# Test with image (simple path)
curl -X POST http://localhost:5000/api/analyze-document \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrl": "data:image/jpeg;base64,/9j/4AAQ...",
    "documentType": "image",
    "analysisPrompt": "Extract text from this image"
  }'

# Test with PDF (complex 2-step path)
curl -X POST http://localhost:5000/api/analyze-document \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrl": "data:application/pdf;base64,JVBERi0x...",
    "documentType": "pdf",
    "analysisPrompt": "Extract syllabus milestones"
  }'
```

### API Summary: Responses API

**All document analysis uses OpenAI's Responses API (`openai.responses.create`)**:

```javascript
// Images
const response = await openai.responses.create({
  model: "gpt-4o",
  input: [{
    role: "user",
    content: [
      { type: "input_text", text: "analyze this..." },
      { type: "input_image", image_url: imageDataUrl }
    ]
  }]
});

// PDFs
const uploadedFile = await openai.files.create({
  file: pdfFile,
  purpose: 'user_data'
});

const response = await openai.responses.create({
  model: "gpt-4o",
  input: [{
    role: "user",
    content: [
      { type: "input_text", text: "analyze this..." },
      { type: "input_file", file_id: uploadedFile.id }
    ]
  }]
});

// Extract result from both
const analysis = response.output[0].content[0].text;
```

### Native PDF Support Features

As of March 2025, OpenAI supports:

- ✅ **Multi-page**: Up to 100 pages per PDF
- ✅ **File Size**: PDFs up to 32MB
- ✅ **No Conversion**: Direct PDF processing (no image conversion)
- ✅ **Full Content**: Text + visual elements (charts, tables, diagrams)
- ✅ **Responses API**: Consistent interface for both images and PDFs

## Use Cases

### 1. Invoice Processing
Extract structured data from uploaded invoices or receipts:
```
Prompt: "Extract all items, quantities, unit prices, and total from this invoice. Format as JSON."
```

### 2. Document Summarization
Summarize lengthy documents or presentations:
```
Prompt: "Provide a concise 3-paragraph summary of the key points in this document."
```

### 3. Form Data Extraction
Pull specific fields from scanned forms:
```
Prompt: "Extract the following fields: Name, Date, Signature Status, and any checked boxes."
```

### 4. Image Description
Generate detailed descriptions for accessibility or cataloging:
```
Prompt: "Describe this image in detail, including all visible elements, colors, and text."
```

### 5. Technical Diagram Analysis
Understand flowcharts, wireframes, or architectural diagrams:
```
Prompt: "Identify all components in this system diagram and explain their relationships."
```

### 6. Medical Document Processing
Extract insights from medical reports or lab results:
```
Prompt: "List all test results with their values and flag any that are outside normal ranges."
```

### 7. Multi-Page PDF Analysis
Process entire documents with native PDF support:
```javascript
// Example: Analyzing a multi-page syllabus PDF
const response = await fetch('/api/analyze-document', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-App-Id': window.__APP_ID__
  },
  body: JSON.stringify({
    documentUrl: syllabusUrl,
    analysisPrompt: `Extract from this syllabus:
      - Course title and instructor
      - All assignment due dates
      - Exam dates
      - Reading materials and links
      Return as structured JSON.`,
    documentType: 'pdf'  // Processes all pages natively
  })
});
```

## Integration Pattern

### Step 1: Upload Document
First, upload the document to get a public URL:
```javascript
// Upload image/PDF
const uploadResponse = await fetch('/api/upload/image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    imageData: base64Data, // Base64-encoded file
    fileName: file.name
  })
});

const { imageUrl } = await uploadResponse.json();
```

### Step 2: Analyze Document
Then analyze it with a custom prompt:
```javascript
// Analyze uploaded document
const analysisResponse = await fetch('/api/analyze-document', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-App-Id': window.__APP_ID__
  },
  body: JSON.stringify({
    documentUrl: imageUrl,
    analysisPrompt: 'Extract key information from this document...',
    documentType: 'image'
  })
});

const { analysis } = await analysisResponse.json();
```

### Step 3: Store Results
Save the analysis to your app's session storage:
```javascript
// Save to session
await fetch('/api/session/save', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'X-App-Id': window.__APP_ID__
  },
  body: JSON.stringify({
    key: 'document_analysis',
    data: {
      documentUrl: imageUrl,
      analysis: analysis,
      timestamp: new Date().toISOString()
    }
  })
});
```

## Best Practices

### Crafting Analysis Prompts
1. **Be Specific**: Clearly state what you want extracted
   - ❌ "Analyze this document"
   - ✅ "Extract company name, invoice number, date, and total amount"

2. **Request Format**: Specify desired output structure
   - "Return as JSON with fields: name, date, items[]"
   - "Format as a bulleted list"
   - "Create a markdown table"

3. **Handle Edge Cases**: Guide the AI on what to do if data is missing
   - "If a field is not visible, return 'N/A'"
   - "If the image is unclear, describe what you can see"

### Error Handling
Always wrap analysis calls in try-catch:
```javascript
try {
  const response = await fetch('/api/analyze-document', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-App-Id': window.__APP_ID__
    },
    body: JSON.stringify({
      documentUrl,
      analysisPrompt,
      documentType
    })
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  const { analysis } = await response.json();
  return analysis;
} catch (error) {
  console.error('Document analysis error:', error);
  return 'Failed to analyze document. Please try again.';
}
```

### Performance Optimization
- **Batch Processing**: For multiple documents, process sequentially to avoid rate limits
- **Caching**: Store analysis results to avoid re-analyzing the same document
- **Progressive Loading**: Show a loading state while analysis is in progress

## Limitations

1. **File Size**: 
   - Images should be under 5MB for optimal performance
   - PDFs can be up to 32MB
2. **PDF Support**: Native PDF processing supports up to 100 pages per document
3. **Response Time**: Analysis typically takes 2-5 seconds depending on complexity and document size
4. **Rate Limits**: Subject to OpenAI API rate limits
5. **Image Quality**: Higher resolution images provide better analysis accuracy

## Example: Invoice Analyzer Mini-App

```typescript
// Mini-app that analyzes uploaded invoices
function InvoiceAnalyzer() {
  const [invoice, setInvoice] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file) => {
    setLoading(true);
    
    // 1. Convert to base64
    const base64 = await fileToBase64(file);
    
    // 2. Upload
    const uploadRes = await fetch('/api/upload/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageData: base64, fileName: file.name })
    });
    const { imageUrl } = await uploadRes.json();
    
    // 3. Analyze
    const analysisRes = await fetch('/api/analyze-document', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-App-Id': window.__APP_ID__
      },
      body: JSON.stringify({
        documentUrl: imageUrl,
        analysisPrompt: `Extract the following from this invoice:
          - Invoice number
          - Date
          - Vendor name
          - All line items with quantities and prices
          - Subtotal, tax, and total
          Format as JSON.`,
        documentType: 'image'
      })
    });
    const { analysis } = await analysisRes.json();
    
    setInvoice(imageUrl);
    setAnalysis(JSON.parse(analysis));
    setLoading(false);
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {loading && <p>Analyzing invoice...</p>}
      {analysis && (
        <div>
          <h3>Invoice #{analysis.invoiceNumber}</h3>
          <p>Date: {analysis.date}</p>
          <p>Vendor: {analysis.vendorName}</p>
          {/* Display line items, totals, etc. */}
        </div>
      )}
    </div>
  );
}
```

## AI Agent Integration

When generating mini-apps that need document analysis, include this capability in the app brief:

```
"This app analyzes uploaded expense receipts and extracts:
- Merchant name
- Date
- Total amount
- Category (food, transport, etc.)

Use POST /api/analyze-document with a structured prompt to extract these fields."
```

The AI agent will automatically:
1. Add file upload UI
2. Implement the analysis call with appropriate prompt
3. Display results in a user-friendly format
4. Store analysis results in session storage

## Testing

Test the endpoint manually:
```bash
curl -X POST https://your-domain.com/api/analyze-document \
  -H "Content-Type: application/json" \
  -d '{
    "documentUrl": "https://example.com/sample-invoice.jpg",
    "analysisPrompt": "Extract invoice number and total amount",
    "documentType": "image"
  }'
```

Expected response:
```json
{
  "success": true,
  "analysis": "Invoice Number: INV-2024-001\nTotal Amount: $1,234.56",
  "documentUrl": "https://example.com/sample-invoice.jpg",
  "documentType": "image"
}
```
