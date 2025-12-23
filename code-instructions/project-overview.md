# Task Management Board
## Overview
Build a task management board app where users can organize work across columns and track progress at a glance. The focus is on simple, fast task creation and intuitive movement between cards.

## Core Features
- Board creation with name, description, and default columns: To Do, In Progress, Done.
- Custom columns (cards) can be added per board.
- Task creation within any column with fields: name, description, assignee, created date, updated date, type (feature, bug, etc.), and priority (highest, high, medium, low).
- Drag or move tasks between columns.
- Progress bar at the bottom shows Done tasks out of total To Do tasks.

## Data Model (Front-End Only)
- Board: id, name, description, columns[]
- Column: id, name, tasks[]
- Task: id, name, description, assignee, createdAt, updatedAt, type, priority

## UI Outline
- Header: board title + description.
- Main: columns laid out horizontally with tasks listed inside.
- Footer: progress bar with count and percentage.

## Styling
- Minimal, clean styling with limited colors.
- Tailwind CSS for all UI styling.

## Backend
- No backend work for now; use in-memory state only.
