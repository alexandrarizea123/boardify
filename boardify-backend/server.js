import app from './src/app.js'
import initializeDatabase from './src/config/init.js'

const PORT = Number(process.env.PORT) || 3000

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
