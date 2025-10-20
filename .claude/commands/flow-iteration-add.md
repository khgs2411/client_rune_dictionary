---
description: Add a new iteration under the current task
---

You are executing the `/flow-iteration-add` command from the Flow framework.

**Purpose**: Add a new iteration to the current task in PLAN.md.

**🔴 REQUIRED: Read Framework Quick Reference First**

- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Iteration Patterns (lines in Quick Reference)
- **Deep dive if needed**: Read lines 567-613 for Development Workflow using Read(offset=567, limit=47)

**🚨 SCOPE BOUNDARY RULE**:
If you discover NEW issues while working on this iteration that are NOT part of the current work:

1. **STOP** immediately
2. **NOTIFY** user of the new issue
3. **DISCUSS** what to do (add to brainstorm, create pre-task, defer, or handle now)
4. **ONLY** proceed with user's explicit approval

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Parse arguments**: `$ARGUMENTS` = iteration description

3. **Find current task**: Look for last task marked ⏳ or 🚧

4. **Add new iteration section**:

   ```markdown
   ##### Iteration [N]: [$ARGUMENTS] ⏳

   **Status**: PENDING
   **Goal**: [What this iteration builds]

   ---
   ```
