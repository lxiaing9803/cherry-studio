import OpenAgentsLogo from '@renderer/assets/images/apps/openagents.png'
import OpenAgentsBlackLogo from '@renderer/assets/images/apps/openagents_black.png'

interface OpenAgentsIconProps {
  size?: number
  color?:'white'|'black'
}

const OpenAgentsLogoMap = {
  white: OpenAgentsLogo,
  black: OpenAgentsBlackLogo
}

const OpenAgentsIcon:React.FC<OpenAgentsIconProps> = ({ size = 16,color = 'white' }) => {
  return (
    <img src={OpenAgentsLogoMap[color]} alt="OpenAgents" style={{ width: size, height: size }} />
  )
}

export default OpenAgentsIcon
