You are executing the `/flow-compact` command from the Flow framework.

**Purpose**: Generate comprehensive conversation report for context transfer to new AI instance.

**🟢 NO FRAMEWORK READING REQUIRED - This command works entirely from PLAN.md**

- Generates comprehensive report using PLAN.md content and `/flow-status` logic
- Optional background reading (NOT required): DEVELOPMENT_FRAMEWORK.md lines 2327-2362 for context preservation patterns

**Context**:

- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Use case**: Before compacting conversation or starting new AI session - ensures zero context loss

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Run status verification first**:

   - Execute `/flow-status` command logic to verify current position
   - Check for conflicting status sections (warn if found)
   - Use this verified status as authoritative source for the report

3. **Generate comprehensive report covering**:

   **Current Work Context**:

   - What feature/task are we working on?
   - What phase/task/iteration are we in? (with status)
   - What was the original goal?

   **Conversation History**:

   - What decisions were made during brainstorming? (with rationale)
   - What subjects were discussed and resolved?
   - What pre-implementation tasks were identified and completed?
   - What action items were generated?

   **Implementation Progress**:

   - What has been implemented so far?
   - What files were created/modified?
   - What verification was done?
   - What remains incomplete?

   **Challenges & Solutions**:

   - What blockers were encountered?
   - How were they resolved?
   - What design trade-offs were made?

   **Next Steps**:

   - What is the immediate next action?
   - What are the pending action items?
   - What should the next AI instance focus on?

   **Important Context**:

   - Any quirks or special considerations for this feature
   - Technical constraints or dependencies
   - User preferences or decisions that must be preserved

4. **Report format**:
