import Sortable from '@renderer/components/dnd/Sortable'
import type { Network } from '@renderer/types'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SelectedNetworkCard from './SelectedNetworkCard'

interface SelectedNetworksListProps {
  networks: Network[]
  onSortEnd: (event: { oldIndex: number; newIndex: number }) => void
  onToggle: (networkId: string, enabled: boolean) => void
  onDelete: (networkId: string) => void
  onSettings?: (networkId: string) => void
  getNetworkVersion?: (network: Network) => string
}

const SelectedNetworksList: FC<SelectedNetworksListProps> = ({
  networks,
  onSortEnd,
  onToggle,
  onDelete,
  onSettings,
  getNetworkVersion
}) => {
  const { t } = useTranslation()

  if (networks.length === 0) {
    return null
  }

  return (
    <Container>
      <Title>{t('openagents.settings.selected_networks', '已选网络')}</Title>
      <Sortable
        items={networks}
        itemKey="id"
        onSortEnd={onSortEnd}
        layout="list"
        horizontal={false}
        listStyle={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
        itemStyle={{ width: '100%' }}
        gap="12px"
        restrictions={{ scrollableAncestor: true }}
        useDragOverlay
        showGhost
        renderItem={(network, { dragging }) => (
          <SelectedNetworkCard
            network={network}
            isDragging={dragging}
            onToggle={onToggle}
            onDelete={onDelete}
            onSettings={onSettings}
            getNetworkVersion={getNetworkVersion}
          />
        )}
      />
    </Container>
  )
}

const Container = styled.div`
  margin-bottom: 20px;
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text);
`

export default SelectedNetworksList
