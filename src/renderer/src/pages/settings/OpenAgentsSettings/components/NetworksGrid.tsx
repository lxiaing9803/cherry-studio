import OpenAgentsCard from '@renderer/components/OpenAgents/OpenAgentsCard'
import type { Network } from '@renderer/types'
import type { FC } from 'react'
import styled from 'styled-components'

interface NetworksGridProps {
  networks: Network[]
  selectedNetworkIds: Set<string>
  onToggleSelection: (networkId: string) => void
  formatNumber?: (num: number) => string
}

const NetworksGrid: FC<NetworksGridProps> = ({ networks, selectedNetworkIds, onToggleSelection, formatNumber }) => {
  return (
    <Grid>
      {networks.map((network) => (
        <OpenAgentsCard
          key={network.id}
          network={network}
          isSelected={selectedNetworkIds.has(network.id)}
          onSelect={onToggleSelection}
          formatNumber={formatNumber}
        />
      ))}
    </Grid>
  )
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`

export default NetworksGrid
