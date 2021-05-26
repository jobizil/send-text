import Express from 'express'
import ejs from 'ejs'
import { Server } from 'socket.io'
import Nexmo from 'nexmo'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

// Init nexmo
const nexmo = new Nexmo(
  {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
  },
  { debug: true }
)

const app = new Express()

// Setup Template Engine
app.set('view engine', 'html')
app.engine('html', ejs.renderFile)

// Public Folder Setup
const __dirname = path.resolve(path.dirname(''))
app.use(Express.static(path.join(__dirname, '/public')))

app.use(Express.urlencoded({ extended: true }))
app.use(Express.json())

// Routes
app.get('/', (_req, res) => {
  res.render('index')
})

// Get Forms Submit
app.post('/', (req, _res) => {
  const number = req.body.number
  const text = req.body.text

  nexmo.message.sendSms(
    process.env.FROM,
    number,
    text,
    { type: 'unicode' },
    (err, responseData) => {
      if (err) {
        console.log(err)
      } else {
        // Get response data
        const { messages } = responseData
        const {
          ['message-id']: id,
          ['to']: to,
          ['error-text']: error,
        } = messages[0]

        const data = {
          id,
          error,
          number,
        }

        // Emit to client
        io.emit('smsStatus', data)
      }
    }
  )
})

const port = process.env.PORT || 3400

const server = app.listen(port, () => {
  console.log('Server Running')
})

// Connect to socket.io
const io = new Server(server)

io.on('connection', socket => {
  console.log('Connected')
  io.on('disconnect', () => {
    console.log('Disconnected')
  })
})
