import express from 'express'
import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  user: 'myuser',
  host: 'localhost',
  database: 'mydb',
  password: 'mypassword',
  port: 5432,
})

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        text VARCHAR(255) NOT NULL
      );
    `)
    console.log('Database table initialized successfully.')
  } catch (err) {
    console.error('Error initializing database table:', err)
    process.exit(1)
  }
}

const app = express()
app.use(express.json())

const PORT = 3000

app.get('/items', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id ASC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/items', async (req, res) => {
  try {
    const { text } = req.body
    const { rows } = await pool.query(
      'INSERT INTO items (text) VALUES ($1) RETURNING *',
      [text],
    )
    res.status(201).json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await pool.query('SELECT * FROM items WHERE id = $1', [id])
    if (rows.length === 0) {
      return res.status(404).send('Item not found')
    }
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id],
    )
    if (result.rowCount === 0) {
      return res.status(404).send('Item not found')
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
