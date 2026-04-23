import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function useSocket() {
  function connect(): Socket {
    if (socket?.connected) return socket

    if (!socket) {
      socket = io({
        path: '/_ws',
        transports: ['websocket', 'polling'],
      })
    }

    if (!socket.connected) {
      socket.connect()
    }

    return socket
  }

  function disconnect() {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  }

  function getSocket(): Socket | null {
    return socket
  }

  return { connect, disconnect, getSocket }
}
