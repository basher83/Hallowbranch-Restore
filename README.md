<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Restora

AI-powered photo restoration that repairs damaged family photographs using Google Gemini. Supports configurable damage repair, colorization, face preservation, and local region repair with a before/after comparison view.

Built with React, TypeScript, and Vite. The Gemini API key is kept server-side via a Cloudflare Worker proxy.

## Quick Start

```bash
npm install
npm run dev
```

Create `.env.local` with your worker URL:

```text
VITE_WORKER_URL=https://your-worker.your-subdomain.workers.dev
```

## Worker Setup

The Cloudflare Worker in `worker/` proxies requests to Gemini and injects the API key server-side.

```bash
cd worker
npm install
npm run secret     # Set GEMINI_API_KEY
npm run deploy     # Deploy to Cloudflare
```

## Project Structure

```text
src/
  components/       # UI components (upload, controls, comparison slider, refinement)
  context/          # React Context state management (AppContext)
  services/         # Gemini API service layer
  utils/            # Image utilities (thumbnails, base64 encoding)
  types.ts          # Core type definitions and enums
worker/             # Cloudflare Worker (Gemini API proxy)
```

## Testing

```bash
npm test
```
