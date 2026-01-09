import pool from '../config/db.js'
import { isValidBoardPayload } from '../utils/validation.js'
import { requestError } from '../utils/response.js'

export const getBoards = async (_req, res) => {
    try {
        const { rows } = await pool.query(
            `
        SELECT b.data
        FROM boards b
        LEFT JOIN collaborative_boards cb ON cb.board_id = b.id
        WHERE cb.board_id IS NULL
        ORDER BY b.created_at ASC
      `,
        )
        res.json(rows.map((row) => row.data))
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const getBoard = async (req, res) => {
    try {
        const { id } = req.params
        const { rows } = await pool.query(
            `
        SELECT b.data
        FROM boards b
        LEFT JOIN collaborative_boards cb ON cb.board_id = b.id
        WHERE b.id = $1 AND cb.board_id IS NULL
      `,
            [id],
        )
        if (rows.length === 0) {
            return requestError(res, 404, 'Board not found')
        }
        res.json(rows[0].data)
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const createBoard = async (req, res) => {
    try {
        const board = req.body
        if (!isValidBoardPayload(board)) {
            return requestError(res, 400, 'Invalid board payload')
        }

        const { rowCount } = await pool.query(
            'INSERT INTO boards (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
            [board.id, board],
        )

        if (rowCount === 0) {
            return requestError(res, 409, 'Board already exists')
        }

        res.status(201).json(board)
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const updateBoard = async (req, res) => {
    try {
        const board = req.body
        if (!isValidBoardPayload(board)) {
            return requestError(res, 400, 'Invalid board payload')
        }

        const { id } = req.params
        if (board.id !== id) {
            return requestError(res, 400, 'Board id mismatch')
        }

        const { rowCount } = await pool.query(
            `
        UPDATE boards
        SET data = $2, updated_at = NOW()
        WHERE id = $1 AND id NOT IN (SELECT board_id FROM collaborative_boards)
      `,
            [id, board],
        )

        if (rowCount === 0) {
            return requestError(res, 404, 'Board not found')
        }

        res.json(board)
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const deleteBoard = async (req, res) => {
    try {
        const { id } = req.params
        const { rowCount } = await pool.query(
            `
        DELETE FROM boards
        WHERE id = $1 AND id NOT IN (SELECT board_id FROM collaborative_boards)
      `,
            [id],
        )
        if (rowCount === 0) {
            return requestError(res, 404, 'Board not found')
        }
        res.status(204).send()
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const getTaskTypes = async (_req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT name FROM task_types ORDER BY name ASC',
        )
        res.json(rows.map((row) => row.name))
    } catch (err) {
        requestError(res, 500, err.message)
    }
}

export const createTaskType = async (req, res) => {
    try {
        const { name } = req.body || {}
        if (!name || typeof name !== 'string') {
            return requestError(res, 400, 'Invalid task type')
        }

        const trimmed = name.trim()
        if (!trimmed) {
            return requestError(res, 400, 'Invalid task type')
        }

        const { rowCount } = await pool.query(
            'INSERT INTO task_types (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [trimmed],
        )

        res.status(rowCount === 0 ? 200 : 201).json({ name: trimmed })
    } catch (err) {
        requestError(res, 500, err.message)
    }
}
