import OpenAgentsLogo from '@renderer/assets/images/apps/openagents.png'
import OpenAgentsBlackLogo from '@renderer/assets/images/apps/openagents_black.png'
import styled from 'styled-components'

interface OpenAgentsIconProps {
  size?: number
  color?: 'white' | 'black'
  active?: boolean
}

const OpenAgentsLogoMap = {
  white: OpenAgentsLogo,
  black: OpenAgentsBlackLogo
}

const OpenAgentsIcon: React.FC<OpenAgentsIconProps> = ({ size = 16, color = 'white', active = false }) => {
  return (
    <IconWrapper $active={active}>
      <img src={OpenAgentsLogoMap[color]} alt="OpenAgents" style={{ width: size, height: size }} />
    </IconWrapper>
  )
}

const IconWrapper = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  ${({ $active }) =>
    $active &&
    `
    img {
      filter: brightness(0) saturate(100%) invert(52%) sepia(76%) saturate(733%) hue-rotate(106deg) brightness(95%) contrast(101%);
    }
  `}
`

export default OpenAgentsIcon
