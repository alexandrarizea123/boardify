import crypto from 'crypto'
import pool from '../config/db.js'
import {
    hashPassword,
    hashToken,
    timingSafeEqualHex,
    PBKDF2_ITERATIONS,
} from '../utils/crypto.js'
import {
    normalizeEmail,
    emailLooksValid,
} from '../utils/validation.js'
import {
    AUTH_COOKIE_NAME,
    SESSION_TTL_DAYS,
    setAuthCookie,
    clearAuthCookie,
    parseCookies,
} from '../utils/cookies.js'
import { requestError } from '../utils/response.js'
import { getAuthenticatedUser } from '../middleware/auth.js'

const createSessionForUser = async (userId) => {
    const token = crypto.randomBytes(32).toString('base64url')
    const tokenHash = hashToken(token)
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)

    await pool.query(
        `INSERT INTO sessions (id, user_id, token_hash, expires_at) VALUES ($1, $2, $3, $4)`,
        [sessionId, userId, tokenHash, expiresAt.toISOString()],
    )

    return { token, expiresAt }
}

const claimCollaborativeInvitesForUser = async (user) => {
    const normalizedEmail = normalizeEmail(user?.email)
    if (!normalizedEmail) return

    const { rows } = await pool.query(
        `
      SELECT id, board_id
      FROM collaborative_board_invites
      WHERE email = $1 AND accepted_at IS NULL AND expires_at > NOW()
      ORDER BY created_at ASC
    `,
        [normalizedEmail],
    )

    if (rows.length === 0) return

    for (const invite of rows) {
        await pool.query(
            `
        INSERT INTO collaborative_board_members (board_id, user_id, role)
        VALUES ($1, $2, 'member')
        ON CONFLICT (board_id, user_id) DO NOTHING
      `,
            [invite.board_id, user.id],
        )
        await pool.query(
            `
        UPDATE collaborative_board_invites
        SET accepted_by = $2, accepted_at = NOW()
        WHERE id = $1 AND accepted_at IS NULL
      `,
            [invite.id, user.id],
        )
    }
}

export const me = async (req, res) => {
    try {
        const user = await getAuthenticatedUser(req)
        if (!user) return requestError(res, 401, 'Not authenticated')
        res.json({ user })
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body || {}
        const normalizedEmail = normalizeEmail(email)
        const trimmedName = typeof name === 'string' ? name.trim() : ''

        if (!normalizedEmail || !emailLooksValid(normalizedEmail)) {
            return requestError(res, 400, 'Invalid email')
        }
        if (!password || typeof password !== 'string' || password.length < 8) {
            return requestError(res, 400, 'Password must be at least 8 characters')
        }

        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [
            normalizedEmail,
        ])
        if (existing.rows.length > 0) {
            return requestError(res, 409, 'Email already in use')
        }

        const salt = crypto.randomBytes(16).toString('hex')
        const iterations = PBKDF2_ITERATIONS
        const passwordHash = await hashPassword(password, salt, iterations)
        const userId = crypto.randomUUID()

        await pool.query(
            `
        INSERT INTO users (id, name, email, password_hash, password_salt, password_iterations)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
            [userId, trimmedName || null, normalizedEmail, passwordHash, salt, iterations],
        )

        await claimCollaborativeInvitesForUser({
            id: userId,
            email: normalizedEmail,
        })

        const session = await createSessionForUser(userId)
        setAuthCookie(res, session.token, {
            maxAgeSeconds: SESSION_TTL_DAYS * 24 * 60 * 60,
        })

        res.status(201).json({
            user: { id: userId, name: trimmedName || null, email: normalizedEmail },
        })
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body || {}
        const normalizedEmail = normalizeEmail(email)
        if (!normalizedEmail || !emailLooksValid(normalizedEmail)) {
            return requestError(res, 400, 'Invalid email')
        }
        if (!password || typeof password !== 'string') {
            return requestError(res, 400, 'Invalid password')
        }

        const { rows } = await pool.query(
            `
        SELECT id, name, email, password_hash, password_salt, password_iterations
        FROM users
        WHERE email = $1
        LIMIT 1
      `,
            [normalizedEmail],
        )

        const userRow = rows[0]
        if (!userRow) return requestError(res, 401, 'Invalid email or password')

        const computedHash = await hashPassword(
            password,
            userRow.password_salt,
            userRow.password_iterations,
        )
        if (!timingSafeEqualHex(computedHash, userRow.password_hash)) {
            return requestError(res, 401, 'Invalid email or password')
        }

        await claimCollaborativeInvitesForUser({
            id: userRow.id,
            email: userRow.email,
        })

        const session = await createSessionForUser(userRow.id)
        setAuthCookie(res, session.token, {
            maxAgeSeconds: SESSION_TTL_DAYS * 24 * 60 * 60,
        })

        res.json({
            user: { id: userRow.id, name: userRow.name, email: userRow.email },
        })
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const logout = async (req, res) => {
    try {
        const cookies = req.headers.cookie ? parseCookies(req.headers.cookie) : {}
        const token = cookies[AUTH_COOKIE_NAME]
        if (token) {
            await pool.query('DELETE FROM sessions WHERE token_hash = $1', [
                hashToken(token),
            ])
        }
        clearAuthCookie(res)
        res.status(204).send()
    } catch (err) {
        requestError(res, 500, err.message)
    }
}
