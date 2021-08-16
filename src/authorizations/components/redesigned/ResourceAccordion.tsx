// Libraries
import React, {Component} from 'react'

// Clockface
import {Accordion} from '@influxdata/clockface'
import {ResourceAccordionHeader} from './ResourceAccordionHeader'
import GetResources from 'src/resources/components/GetResources'
import {ResourceAccordionBody} from './ResourceAccordionBody'

// Types
import {AppState, Telegraf, ResourceType} from 'src/types'

// Selectors
import {getAll} from 'src/resources/selectors'
import {connect} from 'react-redux'
import {Bucket} from 'src/client'

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
  bucketPermissions: any
}

type Props = OwnProps & StateProps

class ResourceAccordion extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      permissions: {
        telegrafs: props.telegrafPermissions,
        buckets: props.bucketPermissions,
      },
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.telegrafPermissions) {
      return null
    }
    return {
      ...state,
      permissions: {
        telegrafs: props.telegrafPermissions,
        buckets: props.bucketPermissions,
      },
    }
  }

  public render() {
    const {resources} = this.props
    const {permissions} = this.state

    if (resources) {
      return resources.map(resource => {
        const resourceName =
          resource.charAt(0).toUpperCase() + resource.slice(1)
        return (
          <Accordion key={resource}>
            <ResourceAccordionHeader
              resourceName={resourceName}
              permissions={permissions[resource]}
              onToggleAll={this.handleToggleAll}
            />
            <GetResources resources={[ResourceType[resourceName]]}>
              {resourceName === 'Telegrafs' ? (
                <ResourceAccordionBody
                  resourceName={resource}
                  permissions={permissions[resource]}
                  onToggle={this.handleIndividualToggle}
                  title="Individual Telegraf Configuration Names"
                />
              ) : (
                <ResourceAccordionBody
                  resourceName={resource}
                  permissions={permissions[resource]}
                  onToggle={this.handleIndividualToggle}
                  title="Individual Bucket Names"
                />
              )}
            </GetResources>
          </Accordion>
        )
      })
    }
    return null
  }

  handleToggleAll = (resourceName, permission, value) => {
    const {permissions} = this.state
    const newPerm = {...permissions}
    const name = resourceName.toLowerCase()
    Object.keys(newPerm[name]).map(key => {
      newPerm[name][key].permissions[permission] = !value
    })
    this.setState({
      permissions: newPerm,
    })
  }

  handleIndividualToggle = (resourceName, id, permission) => {
    const {permissions} = this.state

    const permValue = permissions[resourceName][id].permissions[permission]

    const newPerm = {...permissions}
    newPerm[resourceName][id].permissions[permission] = !permValue

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

  const buckets = getAll<Bucket>(state, ResourceType.Buckets)
  const bucketPermissions = {}
  buckets.forEach(b => {
    bucketPermissions[b.id] = {
      id: b.id,
      orgID: b.orgID,
      name: b.name,
      permissions: {read: false, write: false},
    }
  })

  return {telegrafPermissions, bucketPermissions}
}

export default connect<StateProps>(mstp, null)(ResourceAccordion)
