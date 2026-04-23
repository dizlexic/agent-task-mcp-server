import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const server = new McpServer({
  name: 'test',
  version: '1.0.0',
});

const transport = new StreamableHTTPServerTransport();

server.connect(transport).then(() => {
  console.log('Server connected');
});
