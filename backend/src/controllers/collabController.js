import crypto from 'crypto'
import pool from '../config/db.js'
import { isValidBoardPayload, normalizeEmail, emailLooksValid } from '../utils/validation.js'
import { requestError } from '../utils/response.js'
import { hashToken } from '../utils/crypto.js'
import {
    requireAuthenticatedUser,
    requireCollaborativeBoardMembership,
    ensureCollaborativeBoardAdmin
} from '../middleware/auth.js'

const INVITE_TTL_DAYS = Number(process.env.COLLAB_INVITE_TTL_DAYS) || 7

const buildCollaborativeDefaultColumns = () => [
    { id: crypto.randomUUID(), name: 'To Do', tasks: [] },
    { id: crypto.randomUUID(), name: 'In Progress', tasks: [] },
    { id: crypto.randomUUID(), name: 'In Testing', tasks: [] },
    { id: crypto.randomUUID(), name: 'Ready to Deploy', tasks: [] },
    { id: crypto.randomUUID(), name: 'Done', tasks: [] },
]

export const getCollabBoards = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const { rows } = await pool.query(
            `
        SELECT b.data, m.role
        FROM collaborative_board_members m
        JOIN collaborative_boards cb ON cb.board_id = m.board_id
        JOIN boards b ON b.id = m.board_id
        WHERE m.user_id = $1
        ORDER BY b.created_at ASC
      `,
            [user.id],
        )

        res.json(
            rows.map((row) => ({
                ...(row.data || {}),
                _collabRole: row.role,
            })),
        )
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const createCollabBoard = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const { name, description } = req.body || {}
        const trimmedName = typeof name === 'string' ? name.trim() : ''
        const trimmedDescription =
            typeof description === 'string' ? description.trim() : ''

        if (!trimmedName) return requestError(res, 400, 'Board name is required')

        const board = {
            id: crypto.randomUUID(),
            name: trimmedName,
            description: trimmedDescription,
            columns: buildCollaborativeDefaultColumns(),
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            await client.query('INSERT INTO boards (id, data) VALUES ($1, $2)', [
                board.id,
                board,
            ])
            await client.query(
                'INSERT INTO collaborative_boards (board_id, created_by) VALUES ($1, $2)',
                [board.id, user.id],
            )
            await client.query(
                `
          INSERT INTO collaborative_board_members (board_id, user_id, role)
          VALUES ($1, $2, 'admin')
          ON CONFLICT (board_id, user_id) DO UPDATE SET role = EXCLUDED.role
        `,
                [board.id, user.id],
            )
            await client.query('COMMIT')
        } catch (err) {
            try {
                await client.query('ROLLBACK')
            } catch {
                // ignore
            }
            throw err
        } finally {
            client.release()
        }

        res.status(201).json(board)
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const getCollabBoard = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const { id } = req.params
        const membership = await requireCollaborativeBoardMembership(id, user.id)
        if (!membership) return requestError(res, 403, 'Forbidden')

        const { rows } = await pool.query('SELECT data FROM boards WHERE id = $1', [
            id,
        ])
        if (rows.length === 0) return requestError(res, 404, 'Board not found')

        res.json(rows[0].data)
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const updateCollabBoard = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const board = req.body
        if (!isValidBoardPayload(board)) {
            return requestError(res, 400, 'Invalid board payload')
        }

        const { id } = req.params
        if (board.id !== id) {
            return requestError(res, 400, 'Board id mismatch')
        }

        const membership = await requireCollaborativeBoardMembership(id, user.id)
        if (!membership) return requestError(res, 403, 'Forbidden')

        const { rowCount } = await pool.query(
            'UPDATE boards SET data = $2, updated_at = NOW() WHERE id = $1',
            [id, board],
        )
        if (rowCount === 0) return requestError(res, 404, 'Board not found')

        res.json(board)
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const deleteCollabBoard = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const { id } = req.params
        const membership = await ensureCollaborativeBoardAdmin(id, user.id)
        if (!membership || membership.role !== 'admin') {
            return requestError(res, 403, 'Forbidden')
        }

        const { rowCount } = await pool.query('DELETE FROM boards WHERE id = $1', [
            id,
        ])
        if (rowCount === 0) return requestError(res, 404, 'Board not found')
        res.status(204).send()
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const inviteToCollabBoard = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const { id } = req.params
        const membership = await ensureCollaborativeBoardAdmin(id, user.id)
        if (!membership || membership.role !== 'admin') {
            return requestError(
                res,
                403,
                `Forbidden: requires admin (your role: ${membership?.role ?? 'none'})`,
            )
        }

        const normalizedEmail = normalizeEmail(req.body?.email)
        if (!normalizedEmail || !emailLooksValid(normalizedEmail)) {
            return requestError(res, 400, 'Invalid email')
        }

        const { rows: userRows } = await pool.query(
            'SELECT id FROM users WHERE email = $1 LIMIT 1',
            [normalizedEmail],
        )
        const targetUser = userRows[0] ?? null

        if (targetUser) {
            await pool.query(
                `
          INSERT INTO collaborative_board_members (board_id, user_id, role)
          VALUES ($1, $2, 'member')
          ON CONFLICT (board_id, user_id) DO NOTHING
        `,
                [id, targetUser.id],
            )
            return res.status(201).json({
                boardId: id,
                invitedEmail: normalizedEmail,
                status: 'member-added',
            })
        }

        const token = crypto.randomBytes(32).toString('base64url')
        const tokenHash = hashToken(token)
        const inviteId = crypto.randomUUID()
        const expiresAt = new Date(
            Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString()

        await pool.query(
            `
        INSERT INTO collaborative_board_invites (
          id, board_id, email, token_hash, invited_by, expires_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
            [inviteId, id, normalizedEmail, tokenHash, user.id, expiresAt],
        )

        res.status(201).json({
            boardId: id,
            invitedEmail: normalizedEmail,
            status: 'invite-created',
            inviteToken: token,
            expiresAt,
        })
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const acceptCollabInvite = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const token = String(req.body?.token || '')
        if (!token) return requestError(res, 400, 'Invite token is required')

        const tokenHash = hashToken(token)
        const { rows } = await pool.query(
            `
        SELECT id, board_id, email
        FROM collaborative_board_invites
        WHERE token_hash = $1 AND accepted_at IS NULL AND expires_at > NOW()
        LIMIT 1
      `,
            [tokenHash],
        )

        const invite = rows[0]
        if (!invite) return requestError(res, 404, 'Invite not found')

        if (normalizeEmail(invite.email) !== normalizeEmail(user.email)) {
            requestError(res, 403, 'Invite email does not match user')
            return
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            await client.query(
                `
          INSERT INTO collaborative_board_members (board_id, user_id, role)
          VALUES ($1, $2, 'member')
          ON CONFLICT (board_id, user_id) DO NOTHING
        `,
                [invite.board_id, user.id],
            )
            await client.query(
                `
          UPDATE collaborative_board_invites
          SET accepted_by = $2, accepted_at = NOW()
          WHERE id = $1 AND accepted_at IS NULL
        `,
                [invite.id, user.id],
            )
            await client.query('COMMIT')
        } catch (err) {
            try {
                await client.query('ROLLBACK')
            } catch {
                // ignore
            }
            throw err
        } finally {
            client.release()
        }

        res.json({ boardId: invite.board_id })
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const getCollabBoardMembers = async (req, res) => {
    try {
        const user = await requireAuthenticatedUser(req, res)
        if (!user) return

        const { id } = req.params
        const membership = await requireCollaborativeBoardMembership(id, user.id)
        if (!membership) return requestError(res, 403, 'Forbidden')

        const { rows } = await pool.query(
            `
        SELECT u.email, u.name, m.role
        FROM collaborative_board_members m
        JOIN users u ON u.id = m.user_id
        WHERE m.board_id = $1
        ORDER BY u.email ASC
      `,
            [id],
        )

        res.json(rows)
    } catch (err) {
        requestError(res, 500, err.message)
    }
}
