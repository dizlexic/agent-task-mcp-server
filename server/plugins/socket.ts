import { Server as SocketIOServer } from 'socket.io'

let io: SocketIOServer | null = null

export function getIO(): SocketIOServer | null {
  return io
}

export default defineNitroPlugin((nitro) => {
  // @ts-expect-error - accessing internal h3 server instance
  const server = nitro.h3App?.handler?.server ?? nitro.server

  // Fallback / safety in case server isn't ready
  nitro.hooks.hook('request', (event) => {
    if (io) return

    const nodeServer = (event.node?.res?.socket as any)?.server
    if (!nodeServer) return

    io = new SocketIOServer({
      path: '/_ws',
      cors: { origin: '*' },
      serveClient: false,
    })
    io.attach(nodeServer)

    setupSocketHandlers(io)
  })

  if (io) {
    setupSocketHandlers(io)
  }
})

function setupSocketHandlers(ioInstance: SocketIOServer) {
  ioInstance.on('connection', (socket) => {
    // Join a board room
    socket.on('join-board', (boardId: string) => {
      socket.join(`board:${boardId}`)
    })

    // Leave a board room
    socket.on('leave-board', (boardId: string) => {
      socket.leave(`board:${boardId}`)
    })
  })
}
