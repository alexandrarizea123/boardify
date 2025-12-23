# Feature Ideas for Boardify

Here is a list of potential "nice-to-have" features to enhance the Boardify application, categorized by area of impact.

## 💾 Persistence & Data Management
- **LocalStorage Persistence**: Save board state to the browser's local storage so data isn't lost on refresh.
- **Export/Import**: Allow users to download their board as a JSON file and upload it to restore state or share with others.
- **Undo/Redo**: Implement a history stack to revert accidental deletions or moves.

## ✅ Task Enhancements
- **Due Dates**: Add a date picker for deadlines. Highlight tasks that are overdue (red) or due soon (yellow).
- **Subtasks**: Allow breaking down a task into smaller checklist items (e.g., "0/3 done").
- **Custom Tags**: Beyond standard "Types", allow users to create custom colored labels (e.g., "Frontend", "Q3 Goals").
- **Comments**: Add a comment section to tasks for (simulated) team collaboration.
- **Markdown Support**: Render markdown in task descriptions for bolding, lists, and links.

## 📋 Board & Column Features
- **WIP Limits**: Set a maximum number of tasks per column (e.g., max 3 in "In Progress") and visually warn when exceeded.
- **Column Reordering**: Allow dragging and dropping columns to change their order.
- **Swimlanes**: Group tasks horizontally by assignee or priority.
- **Dark Mode**: A toggle to switch the UI to a dark theme.

## 📊 Analytics & Views
- **Advanced Filtering**: Filter tasks by Assignee, Priority, or text search (currently only filters by Type).
- **Burndown Chart**: Visualize remaining work over time.
- **"My Tasks" View**: A personalized view showing only tasks assigned to the current user across all columns.

## ⌨️ Accessibility & UX
- **Keyboard Shortcuts**: Press `n` for new task, `/` to search, `esc` to close modals.
- **Drag & Drop Animation**: Add smoother animations when dropping cards.
- **Confetti on Completion**: Trigger a confetti animation when a task is moved to the "Done" column.
