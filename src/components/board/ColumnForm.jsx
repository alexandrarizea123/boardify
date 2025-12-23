function ColumnForm({ value, onChange, onSubmit }) {
  return (
    <form
      className="flex flex-wrap items-end gap-3 rounded-2xl border border-[var(--color-tea-green-200)] bg-[var(--color-beige-50)] p-3"
      onSubmit={onSubmit}
    >
      <label className="flex-1 text-xs font-semibold uppercase tracking-wide text-[var(--color-tea-green-600)]">
        Add column
        <input
          className="mt-2 w-full rounded-xl border border-[var(--color-tea-green-200)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-tea-green-400)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Blocked"
        />
      </label>
      <button
        className="rounded-full border border-[var(--color-tea-green-700)] bg-[var(--color-tea-green-600)] px-4 py-2 text-sm font-semibold text-[var(--color-tea-green-50)]"
        type="submit"
      >
        Add column
      </button>
    </form>
  )
}

export default ColumnForm
