---
description: Add a new phase to the development plan
---

You are executing the `/flow-phase-add` command from the Flow framework.

**Purpose**: Add a new phase to the current PLAN.md file.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- Simple structure addition (adds new phase section to PLAN.md)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 567-613 for phase patterns

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)

**🚨 SCOPE BOUNDARY RULE**:
If you discover NEW issues while working on this phase that are NOT part of the current work:

1. **STOP** immediately
2. **NOTIFY** user of the new issue
3. **DISCUSS** what to do (add to brainstorm, create pre-task, defer, or handle now)
4. **ONLY** proceed with user's explicit approval

**Instructions**:

1. **INPUT VALIDATION** (Token-Efficient - Run BEFORE reading PLAN.md) ⚠️ UX PRINCIPLE 1 & 2:

   **Goal**: Accept minimal input, use [TBD] for missing metadata - never block for cosmetic reasons.

   **Step 1: Hard Rule Check** (< 10 tokens):
   ```
   IF $ARGUMENTS is empty OR just whitespace:
     REJECT: "❌ Missing phase name/description. Example: /flow-phase-add 'Testing and QA'"
     STOP (don't proceed)
   ```

   **Step 2: Accept Everything Else** ⚠️ UX PRINCIPLE 2 (Never Block for Cosmetic Reasons):
   - Even minimal input like "Testing" is OK
   - Will use [TBD] for Strategy and Goal if not inferable
   - Proceed to step 2

2. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

3. **Verify framework understanding**: Know that phases are top-level milestones (e.g., "Foundation", "Core Implementation", "Testing")

4. **Parse arguments and extract metadata**: `$ARGUMENTS` = phase description

   **Extract Strategy and Goal** (if provided in $ARGUMENTS):
   - Example: "Testing Phase | Strategy: Comprehensive QA | Goal: Zero critical bugs"
   - If metadata provided, use it
   - If NOT provided, try to infer from phase name:
     - "Testing" → Strategy: "Quality assurance and validation", Goal: "Ensure code quality and stability"
     - "Foundation" → Strategy: "Setup and architecture", Goal: "Establish project foundation"
     - "Polish" → Strategy: "UX and optimization", Goal: "Production-ready quality"
   - If can't infer (unusual phase name or too vague), use [TBD]:
     - Strategy: "[TBD] - Define strategy during phase start"
     - Goal: "[TBD] - Define goal during phase start"

5. **Add new phase section** ⚠️ UX PRINCIPLE 6 (Honest Communication):

   ```markdown
   ### Phase [N]: [$ARGUMENTS] ⏳

   **Strategy**: [Extracted/Inferred/[TBD]]

   **Goal**: [Extracted/Inferred/[TBD]]

   ---
   ```

6. **Update .flow/PLAN.md**: Append new phase to Development Plan section

7. **Update Progress Dashboard** (if it exists):

   - Update phase count in Progress Overview section
   - No need to change "Current Work" pointer (new phase is ⏳ PENDING)
   - Add new phase to completion status if tracking percentages

8. **Confirm to user** (show what was used):
   - "✅ Added Phase [N]: [$ARGUMENTS]"
   - IF used [TBD]: "📝 Used [TBD] placeholders for: [Strategy/Goal]"
   - IF inferred metadata: "💡 Inferred: Strategy = '[value]', Goal = '[value]'"
   - "💡 Refine with `/flow-phase-start` when ready to begin"

**Output**: Update .flow/PLAN.md with new phase.
