---
description: Generate summary of all phases/tasks/iterations
---

You are executing the `/flow-summarize` command from the Flow framework.

**Purpose**: Generate high-level overview of entire project structure and completion state.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**
- Uses PLAN.md structure only (no framework knowledge needed)
- Parses all phases/tasks/iterations with status markers
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 105-179 for hierarchy context

**Context**:
- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Use case**: "Bird's eye view" of project health, progress across all phases, quick status reports

**Comparison to other commands**:
- `/flow-status` = "Where am I RIGHT NOW?" (micro view - current iteration)
- `/flow-summarize` = "What's the WHOLE PICTURE?" (macro view - all phases/tasks/iterations)
- `/flow-verify-plan` = "Is this accurate?" (validation)
- `/flow-compact` = "Transfer full context" (comprehensive handoff)

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Parse entire PLAN.md structure**:
   - Extract Version (from metadata at top)
   - Extract current Status line (from metadata)
   - Parse ALL phases with their status markers
   - For each phase, parse ALL tasks
   - For each task, parse ALL iterations
   - Track completion percentages at each level

3. **Generate structured summary** (compact, scannable format):
