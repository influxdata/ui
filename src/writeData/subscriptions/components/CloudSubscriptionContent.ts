// Graphics
import MQTTLogo from 'src/writeData/subscriptions/graphics/mqtt.svg'

// Types
export interface Subscriptions {
  id: string
  name: string
  image?: string
}

export const CLOUD_NAIVE_SUBSCRIPTIONS: Subscriptions[] = [
  {
    id: 'mqtt',
    name: 'Native MQTT',
    image: MQTTLogo,
  },
]

export const search = (term: string): Subscriptions[] =>
  CLOUD_NAIVE_SUBSCRIPTIONS.filter(item =>
    item.name.toLowerCase().includes(term.toLowerCase())
  )
