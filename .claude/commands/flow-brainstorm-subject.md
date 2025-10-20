---
description: Add a subject to discuss in brainstorming
---

You are executing the `/flow-brainstorm-subject` command from the Flow framework.

**Purpose**: Add a new subject to the current brainstorming session.

**🔴 REQUIRED: Read Framework Quick Reference First**
- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Subject Creation Patterns (lines in Quick Reference)
- **Deep dive if needed**: Read lines 1215-1313 for Subject Resolution Types using Read(offset=1215, limit=99)

**🚨 SCOPE BOUNDARY RULE** (CRITICAL - see DEVELOPMENT_FRAMEWORK.md lines 339-540):

Adding subjects dynamically is a KEY feature of Flow. When you discover NEW issues while discussing current subjects:

1. **STOP** immediately - Don't make assumptions or proceed
2. **NOTIFY** user - Present discovered issue(s) with structured analysis
3. **DISCUSS** - Provide structured options (A/B/C/D format):
   - **A**: Create pre-implementation task (< 30 min work, blocking current subject resolution)
   - **B**: Add as new brainstorming subject (this command - design needed)
   - **C**: Handle immediately as part of current subject (only if user approves)
   - **D**: Defer to separate iteration (after current work)
4. **AWAIT USER APPROVAL** - Never proceed without explicit user decision

**Use the Scope Boundary Alert Template** (see DEVELOPMENT_FRAMEWORK.md lines 356-390)

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Parse arguments**: `$ARGUMENTS` = subject name and optional brief description

3. **Find current brainstorming session**: Look for "Subjects to Discuss" section

4. **Add subject to list**:
   - Count existing subjects
   - Append: `[N]. ⏳ **[$ARGUMENTS]** - [Brief description if provided]`

5. **Update .flow/PLAN.md**: Add subject to "Subjects to Discuss" list

6. **Confirm to user**: "Added Subject [N]: [$ARGUMENTS] to brainstorming session."

**Output**: Update .flow/PLAN.md with new subject.
