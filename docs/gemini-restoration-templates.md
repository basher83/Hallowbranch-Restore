# Prompt: Gemini Photo Restoration Templates

**Date:** 2026-01-12
**Confidence:** MEDIUM (community-sourced, validated through Perplexity research)

## Summary

Parameterized prompt templates for Gemini 3 Pro Image restoration workflows. Designed for programmatic generation from UI controls. Key principle: positive constraints only ("preserve exactly") never negative ("do not alter").

## System Instruction (Session-Level)

```text
You are a professional photo restoration specialist. Your role is to 
repair and enhance damaged family photographs while maintaining absolute 
fidelity to the original subjects' identities, expressions, and 
historical authenticity.

Core principles:
- Preserve facial features exactly as shown in the original
- Maintain historical era characteristics and visual style
- Apply natural, period-appropriate colors when colorizing
- Reconstruct damaged areas using only visible context clues
- If features are completely missing, leave subtle blur rather than 
  inventing details
```

## Parameterized Restoration Prompt

### Input Parameters

```typescript
interface RestorationConfig {
  photoType: 'bw' | 'faded_color' | 'modern';
  damageTypes: ('scratches' | 'tears' | 'fading' | 'stains' | 'cracks')[];
  intensity: 'light' | 'moderate' | 'aggressive';
  colorize: boolean;
  preserveGrain: boolean;
  facePreservation: 'strict' | 'moderate' | 'flexible';
}
```

### Mapping Tables

**Damage type → instruction:**

| Type | Instruction |
|------|-------------|
| scratches | Remove all visible scratches and fine lines |
| tears | Repair torn and missing sections by reconstructing from surrounding context |
| fading | Restore faded areas to their original tonal range |
| stains | Eliminate discoloration, water marks, and chemical stains |
| cracks | Smooth over crack patterns while preserving underlying detail |

**Intensity → approach:**

| Level | Instruction |
|-------|-------------|
| light | Apply minimal corrections, preserving maximum originality |
| moderate | Balance restoration quality with historical authenticity |
| aggressive | Maximize clarity and detail recovery, prioritizing readability over perfect originality |

**Face preservation → constraint:**

| Level | Instruction |
|-------|-------------|
| strict | Preserve facial features, expressions, and proportions with absolute fidelity. Maintain exact eye color, nose shape, mouth structure, and facial contours. |
| moderate | Maintain core facial identity while allowing minor clarity improvements to features obscured by damage. |
| flexible | Improve facial clarity and definition while keeping recognizable likeness to the original subject. |

### Template

```text
Perform {intensity} restoration of this historical photograph.

Damage repair: {joined damage instructions}.

Face handling: {face preservation instruction}

{if colorize}
Colorize this black-and-white image with natural, period-appropriate 
colors. Ensure skin tones are realistic and clothing colors match 
the historical era.
{else}
Maintain the original color scheme.
{/if}

{if preserveGrain}
Preserve the original film grain and texture characteristics.
{else}
Apply subtle smoothing to reduce excessive grain while maintaining 
natural texture.
{/if}

Restoration approach: {intensity instruction}

Output requirements: Return a high-resolution restored image that 
maintains the historical character and authenticity of the original 
photograph.
```

### Example Output

Config: `{ intensity: 'moderate', damageTypes: ['scratches', 'fading'], colorize: true, preserveGrain: true, facePreservation: 'strict' }`

```text
Perform moderate restoration of this historical photograph.

Damage repair: Remove all visible scratches and fine lines. Restore 
faded areas to their original tonal range.

Face handling: Preserve facial features, expressions, and proportions 
with absolute fidelity. Maintain exact eye color, nose shape, mouth 
structure, and facial contours.

Colorize this black-and-white image with natural, period-appropriate 
colors. Ensure skin tones are realistic and clothing colors match 
the historical era.

Preserve the original film grain and texture characteristics.

Restoration approach: Balance restoration quality with historical 
authenticity.

Output requirements: Return a high-resolution restored image that 
maintains the historical character and authenticity of the original 
photograph.
```

## Local/Region Repair Prompt

```text
Repair only the selected region of this photograph.

Region: {x}, {y}, {width}, {height} (relative coordinates)

Target only: {repair type - damage/noise/colorize}
{if specific instructions}
Specific instruction: {user text}
{/if}

Preserve unchanged: Everything outside the selected region.
Maintain consistency with surrounding areas at region boundaries.

Face handling (if region contains faces): {face preservation instruction}
```

## Multi-Turn Refinement Prompts

**Follow-up refinement:**

```text
Refine the previous restoration. {user instruction}

Reference the original uploaded photograph for identity consistency.
Maintain all previous improvements while addressing this adjustment.
```

**Restart from original:**

```text
Discard previous restoration attempts. Start fresh from the original 
uploaded photograph with these parameters:

{full restoration prompt}
```

## Anti-Patterns (Avoid)

❌ "Do not alter facial features" → ✅ "Preserve facial features exactly"
❌ "Don't smooth skin" → ✅ "Maintain natural skin texture and pore detail"
❌ "Do not change background" → ✅ "Keep background identical to original"
❌ Generic "restore this photo" → ✅ Specific damage types and constraints

## Model Requirements

- Model: `gemini-3-pro-image-preview`
- Input: PNG preferred (lossless), JPEG acceptable at 95%+ quality
- Resolution: 600+ DPI scans, under 7MB for AI Studio
- Output config: `response_modalities: ['TEXT', 'IMAGE']`, `image_size: '2K'`

## Known Limitations

- Face preservation is inconsistent even with optimal prompts (model limitation)
- Identity drift accumulates over 5+ refinement turns
- Over-smoothing occurs without explicit texture preservation language
- Safety filters may reject legitimate family photos (beach/pool settings)
