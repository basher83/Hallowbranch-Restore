# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

Hallowbranch-Restore (Restora) is an AI-powered photo restoration web application
built with React, TypeScript, and the Google Gemini API via a Cloudflare Worker
proxy. It restores damaged family photographs with configurable options for
damage repair, colorization, and face preservation.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start development server (port 3000)
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run tests
npm run test:watch # Run tests in watch mode
```

## Environment Setup

Create `.env.local`:

```text
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

The API key is stored securely in the Cloudflare Worker, not in the client.

### Worker Deployment

```bash
cd worker
npm install
npm run secret     # Set GEMINI_API_KEY
npm run deploy     # Deploy to Cloudflare
```

## Architecture

### State Management

All application state flows through `context/AppContext.tsx` using React Context.
The `useApp()` hook provides:

- `currentSession`: Active restoration session with image history
- `options`: Current `RestorationOptions` configuration
- `isProcessing`, `error`: UI state
- Actions: `startSession`, `addToHistory`, `setOptions`, `resetSession`

### Gemini Service (`services/geminiService.ts`)

Singleton `geminiService` communicates with the Cloudflare Worker proxy:

- `startRestoration(file, options)`: Sends image with generated prompt
- `refineRestoration(instruction, lastImageUrl, originalFile)`: Continues
  session with both original and last result to prevent identity drift
- `buildPrompt(options)`: Converts `RestorationOptions` into structured prompt
- `resetSession()`: Clears conversation history

Conversation history is maintained client-side and sent with each request for
stateless worker operation.

### Cloudflare Worker (`worker/`)

Proxies requests to Gemini API, injecting the API key server-side:

- Receives image parts, prompt, system instruction, and conversation history
- Forwards to Gemini REST API with proper authentication
- Returns generated image or error

### Type System (`types.ts`)

Core types:

- `RestorationOptions`: Photo type, damage types, intensity, colorize, grain,
  face preservation, local repair regions
- `RestorationSession`: Tracks original image and history of restoration steps
- `RestorationHistoryItem`: Individual result with prompt and timestamp
- Enums: `PhotoType`, `DamageType`, `Intensity`, `FacePreservation`, `RepairType`

### Component Flow

1. `ImageUpload`: File selection (JPEG/PNG, max 7MB)
2. `EnhancementControls`: Global Restore and Local Repair tabs
3. `BeforeAfterView`: Comparison slider for original vs restored
4. `RefinePanel`: Text refinement with ConfirmModal (max 5 turns)
5. `ResultActions`: Download with cached comparison canvas

### Utilities

- `utils/imageUtils.ts`: `generateThumbnail()` for history display (150px JPEG)
- `components/ConfirmModal.tsx`: Accessible modal replacing native `confirm()`

## Key Patterns

### Image Handling

Images are base64 encoded via `fileToImagePart()` and `urlToImagePart()`.
History thumbnails are generated asynchronously to reduce memory usage.

### Prompt Construction

`buildPrompt()` dynamically constructs prompts based on options including
damage-specific repair instructions, face preservation directives,
colorization requests, and local region coordinates.

## Testing

Tests use Vitest. Run with `npm test`.

Current coverage: `buildPrompt()` function with 8 test cases covering all
option combinations.
