import {PureComponent, ReactNode} from 'react'
import {ResourceType} from 'src/types'

interface Props {
  resources: Array<ResourceType>
  children: ReactNode
}

export default class FluxMonacoEditor extends PureComponent<Props> {
  render() {
    return this.props.children
  }
}
