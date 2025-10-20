---
description: Complete brainstorming and generate action items
---

You are executing the `/flow-brainstorm-complete` command from the Flow framework.

**Purpose**: Close the current brainstorming session (only after pre-implementation tasks are done).

**🔴 REQUIRED: Read Framework Quick Reference First**

- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Completion Criteria (lines in Quick Reference)
- **Deep dive if needed**: Read lines 1740-1797 for Completion Criteria using Read(offset=1740, limit=58)

**IMPORTANT**: Pre-implementation tasks should be documented IN PLAN.md during brainstorming, then completed BEFORE running this command.

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Verify all subjects resolved**: Check "Subjects to Discuss" - all should be ✅

3. **Check for pre-implementation tasks**:

   - Look for "### **Pre-Implementation Tasks:**" section in PLAN.md
   - If found:
     - Check if all pre-tasks are marked ✅ COMPLETE
     - If any are ⏳ PENDING or 🚧 IN PROGRESS:
       "Pre-implementation tasks exist but are not complete. Complete them first, then run this command again."
     - If all are ✅ COMPLETE: Proceed to step 4
   - If not found:
     - Ask user: "Are there any pre-implementation tasks that need to be completed before starting the main implementation? (Refactoring, system-wide changes, bug fixes discovered during brainstorming, etc.)"
     - If yes: "Please document pre-implementation tasks in PLAN.md first (see framework guide), complete them, then run this command again."
     - If no: Proceed to step 4

4. **Update iteration status**: Change from 🚧 to 🎨 READY FOR IMPLEMENTATION

5. **Add note**: "**Status**: All brainstorming complete, pre-implementation tasks done, ready for implementation"

6. **Show "What's Next" Section**:
   ```markdown
   ## 🎯 What's Next

   Brainstorming session complete! Iteration marked 🎨 READY FOR IMPLEMENTATION.

   **REQUIRED NEXT STEP**: Use `/flow-implement-start` to begin implementation.

   **Before implementing**: Review your action items and ensure you understand the scope. If you discover new issues during implementation (scope violations), STOP and discuss with the user before proceeding.
   ```

**Output**: Update .flow/PLAN.md with brainstorming completion status and clear next-step guidance.
