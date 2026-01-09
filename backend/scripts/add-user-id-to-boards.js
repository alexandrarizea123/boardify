import pool from '../src/config/db.js'

const migrate = async () => {
    try {
        console.log('Adding user_id column to boards table...')
        await pool.query(`
      ALTER TABLE boards
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    `)
        console.log('Successfully added user_id column.')
    } catch (err) {
        console.error('Error migrating database:', err)
    } finally {
        await pool.end()
    }
}

migrate()
