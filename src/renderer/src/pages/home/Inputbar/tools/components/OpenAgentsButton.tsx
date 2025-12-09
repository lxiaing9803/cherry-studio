import { ActionIconButton } from '@renderer/components/Buttons'
import OpenAgentsIcon from '@renderer/components/Icons/OpenAgentsIcon'
import type { QuickPanelListItem } from '@renderer/components/QuickPanel'
import { QuickPanelReservedSymbol, useQuickPanel } from '@renderer/components/QuickPanel'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useOpenAgents } from '@renderer/hooks/useOpenAgents'
import type { ToolQuickPanelApi } from '@renderer/pages/home/Inputbar/types'
import { EventEmitter } from '@renderer/services/EventService'
import { loggerService } from '@renderer/services/LoggerService'
import openAgentsService from '@renderer/services/OpenAgentsService'
import type { MCPServer, MCPTool, Network } from '@renderer/types'
import { ThemeMode } from '@renderer/types'
import { message, Tooltip } from 'antd'
import { CircleX, Globe, Plus } from 'lucide-react'
import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

interface Props {
  assistantId: string
  quickPanel: ToolQuickPanelApi
}

const logger = loggerService.withContext('OpenAgentsButton')

const OpenAgentsButton: FC<Props> = ({ quickPanel, assistantId }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const quickPanelHook = useQuickPanel()
  const { networks, availableNetworks, setNetworks } = useOpenAgents()
  const { assistant, updateAssistant } = useAssistant(assistantId)

  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // 获取网络列表
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const fetchedNetworks = await openAgentsService.getNetworks()
        if (isMountedRef.current) {
          setNetworks(fetchedNetworks)
        }
      } catch (error) {
        logger.error('Failed to fetch networks', error instanceof Error ? error : new Error(String(error)))
      }
    }

    if (networks.length === 0) {
      fetchNetworks()
    }
  }, [networks.length, setNetworks])

  // 当前助手激活的网络
  const assistantNetworks = useMemo(() => assistant.openAgentsNetworks || [], [assistant.openAgentsNetworks])

  /**
   * 创建临时的 MCPServer 对象用于获取 tools
   * @param network 选中的网络
   */
  const createTempMcpServer = useCallback((network: Network): MCPServer => {
    // 动态构建 MCP URL
    // 优先使用 connection 中的信息，如果没有则使用 profile 中的信息
    const host = network.connection?.host || network.profile?.host || 'localhost'
    const port = network.connection?.port || network.profile?.port
    
    let mcpUrl: string
    if (port) {
      // 如果有端口，使用 http://host:port/mcp 格式
      // 直接使用 HTTP 端口
      const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
      mcpUrl = `${protocol}://${host}:${port}/mcp`
    } else {
      // 如果没有端口，可能是完整的 URL，直接使用
      // 检查是否已经是完整的 URL
      if (host.startsWith('http://') || host.startsWith('https://')) {
        mcpUrl = host.endsWith('/mcp') ? host : `${host}/mcp`
      } else {
        // 默认使用 https
        mcpUrl = `https://${host}/mcp`
      }
    }

    return {
      id: `openagents_${network.id}`,
      name: network.profile?.name || network.id,
      description: network.profile?.description || '',
      baseUrl: mcpUrl,
      type: 'streamableHttp', // URL 以 /mcp 结尾，类型为 streamableHttp
      isActive: true,
      headers: network.profile?.authentication?.federation
        ? {
            Authorization: `Bearer ${network.profile.authentication.federation}`
          }
        : undefined
    }
  }, [])

  /**
   * 获取 MCP tools 列表
   * @param network 选中的网络
   */
  const fetchMcpTools = useCallback(async (network: Network): Promise<MCPTool[]> => {
    try {
      const tempServer = createTempMcpServer(network)
      const tools = await window.api.mcp.listTools(tempServer)
      logger.info(`获取到 ${tools.length} 个 MCP tools`, { networkId: network.id, tools })
      return tools
    } catch (error) {
      logger.error('Failed to fetch MCP tools', error instanceof Error ? error : new Error(String(error)))
      message.error(`获取 MCP tools 失败: ${error instanceof Error ? error.message : String(error)}`)
      return []
    }
  }, [createTempMcpServer])

  /**
   * 创建 MCP 客户端连接
   * @param network 选中的网络
   */
  const createMcpClient = useCallback(async (network: Network) => {
    try {
      // 动态构建 MCP URL（与 createTempMcpServer 中的逻辑一致）
      const host = network.connection?.host || network.profile?.host || 'localhost'
      const port = network.connection?.port || network.profile?.port
      
      let mcpUrl: string
      if (port) {
        // 直接使用 HTTP 端口
        const protocol = host.includes('localhost') || host.includes('127.0.0.1') ? 'http' : 'https'
        mcpUrl = `${protocol}://${host}:${port}/mcp`
      } else {
        if (host.startsWith('http://') || host.startsWith('https://')) {
          mcpUrl = host.endsWith('/mcp') ? host : `${host}/mcp`
        } else {
          mcpUrl = `https://${host}/mcp`
        }
      }

      // 构建请求参数（根据 test_mcp_tools.py 中的 create_mcp_client 函数）
      const requestBody = {
        url: mcpUrl,
        auth_token: network.profile?.authentication?.federation || undefined
      }

      // 调用 MCP 接口创建客户端
      const response = await fetch(mcpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      logger.info('MCP client created successfully', { networkId: network.id, result })
      message.success(`已为网络 ${network.profile?.name || network.id} 创建 MCP 客户端`)

      // 创建 MCP 客户端成功后，获取 tools 列表
      try {
        const tools = await fetchMcpTools(network)
        if (tools.length > 0) {
          logger.info(`成功获取 ${tools.length} 个 MCP tools`, {
            networkId: network.id,
            toolNames: tools.map((t) => t.name)
          })
          message.success(`已获取 ${tools.length} 个 MCP tools`)
        } else {
          logger.warn('未获取到任何 MCP tools', { networkId: network.id })
          message.warning('未获取到任何 MCP tools')
        }
      } catch (toolError) {
        logger.warn('获取 MCP tools 时出错，但 MCP 客户端已创建', {
          networkId: network.id,
          error: toolError instanceof Error ? toolError : new Error(String(toolError))
        })
      }

      return result
    } catch (error) {
      logger.error('Failed to create MCP client', error instanceof Error ? error : new Error(String(error)))
      message.error(`创建 MCP 客户端失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }, [fetchMcpTools])

  // 处理网络选择/取消
  const handleNetworkSelect = useCallback(
    async (network: Network) => {
      const update = { ...assistant }
      if (assistantNetworks.some((n) => n.id === network.id)) {
        // 取消选中
        update.openAgentsNetworks = assistantNetworks.filter((n) => n.id !== network.id)
      } else {
        // 选中 - 调用 create_mcp_client 接口
        try {
          await createMcpClient(network)
          update.openAgentsNetworks = [...assistantNetworks, network]
        } catch (error) {
          // 如果创建 MCP 客户端失败，仍然允许选择网络，但记录错误
          logger.warn('Failed to create MCP client, but network selection will continue', {
            networkId: network.id,
            error: error instanceof Error ? error : new Error(String(error))
          })
          update.openAgentsNetworks = [...assistantNetworks, network]
        }
      }
      updateAssistant(update)
    },
    [assistant, assistantNetworks, updateAssistant, createMcpClient]
  )

  const handleNetworkSelectRef = useRef(handleNetworkSelect)
  handleNetworkSelectRef.current = handleNetworkSelect

  useEffect(() => {
    const handler = (network: Network) => handleNetworkSelectRef.current(network)
    EventEmitter.on('openagents-network-select', handler)
    return () => EventEmitter.off('openagents-network-select', handler)
  }, [])

  // 菜单项 - 显示可用网络列表（从 Settings 选择的）
  const menuItems = useMemo(() => {
    const newList: QuickPanelListItem[] = availableNetworks.map((network) => ({
      label: network.profile?.name || network.id,
      description: network.profile?.description || network.connection?.endpoint || '',
      icon: <Globe />,
      action: ({ context }) => {
        EventEmitter.emit('openagents-network-select', network)
        context.close()
      },
      isSelected: assistantNetworks.some((n) => n.id === network.id)
    }))

    newList.push({
      label: t('openagents.settings.addNetwork') + '...',
      icon: <Plus />,
      action: () => navigate('/settings/openagents')
    })

    newList.unshift({
      label: t('settings.input.clear.all'),
      description: t('openagents.settings.disable.description'),
      icon: <CircleX />,
      isSelected: false,
      action: () => {
        updateAssistant({ ...assistant, openAgentsNetworks: [] })
        quickPanelHook.close()
      }
    })

    return newList
  }, [availableNetworks, assistantNetworks, t, navigate, assistant, updateAssistant, quickPanelHook])

  const openQuickPanel = useCallback(() => {
    quickPanelHook.open({
      title: t('openagents.settings.title'),
      list: menuItems,
      symbol: QuickPanelReservedSymbol.OpenAgents,
      multiple: true,
      afterAction({ item }) {
        item.isSelected = !item.isSelected
      }
    })
  }, [menuItems, quickPanelHook, t])

  const handleOpenQuickPanel = useCallback(() => {
    if (quickPanelHook.isVisible && quickPanelHook.symbol === QuickPanelReservedSymbol.OpenAgents) {
      quickPanelHook.close()
    } else {
      openQuickPanel()
    }
  }, [openQuickPanel, quickPanelHook])

  useEffect(() => {
    const iconColor = theme === ThemeMode.dark ? 'white' : 'black'
    const isActive = assistantNetworks.length > 0

    const disposeMain = quickPanel.registerRootMenu([
      {
        label: t('openagents.settings.title'),
        description: '',
        icon: <OpenAgentsIcon size={16} color={iconColor} active={isActive} />,
        isMenu: true,
        action: () => openQuickPanel()
      }
    ])

    const disposeMainTrigger = quickPanel.registerTrigger(QuickPanelReservedSymbol.OpenAgents, () => openQuickPanel())

    return () => {
      disposeMain()
      disposeMainTrigger()
    }
  }, [openQuickPanel, quickPanel, t, theme, assistantNetworks.length])

  const isActive = assistantNetworks.length > 0
  const iconColor = theme === ThemeMode.dark ? 'white' : 'black'

  return (
    <Tooltip placement="top" title={t('openagents.settings.title')} mouseLeaveDelay={0} arrow>
      <ActionIconButton onClick={handleOpenQuickPanel} active={isActive}>
        <OpenAgentsIcon size={18} color={iconColor} active={isActive} />
      </ActionIconButton>
    </Tooltip>
  )
}

export default React.memo(OpenAgentsButton)
