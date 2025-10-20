---
description: Archive old completed tasks to reduce PLAN.md size
---

You are executing the `/flow-plan-split` command from the Flow framework.

**Purpose**: Archive old completed tasks outside the recent context window to `.flow/ARCHIVE.md`, reducing PLAN.md size while preserving full project history.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- Archives completed tasks to ARCHIVE.md (keeps recent 3 tasks in PLAN.md)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 2363-2560 for archival patterns

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Archive File**: .flow/ARCHIVE.md (created/appended)

**When to Use**: When PLAN.md exceeds 2000 lines or has 10+ completed tasks, causing performance issues or difficult navigation.

**Archiving Strategy - Recent Context Window**:

- **Keep in PLAN.md**: Current task + 3 previous tasks (regardless of status)
- **Archive to ARCHIVE.md**: All ✅ COMPLETE tasks older than "current - 3"
- **Always Keep**: Non-complete tasks (⏳ 🚧 ❌ 🔮) regardless of age

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current task number**:

   - Read Progress Dashboard to identify current task
   - Extract task number (e.g., if "Task 13" is current, task number = 13)

3. **Calculate archiving threshold**:

   - Threshold = Current task number - 3
   - Example: Current = 13, Threshold = 10
   - **Archive candidates**: Tasks 1-9 (if ✅ COMPLETE)
   - **Keep in PLAN.md**: Tasks 10, 11, 12, 13 (current + 3 previous)

4. **Extract archivable tasks**:

   - Find all tasks with number < threshold AND status = ✅ COMPLETE
   - Extract FULL task content:
     - Task header and metadata
     - All iterations (brainstorming, implementation, verification)
     - All nested content
   - **IMPORTANT**: Keep tasks that are ❌ ⏳ 🚧 🔮 even if old (incomplete work stays visible)

5. **Create or append to ARCHIVE.md**:

   **If .flow/ARCHIVE.md does NOT exist** (first split):

   ```markdown
   # Project Archive

   This file contains completed tasks that have been archived from PLAN.md to reduce file size.

   **Archive Info**:

   - All content preserved (nothing deleted)
   - Organized by Phase → Task → Iteration
   - Reference: See PLAN.md Progress Dashboard for full project history

   **Last Updated**: [Current date]
   **Tasks Archived**: [Count]

   ---

   [Archived task content here - preserve phase structure]
   ```
