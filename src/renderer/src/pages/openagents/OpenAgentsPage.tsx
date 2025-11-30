import { loggerService } from '@logger'
import NetworkDetailModal from '@renderer/components/OpenAgents/NetworkDetailModal'
import OpenAgentsCard from '@renderer/components/OpenAgents/OpenAgentsCard'
import type { Network, NetworksApiResponse } from '@renderer/types'
import axios from 'axios'
import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const logger = loggerService.withContext('OpenAgentsPage')

const OpenAgentsPage = () => {
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNetwork, setSelectedNetwork] = useState<Network | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const { t } = useTranslation()
  const navigate = useNavigate()

  const getData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get<NetworksApiResponse>(`https://endpoint.openagents.org/v1/networks`, {
        params: { page: 1, page_size: 200, status: 'online' }
      })

      // 安全地获取数据
      const networksData = response.data?.data?.items || []

      if (!Array.isArray(networksData)) {
        logger.warn('Unexpected API response structure', {
          data: response.data
        })
        setNetworks([])
        return
      }

      setNetworks(networksData)
    } catch (error) {
      logger.error('Failed to fetch networks', error instanceof Error ? error : new Error(String(error)))
      setNetworks([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getData()
  }, [getData])

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return String(num)
  }

  const handleAdd = () => {
    navigate('/settings/openagents')
  }

  const handleCardClick = (network: Network) => {
    setSelectedNetwork(network)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setSelectedNetwork(null)
  }

  return (
    <Container>
      <Sidebar>
        <AddButton onClick={handleAdd}>
          <Plus size={18} />
          <AddButtonText>{t('button.add')}</AddButtonText>
        </AddButton>
      </Sidebar>
      <MainContent>
        <TitleHeader>
          <Title>OpenAgents</Title>
        </TitleHeader>
        <ContentArea>
          {loading ? (
            <LoadingText>{t('common.loading')}</LoadingText>
          ) : networks.length === 0 ? (
            <LoadingText>{t('common.no_results')}</LoadingText>
          ) : (
            <Grid>
              {networks.map((network) => (
                <OpenAgentsCard
                  key={network.id}
                  network={network}
                  formatNumber={formatNumber}
                  onClick={handleCardClick}
                />
              ))}
            </Grid>
          )}
        </ContentArea>
      </MainContent>
      <NetworkDetailModal
        network={selectedNetwork}
        open={modalOpen}
        onClose={handleModalClose}
        formatNumber={formatNumber}
      />
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  background-color: var(--color-background);
  overflow: hidden;
`

const Sidebar = styled.div`
  width: 200px;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-right: 0.5px solid var(--color-border);
  background-color: var(--color-background);
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: transparent;
  border: 0.5px solid var(--color-border);
  border-radius: var(--list-item-border-radius);
  color: var(--color-text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: var(--color-list-item);
    border-color: var(--color-primary);
  }

  &:active {
    transform: scale(0.98);
  }
`

const AddButtonText = styled.span`
  font-size: 14px;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 20px;
`

const TitleHeader = styled.div`
  flex-shrink: 0;
  padding-bottom: 16px;
  border-bottom: 0.5px solid var(--color-border);
  margin-bottom: 20px;
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  padding: 0 8px;
`

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 4px; /* 为第一排卡片的悬浮效果预留空间 */
`

const LoadingText = styled.div`
  text-align: center;
  color: var(--color-text-2);
  padding: 40px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 0 8px;
  padding-top: 4px; /* 为第一排卡片的悬浮效果预留额外空间 */

  /* 根据屏幕宽度自适应列数 */
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (min-width: 1600px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (min-width: 2000px) {
    grid-template-columns: repeat(5, 1fr);
  }

  /* 最小保持2列 */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export default OpenAgentsPage
