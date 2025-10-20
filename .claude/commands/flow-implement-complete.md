---
description: Mark current iteration as complete
---

You are executing the `/flow-implement-complete` command from the Flow framework.

**Purpose**: Mark the current iteration as complete.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**
- State transition (🚧 IMPLEMENTING → ✅ COMPLETE)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 1798-1836 for completion criteria

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current iteration**: Look for iteration marked 🚧 IN PROGRESS

3. **Verify completion**:
   - Check all action items are ✅ checked
   - If unchecked items remain: Ask user "There are unchecked action items. Are you sure you want to mark complete? (yes/no)"

4. **Prompt for verification notes**:
   - "How did you verify this iteration works? (tests, manual checks, etc.)"

5. **Update iteration status**: Change from 🚧 to ✅ COMPLETE

6. **Update implementation section**:
   - Add verification notes
   - Add timestamp

7. **Add completion summary**:
   ```markdown
   **Implementation Results**:
   - [Summarize what was built]
   - [List key accomplishments]

   **Verification**: [User's verification method]

   **Completed**: [Date]
