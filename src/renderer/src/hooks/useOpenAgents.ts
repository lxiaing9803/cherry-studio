import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@renderer/store'
import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  addNetwork,
  clearAvailableNetworks,
  deleteNetwork,
  setAvailableNetworkIds,
  setNetworks,
  toggleAvailableNetwork,
  updateNetwork
} from '@renderer/store/openagents'
import type { Network } from '@renderer/types'

const selectNetworks = (state: RootState) => state.openagents.networks
const selectAvailableNetworkIds = (state: RootState) => state.openagents.availableNetworkIds

const selectAvailableNetworks = createSelector([selectNetworks, selectAvailableNetworkIds], (networks, availableIds) =>
  networks.filter((network) => (availableIds || []).includes(network.id))
)

const selectOnlineNetworks = createSelector([selectNetworks], (networks) =>
  networks.filter((network) => network.status === 'online')
)

export const useOpenAgents = () => {
  const networks = useAppSelector(selectNetworks)
  const availableNetworkIds = useAppSelector(selectAvailableNetworkIds)
  const availableNetworks = useAppSelector(selectAvailableNetworks)
  const onlineNetworks = useAppSelector(selectOnlineNetworks)
  const dispatch = useAppDispatch()

  return {
    networks,
    availableNetworkIds,
    availableNetworks,
    onlineNetworks,
    addNetwork: (network: Network) => dispatch(addNetwork(network)),
    updateNetwork: (network: Network) => dispatch(updateNetwork(network)),
    deleteNetwork: (id: string) => dispatch(deleteNetwork(id)),
    setNetworks: (networks: Network[]) => dispatch(setNetworks(networks)),
    setAvailableNetworkIds: (ids: string[]) => dispatch(setAvailableNetworkIds(ids)),
    toggleAvailableNetwork: (id: string) => dispatch(toggleAvailableNetwork(id)),
    clearAvailableNetworks: () => dispatch(clearAvailableNetworks()),
    isNetworkAvailable: (id: string) => (availableNetworkIds || []).includes(id)
  }
}

export const useOpenAgentsNetwork = (id: string) => {
  const network = useAppSelector((state) => state.openagents.networks.find((network) => network.id === id))
  const isAvailable = useAppSelector((state) => (state.openagents.availableNetworkIds || []).includes(id))
  const dispatch = useAppDispatch()

  return {
    network,
    isAvailable,
    updateNetwork: (network: Network) => dispatch(updateNetwork(network)),
    deleteNetwork: () => dispatch(deleteNetwork(id)),
    toggleAvailable: () => dispatch(toggleAvailableNetwork(id))
  }
}
