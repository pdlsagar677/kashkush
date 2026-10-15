const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

let clipboardText = ''
const connectedUsers = new Map() // socketId → nickname

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling', req.url, err)
      res.statusCode = 500
      res.end('Internal server error')
    }
  })

  const io = new Server(httpServer, {
    cors: { origin: '*' },
  })

  global.__io = io

  io.on('connection', (socket) => {
    socket.emit('clipboard:init', clipboardText)

    socket.on('user:join', (nickname) => {
      connectedUsers.set(socket.id, nickname)
      io.emit('users:update', [...connectedUsers.values()])
    })

    socket.on('clipboard:update', (text) => {
      clipboardText = text
      socket.broadcast.emit('clipboard:update', text)
    })

    socket.on('typing:start', () => {
      const name = connectedUsers.get(socket.id)
      if (name) socket.broadcast.emit('typing:update', { nickname: name, isTyping: true })
    })

    socket.on('typing:stop', () => {
      const name = connectedUsers.get(socket.id)
      if (name) socket.broadcast.emit('typing:update', { nickname: name, isTyping: false })
    })

    socket.on('disconnect', () => {
      const name = connectedUsers.get(socket.id)
      connectedUsers.delete(socket.id)
      if (name) socket.broadcast.emit('typing:update', { nickname: name, isTyping: false })
      io.emit('users:update', [...connectedUsers.values()])
    })
  })

  httpServer.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
