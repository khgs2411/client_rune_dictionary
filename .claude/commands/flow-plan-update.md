---
description: Update existing plan to match latest Flow framework structure
---

You are executing the `/flow-plan-update` command from the Flow framework.

**Purpose**: Update an existing `.flow/PLAN.md` to match the latest Flow framework structure and patterns.

**🔴 REQUIRED: Read Framework Quick Reference First**

- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Plan File Template (lines 272-353)
- **Deep dive if needed**: Read lines 105-179 for Framework Structure using Read(offset=105, limit=75)

**IMPORTANT**: This command updates your current plan file to match framework changes (e.g., Progress Dashboard moved, new status markers, structural improvements).

**Instructions**:

1. **Read the framework guide**:

   - Search for DEVELOPMENT_FRAMEWORK.md in these locations (in order):
     - `.flow/DEVELOPMENT_FRAMEWORK.md`
     - `.claude/DEVELOPMENT_FRAMEWORK.md`
     - `./DEVELOPMENT_FRAMEWORK.md` (project root)
     - `~/.claude/flow/DEVELOPMENT_FRAMEWORK.md` (global)
   - Understand current framework structure and patterns
   - Study the Progress Dashboard template and its location
   - Note all status markers and section structure requirements

2. **Read the example plan**:

   - Search for EXAMPLE_PLAN.md in these locations (in order):
     - `.flow/EXAMPLE_PLAN.md`
     - `.claude/EXAMPLE_PLAN.md`
     - `~/.claude/flow/EXAMPLE_PLAN.md` (global)
   - Study the section order and formatting
   - Note how Progress Dashboard is positioned
   - Understand the complete structure template

3. **Read current plan**:

   - Read `.flow/PLAN.md` (your project's current plan)
   - Analyze its current structure
   - Identify what needs updating to match framework

4. **Create backup**:

   - Copy current plan: `.flow/PLAN.md.version-update-backup-$(date +%Y-%m-%d-%H%M%S)`
   - Confirm: "✅ Backed up .flow/PLAN.md to [backup]"

5. **Analyze current plan against framework checklist**:

   **CRITICAL FRAMEWORK VERSION PATTERNS** (v1.2.1+):

   Compare user's PLAN.md against these patterns and identify what needs updating:

   **✅ CORRECT PATTERNS (v1.2.1+)**:

   **A. Section Order**:
   1. Title + Framework Reference header
   2. Overview (Purpose, Goals, Scope)
   3. Progress Dashboard (after Overview, before Architecture)
   4. Architecture
   5. Testing Strategy
   6. Development Plan (Phases → Tasks → Iterations)
   7. Changelog

   **B. Implementation Section Pattern** (NO ACTION ITEM DUPLICATION):
   ```markdown
   ### **Implementation - Iteration [N]: [Name]**

   **Status**: 🚧 IN PROGRESS

   **Action Items**: See resolved subjects above (Type 2/D items)

   **Implementation Notes**:
   [Document progress, discoveries, challenges]

   **Files Modified**:
   - `path/to/file.ts` - Description

   **Verification**: [How verified]
   ```

   **C. Progress Dashboard Jump Links**:
   ```markdown
   **Current Work**:
   - **Phase**: [Phase 2 - Core Implementation](#phase-2-core-implementation-)
   - **Task**: [Task 5 - Error Handling](#task-5-error-handling-)
   - **Iteration**: [Iteration 6 - Circuit Breaker](#iteration-6-circuit-breaker-) 🚧 IN PROGRESS
   ```

   **D. Iteration Lists** (EXPANDED, not collapsed):
   ```markdown
   - 🚧 **Task 23**: Refactor Architecture (3/3 iterations)
     - ✅ **Iteration 1**: Separate Concerns - COMPLETE
     - ⏳ **Iteration 2**: Extract Logic - PENDING
     - ⏳ **Iteration 3**: Optimize - PENDING
   ```

   **E. Status Markers**: ✅ ⏳ 🚧 🎨 ❌ 🔮 (standardized)

   ---

   **❌ DEPRECATED PATTERNS (pre-v1.2.1)**:

   **A. Duplicated Action Items** (REMOVE):
   ```markdown
   ### ✅ Subject 1: Feature X
   **Action Items**:
   - [ ] Item 1
   - [ ] Item 2

   ### **Implementation - Iteration 1**
   **Action Items** (from brainstorming):  ← DUPLICATE! REMOVE THIS
   - [ ] Item 1
   - [ ] Item 2
   ```
   **FIX**: Replace Implementation action items with "See resolved subjects above"

   **B. Collapsed Iteration Lists** (EXPAND):
   ```markdown
   - 🚧 Task 23: Architecture (3 iterations total)  ← WRONG!
   ```
   **FIX**: Expand to show all iterations as sub-bullets

   **C. Duplicate Progress Sections** (REMOVE):
   - Old "Current Phase" headers scattered throughout
   - Multiple "Implementation Tasks" trackers
   - Redundant status summaries
   **FIX**: Single Progress Dashboard after Overview

   **D. Text-based Status Pointers** (REPLACE):
   ```markdown
   Current work: Search for "Current Phase" below  ← WRONG!
   ```
   **FIX**: Use jump links: `[Progress Dashboard](#-progress-dashboard)`

   **E. Missing Testing Strategy Section** (ADD):
   **FIX**: Add Testing Strategy section (see EXAMPLE_PLAN.md lines 87-129)

6. **Present analysis to user**:

   **DO NOT automatically make changes**. Instead, present findings:

   ```markdown
   ## 📋 Plan Structure Analysis

   I've compared your PLAN.md against the latest Flow framework (v1.2.1).

   **✅ Already Correct**:
   - [List patterns that match current framework]

   **❌ Needs Updates**:

   1. **Action Item Duplication** (Found in X iterations)
      - Problem: Implementation sections duplicate action items from subjects
      - Fix: Replace with "See resolved subjects above"
      - Saves: ~600-1000 tokens per iteration

   2. **Progress Dashboard Location** (if applicable)
      - Problem: Dashboard is [location]
      - Fix: Move to after Overview, before Architecture

   3. **[Other issues found]**
      - Problem: [description]
      - Fix: [what needs to change]

   **Recommendation**: Should I update your PLAN.md to fix these issues?
   - I'll create a backup first
   - All content will be preserved
   - Only structure/formatting changes
   ```

7. **If user approves, update plan structure** (preserve ALL content):

   **Create backup first**:
   - Copy: `.flow/PLAN.md.version-update-backup-$(date +%Y-%m-%d-%H%M%S)`

   **Apply fixes** based on analysis from step 5:
   - Fix action item duplication (replace with references)
   - Move Progress Dashboard to correct location
   - Remove duplicate progress sections
   - Update status pointers to jump links
   - Add missing sections (Testing Strategy, Changelog)
   - Expand collapsed iteration lists
   - Standardize status markers

   **Preserve ALL**:
   - Decisions and rationale
   - Brainstorming subjects and resolutions
   - Implementation notes
   - Completion dates
   - Bug discoveries
   - Code examples

8. **Verify consistency**:

   - Check Progress Dashboard matches status markers
   - Verify all sections follow framework structure
   - Ensure no content was lost

9. **Confirm to user**:
