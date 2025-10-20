---
description: Mark current phase as complete
---

You are executing the `/flow-phase-complete` command from the Flow framework.

**Purpose**: Mark the current phase as ✅ COMPLETE (when all tasks done).

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- State transition (🚧 IN PROGRESS → ✅ COMPLETE)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 567-613 for completion criteria

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current phase**: Look for phase marked 🚧 IN PROGRESS

3. **Verify all tasks complete**: Check that all tasks in this phase are marked ✅ COMPLETE

   - If incomplete tasks found: "Phase has incomplete tasks. Complete them first or mark as ❌ CANCELLED / 🔮 DEFERRED."

4. **Update phase status**: Change marker from 🚧 to ✅ COMPLETE

5. **Update Progress Dashboard**:

   - Find "## 📋 Progress Dashboard" section
   - Update current phase to next phase (or mark project complete if no next phase)
   - Update completion percentages
   - Update last updated timestamp
   - Add action description: "Phase [N] complete"

6. **Check for next phase**:

   - If next phase exists: Auto-advance to next phase (show name)
   - If no next phase: "All phases complete! Project finished."

7. **Show "What's Next" Section**:
   ```markdown
   ## 🎯 What's Next

   Phase [N]: [Name] marked complete!

   **Decision Tree**:
   - **Next phase exists?** → Use `/flow-phase-start [optional: number]` to begin next phase
   - **All phases complete?** → Project finished! 🎉 Consider archiving or starting V2 planning
   - **Want to review progress?** → Use `/flow-summarize` to see complete project overview

   **Next phase**: Phase [N+1]: [Name] (if applicable)
   ```

**Output**: Update .flow/PLAN.md with phase completion, Progress Dashboard update, and clear next-step guidance.
