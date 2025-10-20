---
description: Move task(s) to backlog to reduce active plan clutter
---

You are executing the `/flow-backlog-add` command from the Flow framework.

**Purpose**: Move pending tasks from PLAN.md to BACKLOG.md to reduce active plan size while preserving all task context (iterations, brainstorming, everything).

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- Moves full task content to backlog (token efficiency feature)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 3407-3682 for backlog management patterns

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Backlog File**: .flow/BACKLOG.md (created/updated)

**Key Insight**: Backlog is for **token efficiency**, not prioritization. Tasks aren't "low priority" - they're just "not now" (weeks/months away).

**Signature**: `/flow-backlog-add <task-number>` or `/flow-backlog-add <start>-<end>`

**Examples**:
- `/flow-backlog-add 14` - Move Task 14 to backlog
- `/flow-backlog-add 14-22` - Move Tasks 14 through 22 to backlog

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Parse arguments**:
   - Single task: `$ARGUMENTS` = task number (e.g., "14")
   - Range: `$ARGUMENTS` = start-end (e.g., "14-22")
   - Extract task number(s) to move

3. **Validate tasks**:
   - Verify each task exists in PLAN.md
   - Check task status - warn if moving tasks that are 🚧 IN PROGRESS or ✅ COMPLETE
   - Recommended: Only move ⏳ PENDING tasks
   - If user confirms moving non-pending tasks, proceed

4. **Extract full task content from PLAN.md**:
   - For each task number, extract COMPLETE task section:
     - Task header: `#### Task [N]: [Name] [Status]`
     - All task metadata (Status, Purpose, etc.)
     - ALL iterations (full content with brainstorming, implementation, verification)
     - ALL nested content (pre-tasks, bugs discovered, etc.)
   - Use awk range extraction:
     ```bash
     awk '/^#### Task 14:/,/^####[^#]|^###[^#]/ {print}' PLAN.md
     ```

5. **Create or update .flow/BACKLOG.md**:

   **If BACKLOG.md does NOT exist** (first time):

   ```markdown
   # Project Backlog

   This file contains tasks moved from PLAN.md to reduce active plan size while preserving all context.

   **Backlog Info**:
   - Tasks retain original numbers for easy reference
   - Full content preserved (brainstorming, iterations, everything)
   - Pull tasks back to active plan when ready to work on them

   **Last Updated**: [Current date]
   **Tasks in Backlog**: [Count]

   ---

   ## 📋 Backlog Dashboard

   **Tasks Waiting**:
   - **Task [N]**: [Name]
   - **Task [N]**: [Name]

   ---

   ### Phase [N]: [Phase Name from PLAN.md]

   [Extracted task content here - preserve original task numbers]
   ```

   **If BACKLOG.md ALREADY exists**:
   - Read existing BACKLOG.md
   - Update "Last Updated" timestamp
   - Update "Tasks in Backlog" count
   - Add tasks to Backlog Dashboard list
   - Append task content to appropriate phase section
   - Maintain phase hierarchy (don't duplicate phase headers if they exist)

6. **Update PLAN.md**:

   **A. Remove task content**:
   - Delete full task sections for backlogged tasks
   - Leave gap in task numbering (don't renumber)
   - Add comment marking removal:
     ```markdown
     [Task 14 moved to backlog - see .flow/BACKLOG.md]
     [Task 15 moved to backlog - see .flow/BACKLOG.md]
     ```

   **B. Do NOT update Progress Dashboard**:
   - Backlog tasks are invisible to dashboard (no 📦 marker)
   - Keep task numbers in dashboard but mark as moved:
     ```markdown
     - ⏳ Task 14: Potency system (moved to backlog)
     ```
   - Or simply remove from dashboard (user preference)

7. **Reset task status to ⏳ PENDING** (in BACKLOG.md):
   - All backlogged tasks reset to ⏳ PENDING
   - Fresh start when pulled back

8. **Verify and confirm**:
   - Count lines before/after PLAN.md (use `wc -l`)
   - Calculate reduction
   - Confirm to user:

     ```
     ✅ Moved to backlog!

     **Backlogged**: [N] task(s) to .flow/BACKLOG.md
     **PLAN.md size**: Reduced from Y lines to Z lines (-W lines, -P%)
     **Tasks moved**: Task [list of numbers]

     Use `/flow-backlog-view` to see backlog contents.
     Use `/flow-backlog-pull <task-number>` to bring a task back when ready.
     ```

**Edge Cases**:
- **Task doesn't exist**: "Task [N] not found in PLAN.md"
- **Invalid range**: "Invalid range format. Use: /flow-backlog-add 14-22"
- **Empty range**: "No tasks found in range 14-22"
- **Already in backlog**: Check BACKLOG.md first, warn if task already there

**Output**: Update .flow/PLAN.md (reduced), create/update .flow/BACKLOG.md (tasks preserved).
