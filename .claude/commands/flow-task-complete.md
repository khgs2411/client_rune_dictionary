---
description: Mark current task as complete
---

You are executing the `/flow-task-complete` command from the Flow framework.

**Purpose**: Mark the current task as ✅ COMPLETE (when all iterations done).

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- State transition (🚧 IN PROGRESS → ✅ COMPLETE)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 567-613 for completion criteria

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current task**: Look for task marked 🚧 IN PROGRESS

3. **Verify all iterations complete**: Check that all iterations in this task are marked ✅ COMPLETE

   - If incomplete iterations found: "Task has incomplete iterations. Complete them first or mark as ❌ CANCELLED / 🔮 DEFERRED."

4. **Update task status**: Change marker from 🚧 to ✅ COMPLETE

5. **Update Progress Dashboard**:

   - Find "## 📋 Progress Dashboard" section
   - Update current task to next task (or next phase if all tasks done)
   - Update completion percentages
   - Update last updated timestamp
   - Add action description: "Task [N] complete"

6. **Check if phase complete**:

   - If all tasks in phase are ✅ COMPLETE: Suggest `/flow-phase-complete`
   - If more tasks: Auto-advance to next task (show name)

7. **Show "What's Next" Section**:
   ```markdown
   ## 🎯 What's Next

   Task [N]: [Name] marked complete!

   **Decision Tree**:
   - **All tasks in phase complete?** → Use `/flow-phase-complete` to mark phase as ✅ COMPLETE
   - **More tasks in phase?** → Use `/flow-task-start [optional: number]` to begin next task
   - **Want to see current state?** → Use `/flow-status` to see suggestions

   **Next task**: Task [N+1]: [Name] (if applicable)
   ```

**Output**: Update .flow/PLAN.md with task completion, Progress Dashboard update, and clear next-step guidance.
