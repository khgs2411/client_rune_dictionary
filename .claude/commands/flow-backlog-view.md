---
description: Show backlog contents (tasks waiting)
---

You are executing the `/flow-backlog-view` command from the Flow framework.

**Purpose**: Display backlog dashboard showing all tasks currently in backlog.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from BACKLOG.md**

- Simple read operation (shows backlog dashboard)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 3407-3682 for backlog context

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Backlog File**: .flow/BACKLOG.md (read-only for this command)

**Instructions**:

1. **Check if .flow/BACKLOG.md exists**:
   - If NOT found: "📦 Backlog is empty. Use `/flow-backlog-add <task>` to move tasks from active plan."
   - If found: Proceed to step 2

2. **Read Backlog Dashboard section**:
   - Use Grep to extract dashboard:
     ```bash
     grep -A 20 "^## 📋 Backlog Dashboard" BACKLOG.md
     ```
   - Extract task list from "Tasks Waiting" section

3. **Parse backlog metadata**:
   - Extract "Last Updated" timestamp
   - Extract "Tasks in Backlog" count
   - Parse task list (task numbers and names)

4. **Display backlog contents**:

   ```
   📦 Backlog Contents ([N] tasks):

   **Last Updated**: [Date]

   **Tasks Waiting**:
   - **Task 14**: Potency system
   - **Task 15**: Points & Luck systems
   - **Task 16**: Database persistence
   - **Task 17**: Damage variance
   - **Task 18**: Game integration
   - **Task 19**: Attribute Guarantee - HIGH
   - **Task 20**: Context Modifiers - CRITICAL
   - **Task 21**: Affix Synergy - MEDIUM
   - **Task 22**: Retry Handler - HIGH

   ---

   **Next Steps**:
   - Use `/flow-backlog-pull <task-number>` to move a task back to active plan
   - Example: `/flow-backlog-pull 14` brings Task 14 back as next task in active phase
   ```

5. **Optional: Show task details** (if user wants more info):
   - Can read full task content from BACKLOG.md on request
   - Default view is just dashboard (lightweight)

**Output**: Display backlog dashboard with task list and guidance.
