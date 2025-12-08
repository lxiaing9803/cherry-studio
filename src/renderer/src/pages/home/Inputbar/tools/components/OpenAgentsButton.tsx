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
import type { Network } from '@renderer/types'
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
   * 调用 localhost:8780 的 create_mcp_client 接口
   * @param network 选中的网络
   */
  const createMcpClient = useCallback(async (network: Network) => {
    try {
      // 从 network 中提取 MCP 端点信息
      // 根据 network.yaml 配置，MCP 端口通常是 HTTP 端口 + 100，端点是 /mcp
      const httpPort = network.connection?.port || network.profile?.port || 8880
      const mcpPort = httpPort + 100 // MCP 端口通常是 HTTP 端口 + 100
      const host = network.connection?.host || network.profile?.host || 'localhost'
      const mcpUrl = `http://${host}:${mcpPort}/mcp`

      // 构建请求参数（根据 test_mcp_tools.py 中的 create_mcp_client 函数）
      const requestBody = {
        url: mcpUrl,
        auth_token: network.profile?.authentication?.federation || undefined
      }

      // 调用 localhost:8780 的 create_mcp_client 接口
      const response = await fetch(`http://localhost:8880/mcp`, {
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
      return result
    } catch (error) {
      logger.error('Failed to create MCP client', error instanceof Error ? error : new Error(String(error)))
      message.error(`创建 MCP 客户端失败: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }, [])

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
