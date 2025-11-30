import { CheckOutlined, PlusOutlined } from '@ant-design/icons'
import type { Network } from '@renderer/types'
import { Button } from 'antd'
import { Eye, Heart, Users } from 'lucide-react'
import type { FC } from 'react'
import styled from 'styled-components'

interface OpenAgentsCardProps {
  network: Network
  isSelected?: boolean
  onSelect?: (networkId: string) => void
  onClick?: (network: Network) => void
  formatNumber?: (num: number) => string
}

const OpenAgentsCard: FC<OpenAgentsCardProps> = ({
  network,
  isSelected = false,
  onSelect,
  onClick,
  formatNumber = (num) => String(num)
}) => {
  const name = network.profile?.name || network.connection?.name || network.id
  const description = network.profile?.description || network.connection?.description || ''
  const org = network.org || network.org_id || ''
  const icon = network.connection?.icon
  const onlineAgents = network.stats?.online_agents || 0
  const totalAgents = network.profile?.capacity || 0
  const views = network.stats?.views || 0
  const likes = network.stats?.likes || 0
  const status = network.status || 'offline'

  const handleCardClick = () => {
    if (onClick) {
      onClick(network)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onSelect) {
      onSelect(network.id)
    }
  }

  return (
    <Card onClick={handleCardClick}>
      <CardHeader>
        <CardTitleRow>
          {icon && <CardIcon src={icon} alt={name} />}
          <CardTitle>{name}</CardTitle>
        </CardTitleRow>
        <CardActions>
          <StatusBadge $status={status as 'online' | 'offline' | 'disabled'}>{status}</StatusBadge>
          {onSelect && (
            <CardActionButton
              type="text"
              icon={isSelected ? <CheckOutlined style={{ color: 'var(--color-primary)' }} /> : <PlusOutlined />}
              size="small"
              onClick={handleButtonClick}
            />
          )}
        </CardActions>
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
}

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

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const StatusBadge = styled.span<{
  $status: 'online' | 'offline' | 'disabled'
}>`
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

const CardActionButton = styled(Button)`
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
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

export default OpenAgentsCard
