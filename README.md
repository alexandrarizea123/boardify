# Boardify

Boardify is a minimal task management board built with React + Vite and Tailwind CSS. It supports multiple boards (up to 3), custom columns, task creation, editing, and a progress indicator based on To Do vs Done.

## Features
- **Multiple Boards**: Create up to 3 boards with name and description.
- **Custom Columns**: Default columns (To Do, In Progress, Done) plus the ability to add your own.
- **Rich Task Creation**: Create tasks with name, description, assignee, type, priority, **difficulty**, and **estimated time**.
- **Task Summary**: Sidebar showing real-time counts of tasks by type.
- **Filtering**: Filter tasks by type (Feature, Bug, Chore, Research) per board.
- **Inline Editing**: Quick editing for task details and board names/descriptions.
- **Drag-and-Drop**: Move tasks between columns intuitively.
- **Progress Tracking**: Visual progress bar showing completion rate (Done vs To Do).
- **Mention Tagging**: `@` mention autocomplete in task descriptions for team members.
- **Responsive Design**: Fully compatible with desktop and mobile views, with an adaptive layout for different screen sizes and zoom levels.

## Project Structure
```
src/
  App.jsx
  components/
    board/
      BoardCreateForm.jsx
      BoardHeader.jsx
      BoardSwitcher.jsx
      Column.jsx
      ColumnForm.jsx
      ColumnList.jsx
      ProgressBar.jsx
      TaskCard.jsx
      TaskForm.jsx
      TaskSummary.jsx
      index.js
    mentions/
      MentionTextarea.jsx
  data/
    boardData.js
  hooks/
    useBoardState.js
  utils/
    date.js
```

## Key Files
- `src/hooks/useBoardState.js` — Central state manager for boards, columns, tasks, drafts, and actions.
- `src/components/board/*` — UI for the board, columns, tasks, and controls.
- `src/components/mentions/MentionTextarea.jsx` — `@` mention autocomplete for task descriptions.
- `src/data/boardData.js` — Shared constants (users, priorities, types, difficulties) and helpers.

## State Model
- **Board**: `{ id, name, description, columns[] }`
- **Column**: `{ id, name, tasks[] }`
- **Task**: `{ id, name, description, assignee, type, priority, difficulty, estimatedTime, createdAt, updatedAt }`

## Running the App
```
npm install
npm run dev
```

## Development Notes
- In-memory state only (no backend).
- Board limit is set to 3 in `useBoardState.js`.
- Mention autocomplete filters on `@` and supports keyboard navigation.
- Responsive layout uses CSS Grid and Flexbox with Tailwind's breakpoint system.