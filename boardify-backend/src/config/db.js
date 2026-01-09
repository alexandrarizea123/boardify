import pg from 'pg'
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

export default pool
