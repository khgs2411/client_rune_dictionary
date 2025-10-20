---
description: Add a new task under the current phase
---

You are executing the `/flow-task-add` command from the Flow framework.

**Purpose**: Add a new task to the current phase in PLAN.md.

**🔴 REQUIRED: Read Framework Quick Reference First**

- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Task Structure Rules (lines 47-107) - Golden Rule: Standalone OR Iterations, Never Both
- **Deep dive if needed**: Read lines 597-920 for complete Task Structure Rules using Read(offset=597, limit=323)

**Framework Reference**: This command requires framework knowledge to create correct task structure. See Quick Reference guide above for essential patterns.

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)

**🚨 SCOPE BOUNDARY RULE**:
If you discover NEW issues while working on this task that are NOT part of the current work:

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
     REJECT: "❌ Missing task name/description. Example: /flow-task-add 'User Authentication'"
     STOP (don't proceed)
   ```

   **Step 2: Accept Everything Else** ⚠️ UX PRINCIPLE 2 (Never Block for Cosmetic Reasons):
   - Even minimal input like "API Design" is OK
   - Will use [TBD] for Purpose if not inferable
   - Proceed to step 2

2. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

3. **Parse arguments and extract metadata**: `$ARGUMENTS` = task description

   **Extract Purpose** (if provided in $ARGUMENTS):
   - Example: "User Authentication | Purpose: Implement secure login system"
   - If metadata provided, use it
   - If NOT provided, try to infer from task name:
     - "User Authentication" → Purpose: "Implement user authentication system"
     - "API Design" → Purpose: "Design and document API endpoints"
     - "Testing Infrastructure" → Purpose: "Setup testing framework and utilities"
   - If can't infer (unusual task name or too vague), use [TBD]:
     - Purpose: "[TBD] - Define purpose during task start or brainstorming"

4. **Find current phase**: Look for last phase marked ⏳ or 🚧

5. **Add new task section** ⚠️ UX PRINCIPLE 6 (Honest Communication):

   ```markdown
   #### Task [N]: [$ARGUMENTS] ⏳

   **Status**: PENDING
   **Purpose**: [Extracted/Inferred/[TBD]]

   ---
   ```

6. **Update .flow/PLAN.md**: Append task under current phase

7. **Update Progress Dashboard** (if it exists):

   - Update task count in Progress Overview
   - Add new task to phase's task list
   - No need to change "Current Work" pointer (new task is ⏳ PENDING)

8. **Confirm to user** (show what was used):
   - "✅ Added Task [N]: [$ARGUMENTS] to current phase"
   - IF used [TBD]: "📝 Used [TBD] placeholder for Purpose"
   - IF inferred metadata: "💡 Inferred Purpose = '[value]'"
   - "💡 Refine with `/flow-task-start` or `/flow-brainstorm-start` when ready"

**Output**: Update .flow/PLAN.md with new task.
