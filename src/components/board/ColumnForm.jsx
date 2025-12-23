function ColumnForm({ value, onChange, onSubmit }) {
  return (
    <form
      className="flex flex-wrap items-end gap-3 border border-slate-200 p-4"
      onSubmit={onSubmit}
    >
      <label className="flex-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Add column
        <input
          className="mt-2 w-full border border-slate-200 px-3 py-2 text-sm outline-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Blocked"
        />
      </label>
      <button
        className="border border-slate-900 px-4 py-2 text-sm font-semibold"
        type="submit"
      >
        Add column
      </button>
    </form>
  )
}

export default ColumnForm
