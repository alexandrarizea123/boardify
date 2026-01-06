import express from 'express'
import pg from 'pg'
import cors from 'cors'
import crypto from 'crypto'

const { Pool } = pg

const pool =
  process.env.DATABASE_URL
    ? new Pool({ connectionString: process.env.DATABASE_URL })
    : new Pool({
        user: process.env.PGUSER || 'myuser',
        host: process.env.PGHOST || 'localhost',
        database: process.env.PGDATABASE || 'mydb',
        password: process.env.PGPASSWORD || 'mypassword',
        port: Number(process.env.PGPORT) || 5433,
      })

pool.on('error', (err) => {
  console.error('Unexpected database error', err)
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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL,
        password_iterations INT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
      );
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collaborative_boards (
        board_id TEXT PRIMARY KEY REFERENCES boards(id) ON DELETE CASCADE,
        created_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collaborative_board_members (
        board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (board_id, user_id)
      );
    `)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS collaborative_board_invites (
        id TEXT PRIMARY KEY,
        board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        invited_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        accepted_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        accepted_at TIMESTAMPTZ
      );
    `)
    console.log('Database tables initialized successfully.')
  } catch (err) {
    console.error('Error initializing database tables:', err)
    process.exit(1)
  }
}

const app = express()
const parseCorsOrigins = (value) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const configuredOrigins = parseCorsOrigins(process.env.CORS_ORIGIN)
const allowAllOrigins = configuredOrigins.includes('*')
const corsOrigins =
  allowAllOrigins || configuredOrigins.length > 0
    ? configuredOrigins.filter((origin) => origin !== '*')
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://0.0.0.0:5173']

app.use(
  cors(
    allowAllOrigins
      ? { origin: true, credentials: true }
      : {
          credentials: true,
          origin: (origin, callback) => {
            if (!origin) return callback(null, true)
            if (corsOrigins.includes(origin)) return callback(null, true)
            return callback(new Error(`Not allowed by CORS: ${origin}`))
          },
        },
  ),
)
app.use(express.json({ limit: '2mb' }))

const PORT = Number(process.env.PORT) || 3000

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

const AUTH_COOKIE_NAME = 'boardify_session'
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS) || 14
const PBKDF2_ITERATIONS = Number(process.env.PBKDF2_ITERATIONS) || 150_000
const PBKDF2_DIGEST = 'sha256'
const PBKDF2_KEYLEN = 32

const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

const emailLooksValid = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex')

const INVITE_TTL_DAYS = Number(process.env.COLLAB_INVITE_TTL_DAYS) || 7

const hashPassword = async (password, salt, iterations) =>
  new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      iterations,
      PBKDF2_KEYLEN,
      PBKDF2_DIGEST,
      (err, derivedKey) => {
        if (err) return reject(err)
        resolve(derivedKey.toString('hex'))
      },
    )
  })

const timingSafeEqualHex = (a, b) => {
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex'))
  } catch {
    return false
  }
}

const parseCookies = (header) => {
  const input = String(header || '')
  if (!input) return {}
  return input.split(';').reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split('=')
    if (!rawKey) return acc
    acc[rawKey] = decodeURIComponent(rest.join('=') || '')
    return acc
  }, {})
}

const serializeCookie = (name, value, options = {}) => {
  const segments = [`${name}=${encodeURIComponent(value)}`]
  if (options.maxAge != null) segments.push(`Max-Age=${options.maxAge}`)
  if (options.path) segments.push(`Path=${options.path}`)
  if (options.httpOnly) segments.push('HttpOnly')
  if (options.secure) segments.push('Secure')
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`)
  return segments.join('; ')
}

const setAuthCookie = (res, token, { maxAgeSeconds } = {}) => {
  const isProd = process.env.NODE_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    serializeCookie(AUTH_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: isProd,
      maxAge: maxAgeSeconds,
    }),
  )
}

const clearAuthCookie = (res) => {
  res.setHeader(
    'Set-Cookie',
    serializeCookie(AUTH_COOKIE_NAME, '', {
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    }),
  )
}

const getAuthenticatedUser = async (req) => {
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

const requireAuthenticatedUser = async (req, res) => {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    requestError(res, 401, 'Not authenticated')
    return null
  }
  return user
}

const requireCollaborativeBoardMembership = async (boardId, userId) => {
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

const ensureCollaborativeBoardAdmin = async (boardId, userId) => {
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

const buildCollaborativeDefaultColumns = () => [
  { id: crypto.randomUUID(), name: 'To Do', tasks: [] },
  { id: crypto.randomUUID(), name: 'In Progress', tasks: [] },
  { id: crypto.randomUUID(), name: 'In Testing', tasks: [] },
  { id: crypto.randomUUID(), name: 'Ready to Deploy', tasks: [] },
  { id: crypto.randomUUID(), name: 'Done', tasks: [] },
]

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

app.get('/api/auth/me', async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req)
    if (!user) return requestError(res, 401, 'Not authenticated')
    res.json({ user })
  } catch (err) {
    requestError(res, 500, err.message)
  }
})

app.post('/api/auth/signup', async (req, res) => {
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
})

app.post('/api/auth/login', async (req, res) => {
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
})

app.post('/api/auth/logout', async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie)
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
})

app.get('/api/collab-boards', async (req, res) => {
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
})

app.post('/api/collab-boards', async (req, res) => {
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
})

app.get('/api/collab-boards/:id', async (req, res) => {
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
})

app.put('/api/collab-boards/:id', async (req, res) => {
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
})

app.delete('/api/collab-boards/:id', async (req, res) => {
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
})

app.post('/api/collab-boards/:id/invite', async (req, res) => {
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
})

app.post('/api/collab-invites/accept', async (req, res) => {
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
      return requestError(res, 403, 'Invite email does not match user')
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
})

app.get('/api/boards', async (_req, res) => {
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
})

app.get('/api/boards/:id', async (req, res) => {
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
})

app.delete('/api/boards/:id', async (req, res) => {
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
