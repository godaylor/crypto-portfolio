# Project Structure

## Purpose

This document describes how the project is organized and the principles behind its structure.

The goal is not to document every folder, but to explain how the project should be organized as it evolves.

A good project structure makes the code easy to navigate, maintain, and extend.

---

# General Principles

- Keep the project structure simple.
- Organize files by responsibility, not by size.
- Avoid unnecessary nesting.
- Do not introduce new folders before they are needed.
- Prefer clarity over theoretical architecture.
- Let the structure evolve naturally with the project.

---

# Root Structure

```text
project/
├── docs/
├── public/
├── src/
├── package.json
├── README.md
└── ...
```

Each top-level folder should have a single, clear responsibility.

---

# Folder Responsibilities

## docs/

Contains project documentation.

Examples:

- AI_RULES.md
- NAMING_GUIDE.md
- PROJECT_STRUCTURE.md

Documentation should describe project decisions and conventions rather than duplicate code.

---

## public/

Contains static files served directly by the application.

Examples:

- favicon
- static images
- other public assets

---

## src/

Contains the application source code.

All React components, business logic, and application behavior belong here.

---

## Other Folders

As the project grows, additional folders may appear.

Each new folder should exist for a clear reason and have a single responsibility.

Examples include:

- `components`
- `utils`
- `context`
- `api`

These folders are examples, not mandatory parts of every project.

---

# Component Philosophy

Each component should have one clear responsibility.

A component should solve one problem well rather than several unrelated ones.

When a component becomes difficult to understand or has multiple responsibilities, consider splitting it into smaller components.

---

# Adding New Files and Folders

Before creating a new file or folder, ask yourself:

- Does it have a clear responsibility?
- Will it improve project organization?
- Is it needed now?
- Will it make navigation easier?

If the answer is "no", keep the existing structure.

Avoid creating folders for future possibilities.

---

# Project Evolution

The project structure should evolve step by step.

Do not design the architecture for features that do not exist yet.

When the project grows, reorganize the structure only if it makes the project easier to understand and maintain.

Every structural change should have a clear benefit.

---

# Final Rule

The purpose of the project structure is to help developers find code quickly.

If a new folder, file, or architectural decision makes the project harder to understand, reconsider whether it should exist.

A simple and consistent structure is better than a complex one that tries to anticipate every future need.
