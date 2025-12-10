import { useOpenAgents } from '@renderer/hooks/useOpenAgents'
import type { Network } from '@renderer/types'
import { Button, Modal, Tag } from 'antd'
import { Eye, Heart, MapPin, Users } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

interface NetworkDetailModalProps {
  network: Network | null
  open: boolean
  onClose: () => void
  formatNumber?: (num: number) => string
}

const NetworkDetailModal: FC<NetworkDetailModalProps> = ({
  network,
  open,
  onClose,
  formatNumber = (num) => String(num)
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { availableNetworkIds, toggleAvailableNetwork } = useOpenAgents()

  if (!network) return null

  const name = network.profile?.name || network.connection?.name || network.id
  const description = network.profile?.description || network.connection?.description || ''
  const org = network.org || network.org_id || ''
  const icon = network.connection?.icon
  const onlineAgents = network.stats?.online_agents || 0
  const totalAgents = network.profile?.capacity || 0
  const views = network.stats?.views || 0
  const likes = network.stats?.likes || 0
  const status = network.status || 'offline'
  const networkId = `openagents://${network.id}`
  const website = network.profile?.website || network.connection?.endpoint
  const requiredVersion = network.profile?.required_openagents_version || ''
  const country = network.profile?.country || network.connection?.country
  const tags = network.profile?.tags || []
  const categories = network.profile?.categories || []
  const createdAt = network.createdAt
  const updatedAt = network.updatedAt
  const endpoint = network.connection?.endpoint || network.profile?.connection?.endpoint

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#52c41a'
      case 'offline':
        return '#ff4d4f'
      case 'disabled':
        return '#8c8c8c'
      default:
        return '#8c8c8c'
    }
  }

  const handleJoinNetwork = () => {
    if (!network) return

    // 检查网络是否已经被选中
    const isAlreadySelected = (availableNetworkIds || []).includes(network.id)

    // 如果未选中，则添加到已选网络
    if (!isAlreadySelected) {
      toggleAvailableNetwork(network.id)
    }

    // 关闭弹窗并跳转到设置页面
    onClose()
    navigate('/settings/openagents')
  }

  return (
    <Modal
      title={
        <ModalTitle>
          {icon && <ModalIcon src={icon} alt={name} />}
          <ModalTitleText>{name}</ModalTitleText>
        </ModalTitle>
      }
      open={open}
      onCancel={onClose}
      afterClose={onClose}
      transitionName="animation-move-down"
      centered
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('common.cancel', '取消')}
        </Button>,
        <Button key="join" type="primary" onClick={handleJoinNetwork}>
          {t('openagents.detail.join_network', '加入网络')}
        </Button>
      ]}
      styles={{
        content: {
          borderRadius: 20,
          padding: 0
        },
        body: {
          padding: '24px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}>
      <ModalContent>
        {/* Tags at the top */}
        {(tags.length > 0 || categories.length > 0) && (
          <TagsContainer>
            {tags
              .filter((tag): tag is string => typeof tag === 'string')
              .map((tag) => (
                <Tag key={tag} color="blue" style={{ borderRadius: 20 }}>
                  #{tag}
                </Tag>
              ))}
            {categories
              .filter((cat): cat is string => typeof cat === 'string')
              .map((cat) => (
                <Tag key={cat} color="processing" style={{ borderRadius: 20 }}>
                  #{cat}
                </Tag>
              ))}
          </TagsContainer>
        )}

        {/* Status Bar */}
        <StatusBar>
          <StatusBadge $color={getStatusColor()}>{status.toUpperCase()}</StatusBadge>
          <StatusItem>
            <Users size={14} />
            <StatusText>
              {onlineAgents}/{totalAgents} {t('openagents.detail.agents', 'agents')}
            </StatusText>
          </StatusItem>
          <StatusItem>
            <Eye size={14} />
            <StatusText>{formatNumber(views)} views</StatusText>
          </StatusItem>
          <StatusItem>
            <Heart size={14} />
            <StatusText>{formatNumber(likes)} likes</StatusText>
          </StatusItem>
        </StatusBar>

        {/* Network Profile Section */}
        <ProfileSection>
          <SectionTitle>{t('openagents.detail.network_profile', 'Network Profile')}</SectionTitle>
          {/* Network Description - Full Width */}
          <DescriptionItem>
            <DetailLabel>{t('openagents.detail.network_description', 'Network Description')}:</DetailLabel>
            <DescriptionValue>{description || '-'}</DescriptionValue>
          </DescriptionItem>

          {/* Two Column Grid for other details */}
          <DetailsGrid>
            <DetailItem>
              <DetailLabel>{t('openagents.detail.network_id', 'Network ID')}:</DetailLabel>
              <DetailValue $mono>{networkId}</DetailValue>
            </DetailItem>
            <DetailItem>
              <DetailLabel>{t('openagents.detail.organization', 'Organization')}:</DetailLabel>
              <DetailValue>{org}</DetailValue>
            </DetailItem>
            {createdAt && (
              <DetailItem>
                <DetailLabel>{t('openagents.detail.created', 'Created')}:</DetailLabel>
                <DetailValue>{formatDate(createdAt)}</DetailValue>
              </DetailItem>
            )}
            {updatedAt && (
              <DetailItem>
                <DetailLabel>{t('openagents.detail.updated', 'Updated')}:</DetailLabel>
                <DetailValue>{formatDate(updatedAt)}</DetailValue>
              </DetailItem>
            )}
            {endpoint && (
              <DetailItem>
                <DetailLabel>{t('openagents.detail.endpoint', 'Endpoint')}:</DetailLabel>
                <DetailValue $mono>{endpoint}</DetailValue>
              </DetailItem>
            )}
            {website && (
              <DetailItem>
                <DetailLabel>{t('openagents.detail.website', 'Website')}:</DetailLabel>
                <DetailLink href={website} target="_blank" rel="noopener noreferrer">
                  {website}
                </DetailLink>
              </DetailItem>
            )}
            {requiredVersion && (
              <DetailItem>
                <DetailLabel>{t('openagents.detail.required_version', 'Required Version')}:</DetailLabel>
                <DetailValue>{requiredVersion}</DetailValue>
              </DetailItem>
            )}
            {country && (
              <DetailItem>
                <DetailLabel>{t('openagents.detail.location', 'Location')}:</DetailLabel>
                <DetailValue>
                  <MapPin size={14} style={{ marginRight: 4 }} />
                  {country}
                </DetailValue>
              </DetailItem>
            )}
            <DetailItem>
              <DetailLabel>{t('openagents.detail.capacity', 'Capacity')}:</DetailLabel>
              <DetailValue>
                <Users size={14} style={{ marginRight: 4 }} />
                {totalAgents} {t('openagents.detail.agents', 'agents')}
              </DetailValue>
            </DetailItem>
          </DetailsGrid>
        </ProfileSection>
      </ModalContent>
    </Modal>
  )
}

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ModalIcon = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
`

const ModalTitleText = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text);
`

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background-color: var(--color-background-soft);
  border-radius: 8px;
`

const StatusBadge = styled.span<{ $color: string }>`
  display: inline-block;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  background-color: ${(props) => props.$color};
  color: white;
  border: none;
`

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-2);
  font-size: 14px;
`

const StatusText = styled.span`
  font-size: 14px;
  color: var(--color-text-2);
`

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const DescriptionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  grid-column: 1 / -1;
`

const DescriptionValue = styled.div`
  font-size: 14px;
  color: var(--color-text);
  background-color: var(--color-background-soft);
  padding: 6px 12px;
  border-radius: 6px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
`

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px 0;
`

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const DetailLabel = styled.div`
  font-size: 12px;
  color: var(--color-text-2);
  font-weight: 500;
`

const DetailValue = styled.div<{ $mono?: boolean }>`
  font-size: 14px;
  color: var(--color-text);
  font-family: ${(props) => (props.$mono ? 'monospace' : 'inherit')};
  background-color: var(--color-background-soft);
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  word-break: break-all;
`

const DetailLink = styled.a`
  font-size: 14px;
  color: var(--color-primary);
  text-decoration: none;
  background-color: var(--color-background-soft);
  padding: 6px 12px;
  border-radius: 6px;
  display: inline-block;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
    color: var(--color-primary-hover);
  }
`

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
`

export default NetworkDetailModal
