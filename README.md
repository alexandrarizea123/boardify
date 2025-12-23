# Boardify

Boardify is a minimal task management board built with React + Vite and Tailwind CSS. It supports multiple boards (up to 3), custom columns, task creation, editing, and a progress indicator based on To Do vs Done.

## Features
- Create up to 3 boards with name and description.
- Default columns: To Do, In Progress, Done.
- Add custom columns per board.
- Create tasks with name, description, assignee, type, and priority.
- Edit tasks inline.
- Move tasks between columns with drag-and-drop.
- Delete tasks, columns, and boards.
- Progress bar showing Done out of To Do.
- Mention tagging in task descriptions using `@` with autocomplete.

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
- `src/data/boardData.js` — Shared constants (users, priorities, types) and helpers.

## State Model
- **Board**: `{ id, name, description, columns[] }`
- **Column**: `{ id, name, tasks[] }`
- **Task**: `{ id, name, description, assignee, type, priority, createdAt, updatedAt }`

## Running the App
```
npm install
npm run dev
```

## Development Notes
- In-memory state only (no backend).
- Board limit is set to 3 in `useBoardState.js`.
- Mention autocomplete filters on `@` and supports keyboard navigation.
