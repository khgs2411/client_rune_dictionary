---
description: Mark current phase as in progress
---

You are executing the `/flow-phase-start` command from the Flow framework.

**Purpose**: Mark the current phase as 🚧 IN PROGRESS (when first task starts).

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**
- State transition (⏳ PENDING → 🚧 IN PROGRESS)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 567-613 for lifecycle context

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

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current phase**: Look for last phase marked ⏳ PENDING

3. **Update phase status**: Change marker from ⏳ to 🚧 IN PROGRESS

4. **Update Progress Dashboard**:
   - Find "## 📋 Progress Dashboard" section
   - Update current phase information
   - Update last updated timestamp
   - Add action description: "Phase [N] started"

5. **Confirm to user**: "Started Phase [N]: [Name]. Use `/flow-task-add [description]` to create tasks."

**Output**: Update .flow/PLAN.md with phase status change and Progress Dashboard update.
