---
description: Smart helper - suggests next action based on current context
---

You are executing the `/flow-next` command from the Flow framework.

**Purpose**: Auto-detect current context and suggest the next logical step.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- Smart navigation using Dashboard and current context
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 3277-3356 for decision tree reference

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Determine current context**:

   - Check current iteration status (⏳ 🚧 🎨 ✅)
   - Check if in brainstorming session:
     - Look for "Subjects to Discuss" section
     - Count unresolved subjects: grep -c "^[0-9]\+\. ⏳"
   - Check for pre-implementation tasks:
     - Look for "### **Pre-Implementation Tasks:**" section
     - Count pending: grep -c "^#### ⏳ Task [0-9]"
     - Count complete: grep -c "^#### ✅ Task [0-9]"
   - Check if in main implementation (look for "### **Implementation**" section)

3. **Suggest next command based on context**:

   **Determine exact state**:

   **If status = ⏳ PENDING**:
   → "Use `/flow-brainstorm-start [topic]` to begin this iteration"

   **If status = 🚧 IN PROGRESS**:
   **Check phase progression** (in this order):

   1. **Check unresolved subjects**:
      If any "⏳" subjects in "Subjects to Discuss":
      → "Use `/flow-next-subject` to resolve next subject"
      Show: "X subjects remaining: [list]"

   2. **Check pre-implementation tasks**:
      If "### **Pre-Implementation Tasks:**" section exists:
      Count pending tasks (^#### ⏳)

      If pending > 0:
      → "Continue with Task X: [Name]"
      Show: "[X/Y] pre-implementation tasks complete"

      If pending = 0:
      → "Pre-implementation complete. Use `/flow-brainstorm-complete`"

   3. **Check main implementation**:
      If "### **Implementation**" section exists:
      → "Continue main implementation"
      Show: "Use `/flow-implement-complete` when done"

   4. **Default** (subjects resolved, no pre-tasks):
      → "Use `/flow-brainstorm-complete` to finish brainstorming"

   **If status = 🎨 READY**:
   → "Use `/flow-implement-start` to begin implementation"

   **If status = ✅ COMPLETE**:
   → "Use `/flow-next-iteration` to move to next iteration"

4. **Show current status summary**: Brief summary of where you are

**Output**: Suggest appropriate next command based on context.
