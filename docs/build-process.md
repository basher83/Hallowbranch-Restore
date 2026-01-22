# Build Process Documentation

This document captures the methodology and process used to build this AI photo restoration application.

## Overview

This project was built using a multiphased approach leveraging AI tools for research, requirements refinement, and implementation. The build process specifically targeted Google AI Studio's build function as the primary development environment.

## Phase 1: Requirements Research & Refinement

### Step 1: Initial Research with Perplexity

- **Tool**: Perplexity AI
- **Purpose**: Research and refine initial requirements
- **Outcome**: Gathered foundational information about photo restoration capabilities, AI models, and implementation approaches

### Step 2: Requirements & Specification Development

- **Tool**: Claude Opus 4.5
- **Purpose**: Brainstorm and refine requirements into a comprehensive specification
- **Activities**:
  - Collaborative brainstorming sessions
  - Requirements refinement
  - End-state specification definition
- **Key Constraint**: Project must be built using Google AI Studio's build function

## Phase 2: Prompt Strategy Research

### Step 3: Understanding Google AI Studio Prompting

- **Tool**: Perplexity AI
- **Purpose**: Research how Google AI Studio prompts work and identify community best practices
- **Focus Areas**:
  - Google AI Studio prompt mechanics
  - Community best practices for effective prompting
  - Prompt structure and optimization techniques

### Step 4: Prompt Crafting

- **Tool**: Claude Opus 4.5
- **Purpose**: Craft targeted prompts based on research findings
- **Input**: Perplexity research results on Google AI Studio prompting
- **Output**: Refined prompt strategy optimized for Google AI Studio

## Phase 3: Implementation

### Step 5: Google AI Studio Build

- **Platform**: Google AI Studio
- **Action**: Started a new build project
- **Prompt Strategy**: Used the prompt strategy provided by Opus
- **Result**: Generated application codebase

## Process Flow Diagram

```text
┌─────────────────────────────────┐
│  Phase 1: Requirements          │
├─────────────────────────────────┤
│  1. Perplexity Research         │
│     ↓                           │
│  2. Opus Requirements Refinement│
│     ↓                           │
│  3. End-State Specification     │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Phase 2: Prompt Strategy       │
├─────────────────────────────────┤
│  4. Perplexity: AI Studio       │
│     Prompt Research              │
│     ↓                           │
│  5. Opus: Prompt Crafting       │
│     ↓                           │
│  6. Refined Prompt Strategy     │
└─────────────────────────────────┘
           ↓
┌─────────────────────────────────┐
│  Phase 3: Implementation        │
├─────────────────────────────────┤
│  7. New Google AI Studio Build  │
│  8. Apply Prompt Strategy       │
│  9. Generated Codebase          │
└─────────────────────────────────┘
```

## Key Decisions

1. **Platform Choice**: Google AI Studio build function (hard requirement)
2. **Research Approach**: Leveraged Perplexity for factual research, Opus for creative synthesis
3. **Prompt Strategy**: Invested time upfront in understanding best practices before implementation
4. **Iterative Refinement**: Used multiple AI tools in sequence to refine outputs at each stage

## Tools Used

- **Perplexity AI**: Research and information gathering
- **Claude Opus 4.5**: Requirements refinement, prompt crafting, and strategic planning
- **Google AI Studio**: Final implementation platform

## Lessons Learned

- Research phase significantly improved prompt quality
- Separating research (Perplexity) from synthesis (Opus) proved effective
- Understanding platform-specific prompting best practices was crucial
- Iterative refinement at each phase improved final output quality
