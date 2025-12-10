import { loggerService } from '@logger'
import type { Network, NetworkQueryParams,NetworksApiResponse } from '@renderer/types'
import axios from 'axios'

const logger = loggerService.withContext('OpenAgentsService')

const OPENAGENTS_API_BASE = 'https://endpoint.openagents.org/v1'

/**
 * OpenAgents Network Service
 * 封装 OpenAgents API 调用
 */
class OpenAgentsService {
  /**
   * 获取 OpenAgents 网络列表
   * @param params 查询参数
   * @returns Network 数组
   */
  async getNetworks(params?: NetworkQueryParams): Promise<Network[]> {
    try {
      const response = await axios.get<NetworksApiResponse>(`${OPENAGENTS_API_BASE}/networks`, {
        params: {
          page: 1,
          page_size: 200,
          status: 'online',
          ...params
        }
      })

      const networksData = response.data?.data?.items || []

      if (!Array.isArray(networksData)) {
        logger.warn('Unexpected API response structure', {
          data: response.data
        })
        return []
      }

      logger.info('Fetched networks', { count: networksData.length })
      return networksData
    } catch (error) {
      logger.error('Failed to fetch networks', error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * 根据 ID 获取单个网络详情
   * @param networkId 网络 ID
   * @returns Network 或 null
   */
  async getNetworkById(networkId: string): Promise<Network | null> {
    try {
      const networks = await this.getNetworks()
      const network = networks.find((n) => n.id === networkId)
      return network || null
    } catch (error) {
      logger.error('Failed to fetch network by id', error instanceof Error ? error : new Error(String(error)))
      return null
    }
  }

  /**
   * 搜索网络
   * @param searchText 搜索文本
   * @returns Network 数组
   */
  async searchNetworks(searchText: string): Promise<Network[]> {
    try {
      return await this.getNetworks({ q: searchText })
    } catch (error) {
      logger.error('Failed to search networks', error instanceof Error ? error : new Error(String(error)))
      return []
    }
  }

  /**
   * 按标签筛选网络
   * @param tags 标签字符串（逗号分隔）
   * @returns Network 数组
   */
  async getNetworksByTags(tags: string): Promise<Network[]> {
    try {
      return await this.getNetworks({ tags })
    } catch (error) {
      logger.error('Failed to get networks by tags', error instanceof Error ? error : new Error(String(error)))
      return []
    }
  }

  /**
   * 按分类筛选网络
   * @param categories 分类字符串（逗号分隔）
   * @returns Network 数组
   */
  async getNetworksByCategories(categories: string): Promise<Network[]> {
    try {
      return await this.getNetworks({ categories })
    } catch (error) {
      logger.error('Failed to get networks by categories', error instanceof Error ? error : new Error(String(error)))
      return []
    }
  }
}

export const openAgentsService = new OpenAgentsService()
export default openAgentsService
