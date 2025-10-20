---
description: Show next iteration details
---

You are executing the `/flow-next-iteration` command from the Flow framework.

**Purpose**: Display details about the next pending iteration in the current task.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- Finds next ⏳ PENDING iteration in current task
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 567-613 for iteration context

**Pattern**: Works like `/flow-next-subject` but for iterations - shows what's coming next.

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current task**: Look for task marked 🚧 IN PROGRESS

3. **Find next pending iteration**: Look for first iteration in current task marked ⏳ PENDING

4. **If found, display iteration details**:
