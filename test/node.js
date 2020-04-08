const http = require('http')

const server = http.createServer((req, res) => {
  console.log(req, Object.keys(req.headers).join(','))
  res.setHeader('Access-Control-Allow-Origin', `${req.headers.origin}`)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    [...Object.keys(req.headers), 'content-type'].join(',')
  )
  res.setHeader('content-type', 'application/json')
  res.end('{"ok": true}')
})
server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
server.listen(8000)
