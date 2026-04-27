import { getRouterParam, createError, defineEventHandler } from 'h3'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { boards } from '../../../db/schema'
import { createBoardMcpServer } from '../../../utils/board-mcp'

export default defineEventHandler(async (event) => {
  const boardId = getRouterParam(event, 'id')!

  // Verify board exists. Board IDs are scoped to a single board so the MCP server
  // created below can only ever access tasks/comments for THIS board.
  const boardResults = await db.select().from(boards).where(eq(boards.id, boardId))
  const board = boardResults[0]
  if (!board) {
    throw createError({ statusCode: 404, statusMessage: 'Board not found' })
  }

  // Per MCP spec (2025-11-25 / basic), authorization MUST be sent via the
  // standard HTTP `Authorization: Bearer <token>` header. We no longer accept
  // tokens via query string for security reasons (avoids leakage in logs/history).
  if (!board.mcpPublic) {
    if (!board.mcpToken) {
      // Advertise bearer auth scheme on 401 per RFC 6750.
      event.node.res.setHeader('WWW-Authenticate', 'Bearer realm="moo-tasks", error="server_error"')
      throw createError({ statusCode: 401, statusMessage: 'MCP endpoint is private and no token is configured. Please generate a token in board settings.' })
    }

    const authHeader = event.node.req.headers.authorization || ''
    if (!authHeader.startsWith('Bearer ')) {
      event.node.res.setHeader('WWW-Authenticate', 'Bearer realm="moo-tasks"')
      throw createError({ statusCode: 401, statusMessage: 'Missing Authorization: Bearer <token> header' })
    }
    const token = authHeader.slice(7).trim()

    if (token !== board.mcpToken) {
      event.node.res.setHeader('WWW-Authenticate', 'Bearer realm="moo-tasks", error="invalid_token"')
      throw createError({ statusCode: 401, statusMessage: 'Invalid bearer token' })
    }
  }

  // Get the Node.js req/res from h3
  const req = event.node.req
  const res = event.node.res

  // Browser redirect
  const accept = req.headers.accept || ''
  if (accept.includes('text/html') && !accept.includes('text/event-stream') && !accept.includes('application/json')) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`<meta http-equiv="refresh" content="0; url=/">`)
    return
  }

  try {
    // Create a fresh transport and server for each request (stateless mode).
    // The MCP SDK requires a new transport instance per request in stateless mode.
    const mcpServer = await createBoardMcpServer(boardId)
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
    })
    await mcpServer.connect(transport)
    await transport.handleRequest(req, res)
  } catch (e: any) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ error: e.message }))
    }
  }
})
