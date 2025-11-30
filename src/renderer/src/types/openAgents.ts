/**
 * OpenAgents API types
 */

export interface NetworkProfile {
  name: string
  description: string
  icon: string
  website: string
  required_openagents_version: string
  mods: string[]
  connection: {
    type: string
    endpoint: string
  }
  discoverable: boolean
  tags: string[]
  categories: string[]
  country: string
  capacity: number
  authentication: {
    type: string
    federation: string
  }
  host: string
  port: number
}

export interface NetworkConnection {
  name?: string
  description?: string
  icon?: string
  country?: string
  endpoint?: string
  host?: string
  type?: string
  port?: number
  discoverable?: boolean
  required_openagents_version?: string
  mods?: string[]
}

export interface NetworkAuthentication {
  capacity: number
  type?: string
  federation?: string
}

export interface NetworkStats {
  online_agents: number
  views: number
  likes: number
}

export type NetworkStatus = 'online' | 'offline' | 'disabled'

export interface Network {
  id: string
  org: string
  org_id: string
  profile: NetworkProfile
  connection: NetworkConnection
  stats: NetworkStats
  status: NetworkStatus
  createdAt?: string
  updatedAt?: string
}

export interface NetworksPagination {
  page: number
  page_size: number
  total: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface NetworksResponseData {
  items: Network[]
  pagination: NetworksPagination
}

export interface NetworksApiResponse {
  code: number
  message: string
  data: NetworksResponseData
}

export interface NetworkQueryParams {
  tags?: string
  categories?: string
  org?: string
  q?: string
  sort?: string
  status?: string
  page?: number
  page_size?: number
  skip_total?: boolean
  compat_list?: boolean
}
