// Constants
import CloudNativeMarkdown from 'src/writeData/subscriptions/components/CloudNative.md'

// Graphics
import MQTTLogo from 'src/writeData/subscriptions/graphics/mqtt.svg'

// Types
export interface Connections {
  id: string
  name: string
  image?: string
  markdown?: string
}

export const CLOUD_NAIVE_CONNECTIONS: Connections[] = [
  {
    id: 'mqtt',
    name: 'MQTT Consumer',
    image: MQTTLogo,
    markdown: CloudNativeMarkdown,
  },
]

export const search = (term: string): Connections[] =>
  CLOUD_NAIVE_CONNECTIONS.filter(item =>
    item.name.toLowerCase().includes(term.toLowerCase())
  )
