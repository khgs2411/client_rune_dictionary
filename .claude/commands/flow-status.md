---
description: Show current position and verify plan consistency
---

You are executing the `/flow-status` command from the Flow framework.

**Purpose**: Show current position in the plan and verify active work consistency.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**
- Dashboard-first approach using grep-based pattern matching
- Reduces token usage by 95% (from 32,810 → ~1,530 tokens for large files)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 2015-2314 for dashboard structure reference

**PERFORMANCE NOTE**: This is the reference model for Category B commands - uses targeted greps instead of reading entire framework.

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Read Progress Dashboard ONLY** (Dashboard-first approach):
   ```bash
   # Use Grep to read ONLY the Progress Dashboard section (~50 lines)
   Grep pattern: "^## 📋 Progress Dashboard"
   Use -A 20 flag to read ~20 lines after match
