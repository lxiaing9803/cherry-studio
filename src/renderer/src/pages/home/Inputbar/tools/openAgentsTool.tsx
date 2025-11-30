import { defineTool, registerTool, TopicType } from '@renderer/pages/home/Inputbar/types'

import OpenAgentsButton from './components/OpenAgentsButton'

const openAgentsTool = defineTool({
  key: 'openagents',
  label: (t) => t('openagents.settings.title'),
  visibleInScopes: [TopicType.Chat],
  render: ({ assistant, quickPanel }) => <OpenAgentsButton assistantId={assistant.id} quickPanel={quickPanel} />
})

registerTool(openAgentsTool)

export default openAgentsTool
