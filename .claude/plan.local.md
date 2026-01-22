# Prioritized Implementation Plan

## PHASE 1: Quick Fixes ✅ COMPLETE

- [x] Object URLs Never Revoked - Added `URL.revokeObjectURL()` in `startSession` and `resetSession`
- [x] FileReader Error Handling - Added `reader.onerror` with proper rejection
- [x] Stale Closure - Wrapped `validateAndProcess` in `useCallback` with proper deps
- [x] Type Coercion - Replaced `any` with generic `<K extends keyof T>` pattern
- [x] Bonus: Fixed `catch (e: any)` patterns in `EnhancementControls.tsx` and `RefinePanel.tsx`

---

## PHASE 2: UI/UX Improvements ✅ COMPLETE

- [x] Created `ConfirmModal.tsx` - accessible modal with Escape key, backdrop click, focus trap
- [x] Replaced `confirm()` in `RefinePanel.tsx` with proper modal state management
- [x] Cached comparison canvas in `ResultActions.tsx` using ref to track image changes

---

## PHASE 3: Memory/Performance ✅ COMPLETE

- [x] Created `utils/imageUtils.ts` with `generateThumbnail()` (150px, JPEG 0.7 quality)
- [x] Made `addToHistory` async to generate thumbnails before storing
- [x] Updated `App.tsx` history gallery to use `thumbnailUrl` instead of full image

---

## PHASE 4: Code Cleanup ✅ COMPLETE

- [x] Implemented `originalFile` in `refineRestoration` - now sends both original
      and last result to prevent identity drift
- [x] Added Vitest with 8 tests for `buildPrompt()` covering all option combinations
- [x] Added `test` and `test:watch` npm scripts

---

## PHASE 5: API Key Security ✅ COMPLETE

- [x] Created `worker/` directory with Cloudflare Worker project
- [x] Implemented stateless proxy that maintains conversation history client-side
- [x] Refactored `geminiService.ts` to use worker endpoint via `VITE_WORKER_URL`
- [x] Removed `@google/genai` dependency (no longer needed client-side)
- [x] Removed API key exposure from `vite.config.ts`
- [x] Added `vite-env.d.ts` for proper TypeScript support

**Deployment Steps:**

```bash
cd worker
npm install
npm run secret  # Set GEMINI_API_KEY
npm run deploy  # Deploy to Cloudflare
```

Then set `VITE_WORKER_URL` in `.env.local` to your worker URL.

---

## BACKLOG (Future/Roadmap)

| Item | Notes |
|------|-------|
| Input sanitization | Not critical for family-only app |
| Global service singleton | Only matters if you need concurrent sessions or proper testing |
| Full test suite | Beyond `buildPrompt()`, consider component tests |

---

## Next Actions

1. **Phase 1** - Quick fixes (Object URLs, FileReader error, stale closure, type coercion)
2. **Phase 2** - Modal component to replace `confirm()`
3. **Phase 3** - Thumbnail generation for history
4. **Phase 4** - Uncomment `originalFile` usage, add `buildPrompt()` test
5. **Phase 5** - Cloudflare Workers proxy implementation

---

## Notes

**On the `originalFile` parameter:** Looking at the code, the intent was correct. Including the original image alongside the last result in refinement calls helps the model maintain facial identity. The Gemini Pro image models handle multi-image input fine - the commented-out code was likely conservative uncertainty. I'd recommend uncommenting it.

**On Infisical:** It's still useful if you go the proxy route - you'd use it to manage the API key in your Cloudflare Worker's environment, get rotation capabilities, audit trails, etc. It just can't protect a client-side secret.
