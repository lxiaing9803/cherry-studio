import { ActionIconButton } from '@renderer/components/Buttons'
import OpenAgentsIcon from '@renderer/components/Icons/OpenAgentsIcon'
import type { QuickPanelListItem } from '@renderer/components/QuickPanel'
import { QuickPanelReservedSymbol, useQuickPanel } from '@renderer/components/QuickPanel'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useOpenAgents } from '@renderer/hooks/useOpenAgents'
import type { ToolQuickPanelApi } from '@renderer/pages/home/Inputbar/types'
import { EventEmitter } from '@renderer/services/EventService'
import openAgentsService from '@renderer/services/OpenAgentsService'
import type { Network } from '@renderer/types'
import { ThemeMode } from '@renderer/types'
import { Tooltip } from 'antd'
import { CircleX, Globe, Plus } from 'lucide-react'
import type { FC } from 'react'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

interface Props {
  assistantId: string
  quickPanel: ToolQuickPanelApi
}

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
        console.error('Failed to fetch networks:', error)
      }
    }

    if (networks.length === 0) {
      fetchNetworks()
    }
  }, [networks.length, setNetworks])

  // 当前助手激活的网络
  const assistantNetworks = useMemo(() => assistant.openAgentsNetworks || [], [assistant.openAgentsNetworks])

  // 处理网络选择/取消
  const handleNetworkSelect = useCallback(
    (network: Network) => {
      const update = { ...assistant }
      if (assistantNetworks.some((n) => n.id === network.id)) {
        // 取消选中
        update.openAgentsNetworks = assistantNetworks.filter((n) => n.id !== network.id)
      } else {
        // 选中
        update.openAgentsNetworks = [...assistantNetworks, network]
      }
      updateAssistant(update)
    },
    [assistant, assistantNetworks, updateAssistant]
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
  }, [availableNetworks, assistantNetworks, t, navigate, assistant, updateAssistant])

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
