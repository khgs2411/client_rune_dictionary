---
description: Undo last plan change
---

You are executing the `/flow-rollback` command from the Flow framework.

**Purpose**: Undo the last change made to PLAN.md.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- Undoes last change using Changelog section
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 1969-2014 for rollback patterns

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Check if rollback is possible**:

   - Look for "Changelog" section at bottom of PLAN.md
   - If no recent changes logged: "No recent changes to rollback."

3. **Identify last change**:

   - Parse last entry in Changelog
   - Determine what was changed (phase added, task marked complete, etc.)

4. **Ask for confirmation**:

   - "Last change: [Description of change]. Rollback? (yes/no)"

5. **If confirmed, revert change**:

   - Remove last added section, OR
   - Change status marker back to previous state, OR
   - Uncheck last checked checkbox

6. **Update Changelog**: Add rollback entry

7. **Confirm to user**: "Rolled back: [Description of change]"

**Limitation**: Can only rollback one step at a time. For major reverts, manually edit PLAN.md.

**Output**: Revert last change in PLAN.md.
