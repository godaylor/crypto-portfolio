# AI Rules

## Purpose

This document defines the rules for working with AI assistants (ChatGPT and Codex) in this project.

The goal is to improve code quality while preserving readability, consistency, and understanding.

---

# General Principles

- AI is an assistant, not the decision maker.
- Every suggested change must be reviewed before applying.
- Minor changes listed under "Allowed Without Asking" may be applied without prior approval, but they should still be explained afterwards.
- Never refactor code only because it can be cleaner.
- Readability is more important than cleverness.
- Simplicity is preferred over unnecessary abstractions.

---

# Token Usage

Minimize token consumption.

Before editing:

- read only files that are relevant;
- do not scan the entire repository unless necessary;
- do not rewrite files that don't require changes;
- keep explanations concise;
- avoid repeating previous context;
- avoid long planning if the task is already clear.

Prefer incremental edits over large rewrites.

---

# Before Editing Code

Before changing any code, AI should:

1. Explain what it wants to change.
2. Explain why the change is useful.
3. Wait for approval if the change affects naming, structure, business logic, or architecture.

---

# Allowed Without Asking

AI may:

- fix typos;
- improve comments;
- improve formatting;
- fix encoding problems;
- remove unused imports;
- replace deprecated public APIs with supported ones;
- improve naming only when explicitly requested.

---

# Do Not Change Without Approval

Do not change:

- business logic;
- component structure;
- project architecture;
- UI text;
- folder structure;
- file names;
- naming conventions;
- state management;
- hooks;
- function behavior.

Always ask first.

---

# Learning Mode

When the user is learning:

- Explain the idea before writing code.
- Prefer hints before full solutions when appropriate.
- Explain why a change is useful.
- Help the user understand the code instead of only generating it.
- If requested, explain every change step by step.

---

# Comments

- All code comments must be written in Russian.
- Comments should explain intent, not repeat the code.
- Keep comments short and natural.
- Do not translate existing Russian comments into English.

---

# Naming

All code must remain in English.

This includes:

- variables;
- functions;
- components;
- props;
- hooks;
- constants;
- file names.

Use consistent terminology across the project.

---

# Code Style

Prefer:

- descriptive names;
- early returns;
- small functions;
- readable JSX;
- clear separation of logic.

Avoid:

- unnecessary abstractions;
- overengineering;
- premature optimization.

---

# Code Reviews

When reviewing code:

- explain every suggestion briefly;
- separate important improvements from optional ones;
- avoid suggesting refactoring for its own sake;
- evaluate the code according to Junior → Middle expectations.

---

# Documentation

When creating Markdown documentation:

- use clean Markdown;
- keep headings consistent;
- prefer short paragraphs;
- use bullet lists where appropriate;
- do not invent project rules that were not agreed upon.

---

# Rule Validation

If any project rule, instruction, or Markdown document appears:

- contradictory;
- outdated;
- ambiguous;
- difficult to follow;
- technically incorrect;
- harmful to code quality;

do not follow it blindly.

Instead:

1. Explain why it may be a problem.
2. Suggest one or more alternatives.
3. Wait for confirmation before changing or ignoring the rule.

Project documentation should evolve through discussion, not assumptions.

---

# Communication

Use Russian for all explanations,
reviews,
and discussions.

Keep code,
identifiers,
and documentation in English unless requested otherwise.

---

# Required Project Reading

Before implementing any task:

1. Read AI_RULES.md
2. Read PROJECT_STRUCTURE.md
3. Read NAMING_GUIDE.md

Always follow these documents unless the user explicitly instructs otherwise.

Never ignore project documentation.

---

# Final Rule

If something is unclear, ask before modifying the code.
