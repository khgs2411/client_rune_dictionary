---
description: Mark current task as in progress
---

You are executing the `/flow-task-start` command from the Flow framework.

**Purpose**: Mark the current task as 🚧 IN PROGRESS (when first iteration starts).

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**
- State transition (⏳ PENDING → 🚧 IN PROGRESS)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 567-613 for lifecycle context

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

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Determine target task** (argument is optional):

   **If task number provided as argument**:
   - Use the specified task number
   - Verify task exists and is ⏳ PENDING
   - If not found or not PENDING: "Task [N] not found or not in PENDING state"

   **If no argument provided** (auto-detection):
   - Find current phase (marked 🚧 IN PROGRESS)
   - Find last ✅ COMPLETE task in that phase
   - Calculate next task number (last complete + 1)
   - Verify next task exists and is ⏳ PENDING
   - If not found: List available ⏳ PENDING tasks in current phase and ask user to specify
   - Example error: "Cannot auto-detect next task. Available pending tasks in Phase 2: Task 5, Task 7, Task 9. Use `/flow-task-start [number]` to specify."

3. **Update task status**: Change marker from ⏳ to 🚧 IN PROGRESS

4. **Update Progress Dashboard**:
   - Find "## 📋 Progress Dashboard" section
   - Update current task information
   - Update last updated timestamp
   - Add action description: "Task [N] started"

5. **Confirm to user**:
   - If argument provided: "✅ Started Task [N]: [Name]"
   - If auto-detected: "✅ Started Task [N]: [Name] (auto-detected next task)"
   - Suggest next steps: "Use `/flow-iteration-add [description]` to create iterations, or `/flow-brainstorm-start [topics]` to brainstorm first."

**Output**: Update .flow/PLAN.md with task status change and Progress Dashboard update.
