---
description: Discuss next subject, capture decision, and mark resolved
---

You are executing the `/flow-next-subject` command from the Flow framework.

**Purpose**: Show next unresolved subject, present options collaboratively, wait for user decision, then mark as ✅ resolved.

**🔴 REQUIRED: Read Framework Quick Reference First**

- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Subject Resolution Types (lines 108-132) - Types A/B/C/D decision matrix
- **Deep dive if needed**: Read lines 1570-1680 for Subject Resolution details using Read(offset=1570, limit=110)

**Framework Reference**: This command requires framework knowledge to properly categorize resolution types. See Quick Reference guide above for essential patterns.

**🚨 SCOPE BOUNDARY RULE** (CRITICAL - see DEVELOPMENT_FRAMEWORK.md lines 339-540):

If you discover NEW issues while discussing subjects that are NOT part of the current iteration:

1. **STOP** immediately - Don't make assumptions or proceed
2. **NOTIFY** user - Present discovered issue(s) with structured analysis
3. **DISCUSS** - Provide structured options (A/B/C/D format):
   - **A**: Create pre-implementation task (< 30 min work, blocking)
   - **B**: Add as new brainstorming subject (design needed)
   - **C**: Handle immediately (only if user approves)
   - **D**: Defer to separate iteration (after current work)
4. **AWAIT USER APPROVAL** - Never proceed without explicit user decision

**Use the Scope Boundary Alert Template** (see DEVELOPMENT_FRAMEWORK.md lines 356-390)

**Why This Matters**: User stays in control of priorities. AI finds issues proactively but doesn't make scope decisions.

**New Collaborative Workflow** (two-phase approach):
