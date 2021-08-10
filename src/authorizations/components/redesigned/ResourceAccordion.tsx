// Libraries
import React, {Component} from 'react'

// Clockface
import {Accordion} from '@influxdata/clockface'
import {ResourceAccordionHeader} from './ResourceAccordionHeader'
import {ResourceType} from 'src/types'
import GetResources from 'src/resources/components/GetResources'
import TelegrafAccordion from './TelegrafAccordion'
import BucketAccordion from './BucketAccordion'

export type ReadWritePermissions = {
  read: boolean
  write: boolean
}
export type SublevelPermissions = {
  [x: string]: ReadWritePermissions
}

interface Props {
  resources: string[] // ["te;egrafas", "buckets"]...
}
interface State {
  permissions: any // {buckets: [], telegrafs: { 23424: {ird: orgID: name: permissions: {read: boolean, write: boolean}}}}
}

export class ResourceAccordion extends Component<Props, State> {
  constructor(props) {
    super(props)

    const permission = {}

    props.resources.map(resource => {
      if (resource === 'telegrafs' || resource === 'buckets') {
        permission[resource] = []
      } else {
        permission[resource] = {}
      }
    })

    this.state = {
      permissions: permission,
    }
  }

  public render() {
    const {resources} = this.props
    const {permissions} = this.state
    console.log('resource permissions: ', permissions)

    return resources.map(resource => {
      const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1)
      return (
        <Accordion key={resource}>
          <ResourceAccordionHeader
            resourceName={resourceName}
            permissions={permissions[resource]}
          />
          <GetResources resources={[ResourceType[resourceName]]}>
            {resourceName === 'Telegrafs' ? (
              <TelegrafAccordion
                loadTelegrafs={this.handleTelegrafState}
                permissions={permissions[resource]}
                onToggle={this.handleTelegrafToggle}
              />
            ) : (
              <BucketAccordion />
            )}
          </GetResources>
        </Accordion>
      )
    })
  }

  // TODO: Palak mstp!!

  handleTelegrafState = telegrafs => {
    const telegrafPermissions = {}
    telegrafs.forEach(t => {
      telegrafPermissions[t.id] = {
        id: t.id,
        orgID: t.orgID,
        name: t.name,
        permissions: {read: false, write: false},
      }
    })

    const {permissions} = this.state
    this.setState({
      permissions: {
        ...permissions,
        telegrafs: telegrafPermissions,
      },
    })
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
