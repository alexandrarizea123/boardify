import { useMemo, useRef, useState } from 'react'

const getMentionContext = (value, caretPosition) => {
  const beforeCursor = value.slice(0, caretPosition)
  const atIndex = beforeCursor.lastIndexOf('@')
  if (atIndex < 0) return null
  if (atIndex > 0 && !/\s/.test(beforeCursor[atIndex - 1])) return null

  const query = beforeCursor.slice(atIndex + 1)
  if (!/^\w*$/.test(query)) return null

  return { start: atIndex, end: caretPosition, query }
}

function MentionTextarea({ value, onChange, users, placeholder, className }) {
  const textareaRef = useRef(null)
  const [caretPosition, setCaretPosition] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const context = useMemo(
    () => getMentionContext(value, caretPosition),
    [value, caretPosition],
  )
  const suggestions = useMemo(() => {
    if (!context) return []
    const query = context.query.toLowerCase()
    return users.filter((user) => user.toLowerCase().startsWith(query))
  }, [context, users])

  const contextKey = context ? `${context.start}:${context.query}` : null

  const safeActiveIndex =
    suggestions.length === 0
      ? 0
      : Math.min(activeIndex, suggestions.length - 1)

  const applySelection = (user) => {
    if (!context) return
    const prefix = value.slice(0, context.start)
    const suffix = value.slice(context.end)
    const nextValue = `${prefix}@${user} ${suffix}`
    const nextCaret = (prefix + `@${user} `).length

    onChange(nextValue)

    requestAnimationFrame(() => {
      if (!textareaRef.current) return
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(nextCaret, nextCaret)
      setCaretPosition(nextCaret)
    })
  }

  const handleChange = (event) => {
    const nextValue = event.target.value
    const nextCaret = event.target.selectionStart ?? nextValue.length
    const nextContext = getMentionContext(nextValue, nextCaret)
    const nextKey = nextContext
      ? `${nextContext.start}:${nextContext.query}`
      : null

    if (nextKey !== contextKey) {
      setActiveIndex(0)
    }

    onChange(nextValue)
    setCaretPosition(nextCaret)
  }

  const handleKeyDown = (event) => {
    if (!context || suggestions.length === 0) return

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % suggestions.length)
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) =>
        index === 0 ? suggestions.length - 1 : index - 1,
      )
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      event.preventDefault()
      applySelection(suggestions[safeActiveIndex])
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setActiveIndex(0)
    }
  }

  const handleCaretUpdate = (event) => {
    const nextCaret = event.target.selectionStart ?? value.length
    const nextContext = getMentionContext(value, nextCaret)
    const nextKey = nextContext
      ? `${nextContext.start}:${nextContext.query}`
      : null

    if (nextKey !== contextKey) {
      setActiveIndex(0)
    }

    setCaretPosition(nextCaret)
  }

  return (
    <div className="relative flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        className={className}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleCaretUpdate}
        onKeyUp={handleCaretUpdate}
        placeholder={placeholder}
      />
      {context && suggestions.length > 0 && (
        <div className="rounded-xl border border-[var(--color-tea-green-200)] bg-white p-1 text-xs shadow-sm">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--color-tea-green-600)]">
            Tag someone
          </div>
          <div className="flex flex-col gap-1">
            {suggestions.map((user, index) => (
              <button
                key={user}
                className={`rounded px-2 py-1 text-left text-xs ${
                  index === safeActiveIndex
                    ? 'bg-[var(--color-tea-green-100)] text-[var(--color-tea-green-900)]'
                    : 'text-[var(--color-tea-green-700)] hover:bg-[var(--color-tea-green-50)]'
                }`}
                type="button"
                onClick={() => applySelection(user)}
              >
                @{user}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MentionTextarea
