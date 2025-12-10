import type { Network } from '@renderer/types'
import { Button, Tag, Typography } from 'antd'
import { Trash2 } from 'lucide-react'
import type { FC } from 'react'
import styled from 'styled-components'

interface SelectedNetworkCardProps {
  network: Network
  isDragging?: boolean
  onDelete: (networkId: string) => void
  getNetworkVersion?: (network: Network) => string
}

const SelectedNetworkCard: FC<SelectedNetworkCardProps> = ({
  network,
  isDragging = false,
  onDelete,
  getNetworkVersion
}) => {
  const name = network.profile?.name || network.connection?.name || network.id
  const version = network.profile?.required_openagents_version || getNetworkVersion?.(network)
  const isEnabled = network.status === 'online'
  const tags = network.profile?.tags || []
  const categories = network.profile?.categories || []
  const description = network.profile?.description || network.connection?.description || ''

  return (
    <Card $dragging={isDragging} $isActive={isEnabled}>
      <CardHeader>
        <NameWrapper>
          <Name>{name}</Name>
        </NameWrapper>
        <Actions onClick={(e) => e.stopPropagation()}>
          <Button
            type="text"
            shape="circle"
            danger
            icon={<Trash2 size={14} />}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(network.id)
            }}
            data-no-dnd
          />
        </Actions>
      </CardHeader>
      <CardDescription>{description}</CardDescription>
      <CardTags>
        {version && (
          <VersionBadge color="#108ee9">
            <VersionText ellipsis={{ tooltip: true }}>{version}</VersionText>
          </VersionBadge>
        )}
        {tags
          .filter((tag): tag is string => typeof tag === 'string')
          .filter((tag) => tag !== 'builtin')
          .map((tag) => (
            <NetworkTag key={tag} bordered>
              {tag}
            </NetworkTag>
          ))}
        {categories
          .filter((cat): cat is string => typeof cat === 'string')
          .map((cat) => (
            <NetworkTag key={cat} bordered color="processing">
              {cat}
            </NetworkTag>
          ))}
      </CardTags>
    </Card>
  )
}

const Card = styled.div<{
  $dragging?: boolean
  $isActive?: boolean
}>`
  display: flex;
  flex-direction: column;
  border: 0.5px solid var(--color-border);
  border-radius: var(--list-item-border-radius);
  padding: 10px 10px 10px 16px;
  transition: all 0.2s ease;
  background-color: var(--color-background);
  margin-bottom: 5px;
  height: 125px;
  opacity: ${(props) => {
    if (props.$dragging) return 0.5
    return props.$isActive ? 1 : 0.6
  }};
  width: 100%;

  &:hover {
    opacity: 1;
    border-color: var(--color-primary);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
`

const NameWrapper = styled.div`
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 4px;
`

const Name = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CardDescription = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  width: 100%;
  word-break: break-word;
  height: 50px;
`

const CardTags = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: row;
  overflow-x: auto;
  min-height: 22px;
  gap: 4px;
  margin-top: 10px;

  &::-webkit-scrollbar {
    display: none;
  }
`

const NetworkTag = styled(Tag)`
  border-radius: 20px;
  margin: 0;
  border-color: #52c41a;
  color: #52c41a;
  background-color: transparent;
`

const VersionBadge = styled(NetworkTag)`
  font-weight: 500;
  max-width: 6rem !important;
`

const VersionText = styled(Typography.Text)`
  font-size: inherit;
  color: white;
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  flex-shrink: 0;

  > :first-child {
    margin-right: 4px;
  }
`

export default SelectedNetworkCard
