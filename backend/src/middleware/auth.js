import pool from '../config/db.js'
import { hashToken } from '../utils/crypto.js'
import { parseCookies, AUTH_COOKIE_NAME } from '../utils/cookies.js'
import { requestError } from '../utils/response.js'

export const getAuthenticatedUser = async (req) => {
    const cookies = parseCookies(req.headers.cookie)
    const token = cookies[AUTH_COOKIE_NAME]
    if (!token) return null

    const hashed = hashToken(token)
    const { rows } = await pool.query(
        `
      SELECT u.id, u.name, u.email
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > NOW()
      LIMIT 1
    `,
        [hashed],
    )

    return rows[0] ?? null
}

export const requireAuthenticatedUser = async (req, res) => {
    const user = await getAuthenticatedUser(req)
    if (!user) {
        requestError(res, 401, 'Not authenticated')
        return null
    }
    return user
}

export const requireCollaborativeBoardMembership = async (boardId, userId) => {
    const { rows } = await pool.query(
        `
      SELECT m.role
      FROM collaborative_board_members m
      JOIN collaborative_boards cb ON cb.board_id = m.board_id
      WHERE m.board_id = $1 AND m.user_id = $2
      LIMIT 1
    `,
        [boardId, userId],
    )
    return rows[0] ?? null
}

export const ensureCollaborativeBoardAdmin = async (boardId, userId) => {
    const membership = await requireCollaborativeBoardMembership(boardId, userId)
    if (membership?.role === 'admin') return membership

    const { rows } = await pool.query(
        `
      SELECT created_by
      FROM collaborative_boards
      WHERE board_id = $1
      LIMIT 1
    `,
        [boardId],
    )
    if (rows[0]?.created_by !== userId) return membership

    await pool.query(
        `
      INSERT INTO collaborative_board_members (board_id, user_id, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (board_id, user_id) DO UPDATE SET role = EXCLUDED.role
    `,
        [boardId, userId],
    )

    return { role: 'admin' }
}
