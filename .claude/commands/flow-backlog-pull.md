---
description: Pull task from backlog back into active plan
---

You are executing the `/flow-backlog-pull` command from the Flow framework.

**Purpose**: Move a task from BACKLOG.md back to PLAN.md with sequential renumbering in active phase.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md and BACKLOG.md**

- Moves task content back to active plan
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 3407-3682 for backlog patterns

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Backlog File**: .flow/BACKLOG.md (read and remove from)

**Signature**: `/flow-backlog-pull <task-number> [instruction-text]`

**Examples**:
- `/flow-backlog-pull 14` - Pull Task 14, insert at end of active phase with next available number
- `/flow-backlog-pull 14 insert after task 13` - Pull Task 14, position after Task 13 (but still renumber sequentially)
- `/flow-backlog-pull 14 add to phase 5` - Pull Task 14, add to Phase 5 instead of active phase

**Instructions**:

1. **Check if .flow/BACKLOG.md exists**:
   - If NOT found: "📦 Backlog is empty. Nothing to pull."
   - If found: Proceed

2. **Parse arguments**:
   - Required: Task number to pull (e.g., "14")
   - Optional: Instruction text for positioning (e.g., "insert after task 13")
   - Extract task number and instruction (if provided)

3. **Validate task exists in backlog**:
   - Search BACKLOG.md for `#### Task [N]:`
   - If NOT found: "Task [N] not found in backlog. Use `/flow-backlog-view` to see what's available."
   - If found: Proceed

4. **Extract full task content from BACKLOG.md**:
   - Use awk to extract complete task section:
     ```bash
     awk '/^#### Task 14:/,/^####[^#]|^###[^#]/ {print}' BACKLOG.md
     ```
   - Preserve ALL content (iterations, brainstorming, metadata, etc.)

5. **Determine insertion position in PLAN.md**:

   **A. Find active phase**:
   - Read Progress Dashboard to identify current phase
   - If instruction specifies different phase, use that instead

   **B. Calculate new task number**:
   - Find highest task number in target phase
   - New task number = highest + 1
   - Example: Phase 4 has Tasks 11, 12, 13 → New task becomes Task 14

   **C. Determine insertion point** (where in file):
   - **Default** (no instruction): Insert after last task in target phase
   - **With instruction**: Parse instruction for positioning
     - "insert after task 13" → Find Task 13, insert after it
     - "insert before task 12" → Find Task 12, insert before it
     - "add to phase 5" → Find Phase 5, insert at end
   - **Position ≠ Number**: Task positioned after 13 but numbered as 14 (sequential)

6. **Renumber task header**:
   - Change `#### Task 14:` (old backlog number) to `#### Task [new-number]:`
   - Example: Backlog Task 14 becomes PLAN.md Task 14 (if next available)
   - Update task metadata with new number

7. **Insert task into PLAN.md**:
   - Insert full task content at determined position
   - Maintain proper markdown hierarchy
   - Preserve all nested content

8. **Remove task from BACKLOG.md**:
   - Delete complete task section from BACKLOG.md
   - Update Backlog Dashboard:
     - Remove task from "Tasks Waiting" list
     - Decrement "Tasks in Backlog" count
     - Update "Last Updated" timestamp
   - **No trace left** - as if task was never in backlog

9. **Update PLAN.md Progress Dashboard** (if it exists):
   - Add pulled task to dashboard
   - Update task count for target phase
   - Mark as ⏳ PENDING (fresh start)

10. **Verify and confirm**:
    - Confirm to user:

      ```
      ✅ Pulled from backlog!

      **Task**: Task [old-number] from backlog → Task [new-number] in PLAN.md
      **Phase**: Phase [N]: [Name]
      **Position**: [Description based on instruction or default]
      **Status**: ⏳ PENDING (ready to start)

      **Backlog**: [N-1] tasks remaining

      Use `/flow-task-start [new-number]` to begin this task when ready.
      ```

**Edge Cases**:
- **Backlog empty**: "Backlog is empty. Nothing to pull."
- **Task not in backlog**: "Task [N] not in backlog. Use `/flow-backlog-view` to see available tasks."
- **Invalid instruction**: Warn and use default positioning
- **No active phase**: Ask user which phase to add task to

**Output**: Update .flow/PLAN.md (task added), update .flow/BACKLOG.md (task removed).
