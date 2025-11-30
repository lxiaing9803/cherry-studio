import { loggerService } from '@logger'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Network } from '@renderer/types'

const logger = loggerService.withContext('Store:OpenAgents')

export interface OpenAgentsConfig {
  networks: Network[] // 所有可用的网络列表（从 API 获取）
  availableNetworkIds: string[] // 在 Settings 页面选择的可用网络 ID（类似 MCP 的 isActive）
  lastFetchTime?: number
}

export const initialState: OpenAgentsConfig = {
  networks: [],
  availableNetworkIds: [], // Settings 页面选择的可用网络
  lastFetchTime: undefined
}

const openagentsSlice = createSlice({
  name: 'openagents',
  initialState,
  reducers: {
    setNetworks: (state, action: PayloadAction<Network[]>) => {
      state.networks = action.payload
      state.lastFetchTime = Date.now()
    },
    addNetwork: (state, action: PayloadAction<Network>) => {
      const exists = state.networks.some((n) => n.id === action.payload.id)
      if (!exists) {
        state.networks.unshift(action.payload)
      }
    },
    updateNetwork: (state, action: PayloadAction<Network>) => {
      const index = state.networks.findIndex((network) => network.id === action.payload.id)
      if (index !== -1) {
        state.networks[index] = action.payload
      }
    },
    deleteNetwork: (state, action: PayloadAction<string>) => {
      state.networks = state.networks.filter((network) => network.id !== action.payload)
    },
    setAvailableNetworkIds: (state, action: PayloadAction<string[]>) => {
      state.availableNetworkIds = action.payload
    },
    toggleAvailableNetwork: (state, action: PayloadAction<string>) => {
      const networkId = action.payload
      if (!state.availableNetworkIds) {
        state.availableNetworkIds = []
      }
      if (state.availableNetworkIds.includes(networkId)) {
        state.availableNetworkIds = state.availableNetworkIds.filter((id) => id !== networkId)
        logger.info('Removed network from available', { networkId, remaining: state.availableNetworkIds })
      } else {
        state.availableNetworkIds.push(networkId)
        logger.info('Added network to available', { networkId, total: state.availableNetworkIds.length })
      }
    },
    clearAvailableNetworks: (state) => {
      state.availableNetworkIds = []
    }
  },
  selectors: {
    getAvailableNetworks: (state) => {
      return state.networks.filter((network) => state.availableNetworkIds.includes(network.id))
    },
    getAllNetworks: (state) => state.networks,
    getAvailableNetworkIds: (state) => state.availableNetworkIds
  }
})

export const {
  setNetworks,
  addNetwork,
  updateNetwork,
  deleteNetwork,
  setAvailableNetworkIds,
  toggleAvailableNetwork,
  clearAvailableNetworks
} = openagentsSlice.actions

// Export the generated selectors from the slice
export const { getAvailableNetworks, getAllNetworks, getAvailableNetworkIds } = openagentsSlice.selectors

// Type-safe selector for accessing this slice from the root state
export const selectOpenAgents = (state: { openagents: OpenAgentsConfig }) => state.openagents

export { openagentsSlice }
// Export the reducer as default export
export default openagentsSlice.reducer
