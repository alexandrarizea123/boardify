export const requestError = (res, status, message) => {
    res.status(status).json({ error: message })
}
