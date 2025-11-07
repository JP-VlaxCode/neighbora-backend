import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import '@/config/firebaseAdmin'
import usersRouter from '@/routes/users'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/users', usersRouter)

const port = process.env.PORT || 4001
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`User service listening on port ${port}`)
})
