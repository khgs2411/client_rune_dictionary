---
description: Verify plan file matches actual codebase state
---

You are executing the `/flow-verify-plan` command from the Flow framework.

**Purpose**: Verify that PLAN.md is synchronized with the actual project state.

**🔴 REQUIRED: Read Framework Quick Reference First**

- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Framework Structure validation (lines in Quick Reference)
- **Deep dive if needed**: Read lines 105-179 for Framework Structure using Read(offset=105, limit=75)

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Use case**: Run before starting new AI session or compacting conversation to ensure context is accurate

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current iteration**: Look for iteration marked 🚧 IN PROGRESS or 🎨 READY FOR IMPLEMENTATION

3. **Read current implementation section**:

   - Find "Implementation - Iteration [N]" section
   - Identify all action items
   - Note which items are marked as ✅ complete

4. **Verify claimed completions against actual project state**:

   - For each ✅ completed action item, check if it actually exists:
     - "Create UserAuth.ts" → Verify file exists
     - "Add login endpoint" → Search for login endpoint in code
     - "Update database schema" → Check schema files
   - List any discrepancies found

5. **Check for unreported work**:

   - Look for modified files that aren't mentioned in PLAN.md
   - Check git status (if available) for uncommitted changes
   - Identify files that were changed but not documented

6. **Report findings**:
