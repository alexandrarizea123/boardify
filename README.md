# Boardify

Boardify is a minimal task management board built with React + Vite and Tailwind CSS. It supports multiple boards (up to 3), custom columns, task creation, editing, and a progress indicator based on To Do vs Done. It features optional backend persistence using PostgreSQL.

## Features
- **Multiple Boards**: Create up to 3 boards with name and description.
- **Persistent Storage**: Save boards and tasks to a PostgreSQL database (optional).
- **Custom Columns**: Default columns (To Do, In Progress, Done).
- **Rich Task Creation**: Create tasks with name, description, assignee, type, priority, **difficulty**, **estimated time**, due date, and subtasks.
- **Task Summary**: Sidebar showing real-time counts of tasks by type.
- **Filtering**: Filter tasks by type, assignee, priority, difficulty, and subtask presence.
- **Inline Editing**: Quick editing for task details and board names/descriptions.
- **Drag-and-Drop**: Move tasks between columns intuitively.
- **Progress Tracking**: Visual progress bar showing completion rate (Done vs To Do).
- **Subtask Progress**: Checklist-style subtasks with per-task completion progress.
- **Mention Tagging**: `@` mention autocomplete in task descriptions for team members.
- **Due Date Status**: Badges for overdue, due soon, and upcoming tasks.
- **Analytics Sidebar**: Task distribution, developer workload (estimated hours), and overdue trend chart.
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
    DeveloperHoursChart.jsx
    OverdueTrendChart.jsx
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
- **Task**: `{ id, name, description, assignee, type, priority, difficulty, estimatedTime, dueDate, subtasks, createdAt, updatedAt }`

## Running the App

### Frontend
```
npm install
npm run dev
```

### Backend (Optional)
The backend requires Docker (for PostgreSQL) and Node.js.

1. Navigate to the backend directory:
   ```
   cd boardify-backend
   ```
2. Start the database:
   ```
   docker-compose up -d
   ```
3. Install dependencies and start the server:
   ```
   npm install
   npm start
   ```

The frontend (running on port 5173 by default) is configured to communicate with the backend on `http://localhost:3000`.

## Development Notes
- **State Management**: The app uses `useBoardState.js` to manage state. It attempts to sync with the backend API on load and on every change. If the backend is unavailable, it may fall back to local state (though persistence is not guaranteed without the backend).
- **Board Limit**: Restricted to 3 boards in `useBoardState.js`.
- **Mentions**: Autocomplete filters on `@` and supports keyboard navigation.
- **Responsiveness**: Uses CSS Grid and Flexbox with Tailwind's breakpoint system.
