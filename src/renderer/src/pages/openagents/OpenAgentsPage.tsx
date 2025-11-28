import { loggerService } from '@logger'
import type { Network, NetworksApiResponse } from '@renderer/types'
import { Tag } from 'antd'
import axios from 'axios'
import { Eye, Heart, Plus, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const logger = loggerService.withContext('OpenAgentsPage')

const OpenAgentsPage = () => {
  const [networks, setNetworks] = useState<Network[]>([])
  const [loading, setLoading] = useState(true)

  const { t } = useTranslation()

  const getData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axios.get<NetworksApiResponse>(
        `https://endpoint.openagents.org/v1/networks`,
        {
          params: { page: 1, per_page: 12, sort: 'online_agents' }
        }
      )

      // 安全地获取数据
      const networksData = response.data?.data?.items || []

      if (!Array.isArray(networksData)) {
        logger.warn('Unexpected API response structure', { data: response.data })
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
    // TODO: 实现添加功能
    logger.info('Add network clicked')
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
        <Title>OpenAgents</Title>
        {loading ? (
          <LoadingText>{t('common.loading')}</LoadingText>
        ) : networks.length === 0 ? (
          <LoadingText>{t('common.no_results')}</LoadingText>
        ) : (
          <Grid>
            {networks.map((network) => {
              const name = network.profile?.name || network.connection?.name || network.id
              const description = network.profile?.description || network.connection?.description || ''
              const org = network.org || network.org_id || ''
              const icon = network.connection?.icon
              const onlineAgents = network.stats?.online_agents || 0
              const totalAgents = network.profile?.capacity || 0
              const views = network.stats?.views || 0
              const likes = network.stats?.likes || 0
              const status = network.status
              return (
                <Card key={network.id}>
                  <CardHeader>
                    <CardTitleRow>
                      {icon && <CardIcon src={icon} alt={name} />}
                      <CardTitle>{name}</CardTitle>
                    </CardTitleRow>
                    <StatusBadge $status={status}>
                      {status}
                    </StatusBadge>
                  </CardHeader>
                  <Organization>Organization: {org}</Organization>
                  <Description>{description}</Description>

                  <Metrics>
                    <MetricItem>
                      <Users size={14} />
                      <MetricText>
                        {onlineAgents} / {totalAgents}
                      </MetricText>
                    </MetricItem>
                    <MetricItem>
                      <Eye size={14} />
                      <MetricText>{formatNumber(views)}</MetricText>
                    </MetricItem>
                    <MetricItem>
                      <Heart size={14} />
                      <MetricText>{formatNumber(likes)}</MetricText>
                    </MetricItem>
                  </Metrics>
                </Card>
              )
            })}
          </Grid>
        )}
      </MainContent>
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
  overflow-y: auto;
  padding: 20px;
`

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  padding: 0 8px 8px;
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
`

const Card = styled.div`
  display: flex;
  flex-direction: column;
  border: 0.5px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
  background-color: var(--color-background);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
`

const CardTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`

const CardIcon = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
`

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const StatusBadge = styled.span<{ $status: 'online' | 'offline' | 'disabled' }>`
  display: inline-block;
  border-radius: 12px;
  font-size: 11px;
  padding: 2px 8px;
  background-color: ${(props) => {
    switch (props.$status) {
      case 'online':
        return '#52c41a'
      case 'offline':
        return '#ff4d4f'
      case 'disabled':
        return '#8c8c8c'
      default:
        return '#8c8c8c'
    }
  }};
  color: white;
  border: none;
  flex-shrink: 0;
`

const Organization = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  margin-bottom: 8px;
`

const Description = styled.div`
  font-size: 13px;
  color: var(--color-text-2);
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
`

const CategoryTag = styled(Tag)`
  margin: 0;
  font-size: 11px;
  border-radius: 4px;
`

const Metrics = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 0.5px solid var(--color-border);
`

const MetricItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-2);
`

const MetricText = styled.span`
  font-size: 12px;
  color: var(--color-text-2);
`

export default OpenAgentsPage
