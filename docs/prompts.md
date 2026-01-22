# Prompts Used in Build Process

This document captures the specific prompts used throughout the build process. Prompts are organized by phase and purpose.

## Phase 1: Requirements Research & Refinement

### Perplexity Research Prompts

Research was conducted in two phases: first broad domain discovery, then targeted model-specific investigation.

#### Phase 1: Domain Discovery (Broad)

```text
What are the current best practices in 2024-2025 for digitizing and 
preparing old family photographs before AI-based restoration?

Cover the full pipeline from physical photo to AI-ready input:
- Scanning vs phone capture trade-offs
- Preprocessing steps (dust removal, cropping, exposure correction)
- Whether preprocessing should happen before or after AI enhancement
- Common mistakes that degrade AI restoration quality

Include both professional archival workflows and consumer/hobbyist approaches.
For each stage, note: whether it's essential vs optional, and whether 
it's typically done manually, with traditional software, or delegated to AI.
```

**Mode**: Pro Search (sufficient depth, fast iteration)
**Purpose**: Establish the landscape of photo digitization and preprocessing best practices before focusing on specific AI models
**Reasoning**: Needed broad understanding of the domain before narrowing to model-specific requirements
**Key Findings**: [Add summary of findings here]

#### Phase 2: Model-Specific (Targeted)

**Context from Phase 1**: Solid Phase 1 results. Key takeaway: minimal preprocessing, high-resolution scan, let AI see the damage. The gap: Phase 1 references GFPGAN/Real-ESRGAN but not Gemini. Need to validate whether Gemini follows the same "raw scan preferred" pattern or has different requirements.

```text
For Google's Gemini image generation/editing models in AI Studio 
(specifically gemini-2.0-flash-preview-image-generation or 
gemini-3-pro-image-preview), what input characteristics produce 
the best photo restoration results?

Evaluate:
1. Resolution requirements: min/max dimensions, DPI handling, file size limits
2. Format preferences: JPEG vs PNG vs TIFF for input
3. Does the model prefer raw degraded scans or pre-cleaned images?
4. Prompt engineering patterns for restoration tasks (scratch removal, 
   colorization, face preservation)
5. Known limitations for family photo restoration use cases

Search: Google AI documentation (ai.google.dev), AI Studio guides, 
Gemini API reference, developer forums, Reddit communities 
(r/GoogleGeminiAI, r/photorestoration, r/StableDiffusion for 
comparative context).

If documentation gaps exist for restoration-specific workflows, 
indicate what's undocumented vs confirmed.
```

**Mode**: Pro Search
**Purpose**: Clarify whether the app needs client-side preprocessing tools or can pass scans directly to Gemini
**Reasoning**: Run after Phase 1 establishes the landscape; validates whether Gemini follows the same "raw scan preferred" pattern as other restoration models or has different requirements
**Key Findings**: [Add summary of findings here]

### Opus Requirements & Specification Prompts

> **Note**: Add your actual Opus prompts for requirements refinement here

<!-- Example structure:
#### Requirements Refinement Prompt
```
[Your actual prompt text]
```

**Context**: [What information was provided]
**Goal**: [What outcome was desired]
**Result**: [What was produced]
-->

## Phase 2: Prompt Strategy Research

### Perplexity: Google AI Studio Prompt Research

#### Research Prompt: Google AI Studio Best Practices

```text
What are the best practices for using Google AI Studio chat interface 
to iteratively build and prototype web applications?

Context: Using AI Studio as a development assistant (similar to Claude 
or ChatGPT for coding) rather than as an API endpoint. Goal is to 
generate React/Next.js components, API routes, and prompt templates 
through conversational iteration.

Research:
1. Code generation capabilities: How does Gemini in AI Studio compare 
   to Claude/GPT-4 for full-stack web app development?
2. Session management: Best practices for maintaining context across 
   a long development session (file structure, component relationships)
3. Prompt patterns: How to structure requests for component generation, 
   refactoring, and iterative refinement
4. Artifact handling: Can AI Studio preview/render generated code, 
   or is it text-only output?
5. Limitations: Known gaps for development workflows compared to 
   dedicated coding assistants

Include experiences from developers using AI Studio for app prototyping, 
not just API integration tutorials.
```

