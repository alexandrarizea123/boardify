export const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

export const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

export const isValidBoardPayload = (board) => {
    return (
        board &&
        typeof board === 'object' &&
        typeof board.id === 'string' &&
        typeof board.name === 'string' &&
        Array.isArray(board.columns)
    )
}
