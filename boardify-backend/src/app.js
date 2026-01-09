import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import boardRoutes from './routes/boardRoutes.js'
import collabRoutes from './routes/collabRoutes.js'

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

app.use('/api/auth', authRoutes)
app.use('/api', boardRoutes)
app.use('/api', collabRoutes)

export default app