**Mode**: Pro Search
**Purpose**: Evaluate whether Google AI Studio is viable for iterative web app development workflow compared to dedicated coding assistants like Claude/Cursor
**Key Findings**: [Add summary of findings here]

### Opus: Prompt Crafting

> **Note**: Add your actual Opus prompts for crafting the final prompt strategy here

<!-- Example structure:
#### Prompt Crafting Session 1
```
[Your actual prompt text]
```

**Input**: [What information was provided to Opus]
**Output**: [What prompt strategy was produced]
-->

## Phase 3: Implementation

### Google AI Studio Build Prompts

#### Initial Build Prompt

```text
Create a family photo restoration web app using React and TypeScript 
that integrates with Gemini 3 Pro Image for AI-powered restoration.

## App Purpose
Restore old family photographs (black & white and color) by removing 
damage, colorizing, and enhancing clarity while preserving facial 
identity and historical authenticity.

## Core User Flow
Upload → Select restoration options → Process with Gemini → 
Compare before/after → Refine iteratively → Download result

## Required Components

### ImageUpload
- Drag-and-drop or button file selection
- Accept PNG and JPEG only (validate on select)
- Max file size: 7MB (AI Studio limit)
- Show local preview using URL.createObjectURL before processing
- Display helper text: "For best results, scan at 600+ DPI. Avoid 
  heavy preprocessing—the AI works best with original scans."

### EnhancementControls
- Two modes: Global restore and Local repair

**Global restore options:**
- Photo type selector: "Old B&W", "Faded color", "Modern photo"
- Damage types (multi-select checkboxes): Scratches, Tears, Fading, 
  Stains, Cracks
- Restoration intensity: Light / Moderate / Aggressive (radio buttons)
- Colorize toggle (only enabled when "Old B&W" selected)
- Preserve grain toggle
- Face preservation level: Strict / Moderate / Flexible (default: Strict)

**Local repair mode:**
- Simple rectangle selection tool over the image
- Repair type dropdown: Fix damage, Reduce noise, Colorize area
- Optional text field: "Specific instructions for this area"

### BeforeAfterView
- Side-by-side or draggable slider comparison
- Clear labels: "Original Scan" and "Restored"
- Zoom controls with presets: "Fit", "100%", "Zoom to face"
- Pan capability when zoomed

### RefinePanel
- "Refine with AI" button for follow-up adjustments
- Text input for refinement instructions
- Shows refinement history within session
- "Start over from original" button

### ResultActions
- Download restored image (PNG)
- Download comparison image (side-by-side PNG)
- Session gallery showing all restorations in current session

## Gemini Integration Architecture

### geminiService.ts
Build a prompt generator that maps UI controls to restoration prompts.

**System instruction** (set once per session):

```

You are a professional photo restoration specialist. Your role is to
repair and enhance damaged family photographs while maintaining absolute fidelity to the original subjects' identities, expressions, and historical authenticity.

```text

**Core principles:**
- Preserve facial features exactly as shown in the original
- Maintain historical era characteristics and visual style
- Apply natural, period-appropriate colors when colorizing
- Reconstruct damaged areas using only visible context clues
- If features are completely missing, leave subtle blur rather than inventing details

**Prompt template structure:**
- Map damage type checkboxes to specific repair instructions
- Map intensity level to restoration approach language
- Map face preservation level to constraint specificity
- Always use positive constraints ("preserve exactly") never negative 
  ("do not alter")
- For local repairs, include region coordinates and scope limitation

**Example generated prompt** for moderate B&W restoration with scratches:

```

Perform moderate restoration of this historical black-and-white
photograph.

Damage repair: Remove all visible scratches and fine lines. Restore
faded areas to their original tonal range.

Face handling: Preserve facial features, expressions, and proportions
with absolute fidelity. Maintain exact eye color, nose shape, mouth
structure, and facial contours.

Colorize this black-and-white image with natural, period-appropriate
colors. Ensure skin tones are realistic and clothing colors match the
historical era.

Preserve the original film grain and texture characteristics.

