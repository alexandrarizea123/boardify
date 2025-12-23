function ColumnForm({ value, onChange, onSubmit }) {
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-white p-3"
      onSubmit={onSubmit}
    >
      <label className="flex-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
        Add column
        <input
          className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-300"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Blocked"
        />
      </label>
      <button
        className="rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900"
        type="submit"
      >
        Add column
      </button>
    </form>
  )
}

export default ColumnForm
