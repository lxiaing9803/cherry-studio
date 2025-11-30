import { Input } from 'antd'
import { Search } from 'lucide-react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface NetworkSearchProps {
  value: string
  onChange: (value: string) => void
}

const NetworkSearch: FC<NetworkSearchProps> = ({ value, onChange }) => {
  const { t } = useTranslation()

  return (
    <SearchContainer>
      <Input
        prefix={<Search size={16} />}
        placeholder={t('openagents.settings.search_placeholder', '搜索网络名称...')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        allowClear
        style={{ marginBottom: 16 }}
      />
    </SearchContainer>
  )
}

const SearchContainer = styled.div`
  margin-bottom: 16px;
`

export default NetworkSearch