Restoration approach: Balance restoration quality with historical
authenticity.

```text

### Multi-turn conversation support
- Use Gemini chat session (startChat) for iterative refinement
- Maintain session state so follow-up prompts reference previous output
- Include "reference the original uploaded photograph" in refinement 
  prompts to prevent identity drift
- Limit to 5 refinement turns before prompting user to restart from 
  original

## Technical Requirements
- React functional components with TypeScript
- Tailwind CSS for styling
- Use @google/generative-ai SDK for Gemini integration
- Model: gemini-3-pro-image-preview
- Response modalities: ['TEXT', 'IMAGE']
- Image output size: 2K
- State management: React Context for restoration parameters and 
  session history
- Error handling: Network timeouts, invalid formats, file size 
  exceeded, API rate limits with user-friendly messages

## UI Style
- Clean, minimal interface
- Dark mode default with light mode toggle
- Primary color: Indigo (#4F46E5)
- Card-based layout for controls and preview
- Responsive: Works on desktop and tablet

Generate the complete application with all components, the Gemini 
service layer with prompt builder, and proper TypeScript types.
```

**Purpose**: Generate the complete initial application structure with all required components
**Result**: Generated full React/TypeScript application with all specified components, Gemini integration service, and TypeScript types

#### System Instructions Prompt

```text
You are building a family photo restoration app. All generated code must:

Code standards:
- React functional components with TypeScript
- Tailwind CSS for styling
- Proper error handling with user-friendly messages
- No hardcoded API keys—use environment variables

Gemini integration standards:
- Model: gemini-3-pro-image-preview
- Response modalities: ['TEXT', 'IMAGE']
- Use @google/generative-ai SDK
- Use chat sessions (startChat) for multi-turn refinement

Photo restoration principles (embed in generated prompt logic):
- Preserve facial features exactly as shown in originals
- Use positive constraints ("preserve exactly") not negative ("do not alter")
- Reconstruct damaged areas using only visible context clues
- If features are completely missing, leave subtle blur rather than invent
- Apply natural, period-appropriate colors when colorizing
```

**Purpose**: Set coding standards, Gemini integration requirements, and photo restoration principles for all generated code
**Result**: Ensured consistent code quality, proper API usage, and adherence to restoration best practices throughout the application

#### Follow-up Prompts

After initial generation, use these follow-up prompts for iteration:

##### Follow-up Prompt 1: Add Local Edit Tool

```text
The RegionSelector needs implementation. Add a rectangular selection 
overlay that appears when "Local repair mode" is active. Store 
selection as {x, y, width, height} relative to image dimensions. 
Pass these coordinates to the prompt builder.
```

**Purpose**: Implement the local repair region selection functionality
**Result**: Added RegionSelector component with rectangular overlay and coordinate tracking

##### Follow-up Prompt 2: Refine Prompt Builder

```text
In geminiService.ts, the buildPrompt function needs the full 
parameterization. Add the damage type mapping, intensity mapping, 
and face preservation mapping as shown in the requirements. Export 
TypeScript types for RestorationConfig.
```

**Purpose**: Complete the prompt builder with full parameterization and type definitions
**Result**: Enhanced buildPrompt function with complete mappings and exported TypeScript types

##### Follow-up Prompt 3: Handle Edge Cases

```text
Add comprehensive error handling for:
- Network timeouts during API calls (show retry button)
- Files exceeding 7MB (show size and recommendation to resize)
- API rate limit responses (implement exponential backoff, show 
  wait time to user)
- Session expiry (prompt to start new session)
```

**Purpose**: Implement robust error handling for various failure scenarios
**Result**: Added comprehensive error handling with user-friendly messages and retry mechanisms

## Prompt Strategy Summary

### Key Principles Applied

Based on the research and refinement process, the following principles were applied:

1. **[Principle 1]**: [Description]
2. **[Principle 2]**: [Description]
3. **[Principle 3]**: [Description]

### Prompt Structure Template

```text
[If you developed a template or structure, document it here]
```

## Notes

- Prompts should be added in chronological order
- Include context for each prompt (what information was available at that stage)
- Document the outcome/result of each prompt
- Note any iterations or refinements made
