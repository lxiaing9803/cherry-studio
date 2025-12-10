import { loggerService } from '@logger'
import { useTheme } from '@renderer/context/ThemeProvider'
import { useOpenAgents } from '@renderer/hooks/useOpenAgents'
import openAgentsService from '@renderer/services/OpenAgentsService'
import type { Network } from '@renderer/types'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { SettingContainer, SettingDivider, SettingGroup, SettingTitle } from '..'
import NetworkSearch from './components/NetworkSearch'
import NetworksGrid from './components/NetworksGrid'
import SelectedNetworksList from './components/SelectedNetworksList'

const logger = loggerService.withContext('OpenAgentsSettings')

const OpenAgentsSettings = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { networks, availableNetworks, availableNetworkIds, setNetworks, toggleAvailableNetwork } = useOpenAgents()
  const [loading, setLoading] = useState(true)
  const [selectedNetworksOrder, setSelectedNetworksOrder] = useState<Network[]>([])
  const [searchText, setSearchText] = useState('')

  // 只在组件挂载时获取一次数据
  useEffect(() => {
    const getData = async () => {
    try {
      setLoading(true)
        const fetchedNetworks = await openAgentsService.getNetworks()
        setNetworks(fetchedNetworks)
    } catch (error) {
      logger.error('Failed to fetch networks', error instanceof Error ? error : new Error(String(error)))
    } finally {
        setLoading(false)
      }
    }

    // 只有在networks为空时才获取
    if (networks.length === 0) {
      getData()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 过滤网络列表（根据搜索文本）
  const filteredNetworks = useMemo(() => {
    if (!searchText.trim()) {
      return networks
    }
    const searchLower = searchText.toLowerCase()
    return networks.filter((network) => {
      const name = network.profile?.name || network.connection?.name || network.id
      return name.toLowerCase().includes(searchLower)
    })
  }, [networks, searchText])

  // 获取选中的网络列表（保持顺序）
  const orderedAvailableNetworks = useMemo(() => {
    if (selectedNetworksOrder.length > 0 && availableNetworkIds) {
      return selectedNetworksOrder.filter((network) => availableNetworkIds.includes(network.id))
    }
    return availableNetworks || []
  }, [availableNetworks, availableNetworkIds, selectedNetworksOrder])

  // 更新网络选择
  const handleToggleNetworkSelection = useCallback(
    (networkId: string) => {
      logger.info('Toggle network selection', { networkId, currentIds: availableNetworkIds })
      const network = networks.find((n) => n.id === networkId)
      if (network) {
        const isCurrentlySelected = (availableNetworkIds || []).includes(networkId)
        if (isCurrentlySelected) {
        setSelectedNetworksOrder((prevOrder) => prevOrder.filter((n) => n.id !== networkId))
      } else {
          setSelectedNetworksOrder((prevOrder) => [...prevOrder, network])
        }
      }
      toggleAvailableNetwork(networkId)
      logger.info('After toggle', { networkId })
    },
    [networks, availableNetworkIds, toggleAvailableNetwork, logger]
  )

  // 删除选中的网络
  const handleDeleteNetwork = useCallback(
    (networkId: string) => {
    setSelectedNetworksOrder((prevOrder) => prevOrder.filter((n) => n.id !== networkId))
      toggleAvailableNetwork(networkId)
    logger.info('Delete network', { networkId })
    },
    [toggleAvailableNetwork]
  )

  // 处理拖拽排序
  const handleSortEnd = useCallback(({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
    if (oldIndex === newIndex) return
    setSelectedNetworksOrder((prev) => {
      const newOrder = [...prev]
      const [moved] = newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, moved)
      return newOrder
    })
  }, [])

  // 切换网络启用状态
  const handleToggleNetwork = (networkId: string, enabled: boolean) => {
    logger.info('Toggle network', { networkId, enabled })
  }

  // 获取网络版本
  const getNetworkVersion = (_network: Network): string => {
    return '1.1.0'
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return String(num)
  }

  return (
    <SettingContainer theme={theme}>
      <PageTitle>{t('openagents.settings.title')}</PageTitle>
      <SettingDivider />

      {orderedAvailableNetworks.length > 0 && (
        <SettingGroup theme={theme} style={{ marginBottom: 20 }}>
          <SelectedNetworksList
            networks={orderedAvailableNetworks}
            onSortEnd={handleSortEnd}
            onDelete={handleDeleteNetwork}
            getNetworkVersion={getNetworkVersion}
          />
        </SettingGroup>
      )}

      <SettingGroup theme={theme}>
        <SectionTitle style={{ marginBottom: 16 }}>{t('openagents.settings.network_list', '网络列表')}</SectionTitle>

        <NetworkSearch value={searchText} onChange={setSearchText} />

        {loading ? (
          <LoadingText>{t('common.loading')}</LoadingText>
        ) : filteredNetworks.length === 0 ? (
          <LoadingText>
            {searchText ? t('openagents.settings.no_search_results', '未找到匹配的网络') : t('common.no_results')}
          </LoadingText>
        ) : (
          <NetworksGrid
            networks={filteredNetworks}
            selectedNetworkIds={new Set(availableNetworkIds || [])}
            onToggleSelection={handleToggleNetworkSelection}
            formatNumber={formatNumber}
          />
        )}
      </SettingGroup>
    </SettingContainer>
  )
}

const PageTitle = styled(SettingTitle)`
  font-size: 18px;
  font-weight: 600;
`

const SectionTitle = styled(SettingTitle)`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
`

const LoadingText = styled.div`
  text-align: center;
  color: var(--color-text-2);
  padding: 40px;
`

export default OpenAgentsSettings
