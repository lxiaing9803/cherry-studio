import type { MCPTool } from '@renderer/types'

export const listMcpToolsTool: MCPTool = {
  id: 'builtin-list-mcp-tools',
  serverId: 'builtin',
  serverName: 'Built-in',
  name: 'list_mcp_tools',
  description:
    '列出所有已连接的 MCP 服务的工具列表。当用户询问"列出所有mcp服务的tools"或类似问题时，使用此工具获取所有可用的 MCP 工具信息。',
  isBuiltIn: true,
  type: 'mcp',
  inputSchema: {
    type: 'object',
    title: 'List MCP Tools Input',
    description: '输入参数（可选）',
    properties: {}
  }
}

