---
description: Start brainstorming session with user-provided topics
---

You are executing the `/flow-brainstorm-start` command from the Flow framework.

**Purpose**: Begin a brainstorming session for the current iteration with subjects provided by the user.

**🔴 REQUIRED: Read Framework Quick Reference First**
- **Read once per session**: DEVELOPMENT_FRAMEWORK.md lines 1-544 (Quick Reference section) - if not already in context from earlier in session, read it now
- **Focus on**: Subject Resolution Types (lines 108-128), Common Patterns (lines 134-207)
- **Deep dive if needed**: Read lines 1531-2156 for complete Brainstorming Pattern using Read(offset=1531, limit=625)

**Framework Reference**: This command requires framework knowledge to structure brainstorming session correctly. See Quick Reference guide above for essential patterns.

**Signature**: `/flow-brainstorm-start [optional: free-form text describing topics to discuss]`

**Context**:
- **Framework Guide**: DEVELOPMENT_FRAMEWORK.md (auto-locate in `.claude/`, project root, or `~/.claude/flow/`)
- **Working File**: .flow/PLAN.md (current project)
- **Framework Pattern**: See "Brainstorming Session Pattern" section in framework guide

**🚨 SCOPE BOUNDARY RULE** (CRITICAL - see DEVELOPMENT_FRAMEWORK.md lines 339-540):

If you discover NEW issues during brainstorming that are NOT part of the current iteration:

1. **STOP** immediately - Don't make assumptions or proceed
2. **NOTIFY** user - Present discovered issue(s) with structured analysis
3. **DISCUSS** - Provide structured options (A/B/C/D format):
   - **A**: Create pre-implementation task (< 30 min work, blocking)
   - **B**: Add as new brainstorming subject (design needed)
   - **C**: Handle immediately (only if user approves)
   - **D**: Defer to separate iteration (after current work)
4. **AWAIT USER APPROVAL** - Never proceed without explicit user decision

**Use the Scope Boundary Alert Template** (see DEVELOPMENT_FRAMEWORK.md lines 356-390)

**Why This Matters**: User stays in control of priorities, AI finds issues proactively but doesn't make scope decisions

**Instructions**:

1. **Find .flow/PLAN.md**: Look for .flow/PLAN.md (primary location: .flow/ directory)

2. **Find current iteration**: Look for last iteration marked ⏳ or 🚧

3. **Determine mode** (two modes available):

   **MODE 1: With Argument** (user provides topics in command)
   - User provided topics in `$ARGUMENTS` (free-form text)
   - Parse the user's input and extract individual subjects
   - User controls WHAT to brainstorm, AI structures HOW
   - Example: `/flow-brainstorm-start "API design, database schema, auth flow, error handling"`
   - AI extracts: [API design, database schema, auth flow, error handling]
   - **Proceed to step 4**

   **MODE 2: Without Argument** (interactive) ⚠️ CRITICAL
   - **NO arguments provided** by user
   - **DO NOT** auto-generate subjects from task description
   - **DO NOT** read PLAN.md and invent subjects automatically
   - **DO NOT** proceed to create brainstorming section yet
   - **STOP and ask the user**:

     Example prompt to user:
     ```
     I'll start a brainstorming session for [Task/Iteration Name].

     **What subjects would you like to discuss?**

     You can provide:
     - Comma-separated topics: "API design, database, auth"
     - Free-form text describing areas to explore
     - Bullet list of specific topics

     Based on the task scope, here are some suggestions:
     - [Suggestion 1 based on task description]
     - [Suggestion 2 based on task description]
     - [Suggestion 3 based on task description]

     Please provide the topics you'd like to brainstorm.
     ```

   - **WAIT for user response** - do NOT proceed without it
   - **After user responds**, extract subjects from their response
   - **Then proceed to step 4**

4. **Extract subjects from user input** (ONLY after user provides topics):
   - Parse natural language text from user's input
   - Identify distinct topics/subjects (comma-separated, "and", bullet points, etc.)
   - Create numbered list
   - Handle 1 to 100+ topics gracefully
   - If ambiguous, ask user for clarification

5. **Update iteration status**: Change to 🚧 IN PROGRESS (Brainstorming)

6. **Create brainstorming section**:
   ```markdown
   ### **Brainstorming Session - [Brief description from user input]**

   **Focus**: [Summarize the main goal based on subjects]

   **Subjects to Discuss** (tackle one at a time):

   1. ⏳ **[Subject 1]** - [Brief description if needed]
   2. ⏳ **[Subject 2]** - [Brief description if needed]
   3. ⏳ **[Subject 3]** - [Brief description if needed]
   ...

   **Resolved Subjects**:

   ---
