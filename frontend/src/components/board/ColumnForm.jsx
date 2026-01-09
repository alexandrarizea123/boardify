function ColumnForm({ value, onChange, onSubmit }) {
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200/60"
      onSubmit={onSubmit}
    >
      <label className="flex-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Add column
        <input
          className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Blocked"
        />
      </label>
      <button
        className="rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-200"
        type="submit"
      >
        Add column
      </button>
    </form>
  )
}

export default ColumnForm
