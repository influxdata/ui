// Libraries
import React, {Component} from 'react'

// Clockface
import {Accordion} from '@influxdata/clockface'
import {ResourceAccordionHeader} from './ResourceAccordionHeader'
import GetResources from 'src/resources/components/GetResources'
import TelegrafAccordion from './TelegrafAccordion'
import BucketAccordion from './BucketAccordion'
// Types
import {AppState, Telegraf, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'
import {connect} from 'react-redux'

export type ReadWritePermissions = {
  read: boolean
  write: boolean
}
export type SublevelPermissions = {
  [x: string]: ReadWritePermissions
}

interface OwnProps {
  resources: string[] // ["te;egrafas", "buckets"]...
}
interface State {
  permissions: any // {buckets: [], telegrafs: { 23424: {ird: orgID: name: permissions: {read: boolean, write: boolean}}}}
}
interface StateProps {
  telegrafPermissions: any
}

type Props = OwnProps & StateProps

class ResourceAccordion extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      permissions: {
        telegrafs: props.telegrafPermissions,
      },
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.telegrafPermissions) {
      return null
    }
    console.log('derived Stazte: ', props.telegrafPermissions)
    return {
      ...state,
      permissions: {
        telegrafs: props.telegrafPermissions,
      },
    }
  }

  public render() {
    const {resources} = this.props
    const {permissions} = this.state
    console.log('resource permissions: ', permissions)

    return resources.map(resource => {
      const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1)
      return (
        <GetResources key={resource} resources={[ResourceType[resourceName]]}>
          <Accordion>
            <ResourceAccordionHeader
              resourceName={resourceName}
              permissions={permissions[resource]}
              onToggleAll={this.handleToggleAll}
            />
            {resourceName === 'Telegrafs' ? (
              <TelegrafAccordion
                permissions={permissions[resource]}
                onToggle={this.handleTelegrafToggle}
              />
            ) : (
              <BucketAccordion />
            )}
          </Accordion>
        </GetResources>
      )
    })
  }

  handleToggleAll = (resourceName, permission, value) => {
    // const {permissions} = this.state
    // const newPerm = {...permissions}
    // const name = resourceName.toLowerCase()
    // Object.keys(newPerm[name]).map(key => {
    //   newPerm[name][key].permissions[permission] = !value
    // })
    // this.setState({
    //   permissions: newPerm,
    // })
  }

  handleTelegrafToggle = (id, permission) => {
    const {permissions} = this.state
    const {
      permissions: {telegrafs},
    } = this.state

    const permValue = telegrafs[id].permissions[permission]

    const newPerm = {...permissions}
    newPerm.telegrafs[id].permissions[permission] = !permValue

    console.log(newPerm)
    this.setState({
      permissions: newPerm,
    })
  }
}

const mstp = (state: AppState) => {
  const telegrafs = getAll<Telegraf>(state, ResourceType.Telegrafs)
  const telegrafPermissions = {}
  telegrafs.forEach(t => {
    telegrafPermissions[t.id] = {
      id: t.id,
      orgID: t.orgID,
      name: t.name,
      permissions: {read: false, write: false},
    }
  })

  console.log('telegraf permissions mstp: ', telegrafPermissions)
  return {telegrafPermissions}
}

export default connect<StateProps>(mstp, null)(ResourceAccordion)
