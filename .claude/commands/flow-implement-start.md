---
description: Begin implementation of current iteration
---

You are executing the `/flow-implement-start` command from the Flow framework.

**Purpose**: Begin implementation phase for the current iteration.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- State transition (🎨 READY/⏳ PENDING → 🚧 IMPLEMENTING)
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 1798-1836 for implementation workflow

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Framework Pattern**: See "Implementation Pattern" section in framework guide
- **Prerequisite**: Brainstorming must be ✅ COMPLETE and all pre-implementation tasks done

**🚨 SCOPE BOUNDARY RULE** (CRITICAL - see DEVELOPMENT_FRAMEWORK.md lines 339-540):

If you discover NEW issues during implementation that are NOT part of the current iteration's action items:

1. **STOP** immediately - Don't make assumptions or proceed
2. **NOTIFY** user - Present discovered issue(s) with structured analysis
3. **DISCUSS** - Provide structured options (A/B/C/D format):
   - **A**: Create pre-implementation task (< 30 min work, blocking)
   - **B**: Add as new brainstorming subject (design needed)
   - **C**: Handle immediately (only if user approves)
   - **D**: Defer to separate iteration (after current work)
4. **AWAIT USER APPROVAL** - Never proceed without explicit user decision

**Use the Scope Boundary Alert Template** (see DEVELOPMENT_FRAMEWORK.md lines 356-390)

**Exception**: Syntax errors or blocking bugs in files you must modify (document what you fixed in Implementation Notes)

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current iteration**:

   - **First**, look for iteration marked 🎨 READY FOR IMPLEMENTATION
   - **If not found**, check if previous iteration is ✅ COMPLETE and next iteration is ⏳ PENDING
     - If YES: Ask user "Previous iteration complete. Do you want to brainstorm this iteration first (recommended) or skip directly to implementation?"
       - **User chooses brainstorm**: Respond "Please run `/flow-brainstorm-start` first to design this iteration"
       - **User chooses skip**: Proceed with step 3 (treat ⏳ PENDING as ready to implement)
     - If NO: Error "No iteration ready for implementation. Run `/flow-brainstorm-complete` first or check iteration status."

3. **Read Testing Strategy section** (CRITICAL):

   - Locate "## Testing Strategy" section in PLAN.md
   - Understand the verification methodology (simulation, unit tests, TDD, manual QA, etc.)
   - Note file locations, naming conventions, and when verification happens
   - **IMPORTANT**: Follow Testing Strategy exactly - do NOT create test files that violate conventions

4. **Verify readiness** (if iteration was 🎨 READY):

   - Brainstorming should be marked ✅ COMPLETE
   - All pre-implementation tasks should be ✅ COMPLETE
   - If not ready: Warn user and ask to complete brainstorming/pre-tasks first

5. **Update iteration status**: Change from 🎨 (or ⏳ if skipping brainstorm) to 🚧 IN PROGRESS

6. **Create implementation section**:

   ```markdown
   ### **Implementation - Iteration [N]: [Name]**

   **Status**: 🚧 IN PROGRESS

   **Action Items**: See resolved subjects above (Type 2/D items)

   **Implementation Notes**:

   [Leave blank for user to fill during implementation]

   **Files Modified**:

   [Leave blank - will be filled as work progresses]

   **Verification**: [Leave blank - how work will be verified]

   ---
   ```

   **IMPORTANT**: Do NOT copy/duplicate action items from subjects to implementation section. The implementation section REFERENCES subjects where action items are defined. This prevents token waste and maintains single source of truth.
