import express from 'express'
import pg from 'pg'
import cors from 'cors'

const { Pool } = pg

const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydb',
  password: 'mypassword',
  port: 5433,
})

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_types (
        name TEXT PRIMARY KEY
      );
    `)
    console.log('Database tables initialized successfully.')
  } catch (err) {
    console.error('Error initializing database tables:', err)
    process.exit(1)
  }
}

const app = express()
app.use(cors())
app.use(express.json({ limit: '2mb' }))

const PORT = 3000

const isValidBoardPayload = (board) => {
  return (
    board &&
    typeof board === 'object' &&
    typeof board.id === 'string' &&
    typeof board.name === 'string' &&
    Array.isArray(board.columns)
  )
}

const requestError = (res, status, message) => {
  res.status(status).json({ error: message })
}

app.get('/api/boards', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT data FROM boards ORDER BY created_at ASC',
    )
    res.json(rows.map((row) => row.data))
  } catch (err) {
    requestError(res, 500, err.message)
  }
})

app.get('/api/boards/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('SELECT data FROM boards WHERE id = $1', [
      id,
    ])
    if (rows.length === 0) {
      return requestError(res, 404, 'Board not found')
    }
    res.json(rows[0].data)
  } catch (err) {
    requestError(res, 500, err.message)
  }
})

app.post('/api/boards', async (req, res) => {
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
})

app.put('/api/boards/:id', async (req, res) => {
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
      'UPDATE boards SET data = $2, updated_at = NOW() WHERE id = $1',
      [id, board],
    )

    if (rowCount === 0) {
      return requestError(res, 404, 'Board not found')
    }

    res.json(board)
  } catch (err) {
    requestError(res, 500, err.message)
  }
})

app.delete('/api/boards/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rowCount } = await pool.query('DELETE FROM boards WHERE id = $1', [
      id,
    ])
    if (rowCount === 0) {
      return requestError(res, 404, 'Board not found')
    }
    res.status(204).send()
  } catch (err) {
    requestError(res, 500, err.message)
  }
})

app.get('/api/task-types', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT name FROM task_types ORDER BY name ASC',
    )
    res.json(rows.map((row) => row.name))
  } catch (err) {
    requestError(res, 500, err.message)
  }
})

app.post('/api/task-types', async (req, res) => {
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
})

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
