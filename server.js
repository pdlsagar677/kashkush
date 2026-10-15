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

  // Make io accessible from Next.js API routes
  global.__io = io

  io.on('connection', (socket) => {
    // Sync new client with current clipboard state
    socket.emit('clipboard:init', clipboardText)

    socket.on('clipboard:update', (text) => {
      clipboardText = text
      socket.broadcast.emit('clipboard:update', text)
    })
  })

  httpServer.once('error', (err) => {
    console.error(err)
    process.exit(1)
  })

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Network: http://<your-local-ip>:${port}`)
  })
})
