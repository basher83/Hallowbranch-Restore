# Memo: Cross-Platform Photo Sharing for Family Photo Restoration

**Date:** 2025-01-19
**Confidence:** HIGH (multiple options researched, clear criteria applied)

## Summary

Evaluated methods for mom (iPhone) to share full-quality photos with me (Android + Mac) for restoration processing. Decision: Google Photos shared account as a temporary bridge until she can use Restora directly.

## Problem Statement

**Constraint:** Mom has iPhone, I have Android phone + Mac. Need full-quality photo transfer (no MMS/email compression) with minimal sender friction.

**Initial assumption:** This is a long-term infrastructure problem requiring a robust solution.

**Reframe insight:** This is a temporary bridge problem. The end state is mom uploading directly to Restora—the transfer mechanism gets deprecated when that happens.

## Options Evaluated

### Tier 1: Cloud Services (No Self-Hosting)

| Method | Sender Friction | Quality | Notes |
|--------|----------------|---------|-------|
| **Google Photos (shared account)** | Zero after setup | Original (HEIC loophole) | Auto-sync, no per-share action |
| **iCloud Link** | 3-4 taps + remembering options | Full + metadata | Per-share cognitive load |

**HEIC loophole:** Google can't efficiently recompress HEIC, so iPhone photos get original quality backup free.

### Tier 2: Self-Hosted

| Method | Sender Friction | Reliability (iOS) | Notes |
|--------|----------------|-------------------|-------|
| **PhotoSync + PhotoPrism** | Zero (trigger-based) | High | $5-10 app, geofence/charge triggers |
| **Immich (current)** | Medium (open app occasionally) | Medium | iOS background upload unreliable |
| **Immich (post-PhotoKit)** | Zero (expected) | High (expected) | Q1-Q2 2026 ETA |
| **Nextcloud** | High | Poor | iOS background upload broken |

**iOS reality check:** Apple aggressively restricts background processes. Until PhotoKit API ships (Q1-Q2 2026), all self-hosted solutions face the same iOS limitation. Differentiator is workaround quality (PhotoSync's triggers vs Immich's periodic app opening).

### Methods to Avoid

- **MMS/SMS:** Severe compression (~1MB limit)
- **WhatsApp:** Compression even in "high quality" mode
- **Email:** Size limits, compression

## Decision Criteria (Ordered)

1. **Ease of use for mom** — Zero ongoing cognitive load
2. **Ease of pipeline integration** — Getting photos into Restora workflow

## Decision

**Google Photos shared account** for the bridge period.

### Reasoning

| Factor | Weight | Google Photos | Self-Hosted |
|--------|--------|--------------|-------------|
| Zero sender friction | High | ✅ | ✅ (PhotoSync) |
| Zero deployment | Medium | ✅ | ❌ |
| Zero maintenance | Medium | ✅ | ❌ |
| Graceful deprecation | High | ✅ | ❌ (wasted investment) |
| Pipeline integration | Low (temporary) | Adequate | Better |

**Key insight:** Self-hosted investment doesn't pay off for a temporary bridge. PhotoPrism's filesystem advantages are irrelevant if the mechanism is deprecated in weeks/months.

## Implementation

### Short-Term Workflow

```text
Mom takes photo
    ↓ (automatic, invisible)
Google Photos shared account
    ↓ (I pull when ready)
Download to local
    ↓
Restora web app
    ↓
Return via iMessage
```

### Setup Steps (One-Time, I Do This)

1. Create dedicated Google account for photo sharing (or use existing)
2. On mom's iPhone: Install Google Photos, sign in, enable backup with "Original Quality"
3. On my devices: Sign into same account, access via web or app

### Long-Term Transition

When mom is trained on Restora:

1. She bookmarks Restora URL
2. She uploads directly to web app
3. Google Photos bridge becomes vestigial (or repurposed for general family sharing)

## Deferred Options

**Immich:** Documented as future consideration when PhotoKit API ships. Revisit Q2 2026 if self-hosted photo management becomes a broader requirement beyond this specific use case.

## Research Artifacts

Perplexity prompts used for discovery are reusable for similar cross-platform research:

- Discovery prompt pattern: Problem-focused, explicit enumeration criteria, asymmetric user context (technical admin vs non-technical user)
- iOS-specific research: Always explicitly request background upload reliability and workarounds—this is the key constraint for any iPhone → self-hosted solution
