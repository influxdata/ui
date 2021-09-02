// Libraries
import React, {Component} from 'react'
import {isEmpty} from 'lodash'

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

interface OwnProps {
  resources: string[]
}

interface State {
  permissions: any
}

interface StateProps {
  telegrafPermissions: any
  bucketPermissions: any
}

type Props = OwnProps & StateProps

class ResourceAccordion extends Component<Props, State> {
  constructor(props) {
    super(props)
    const perms = {}
    props.resources.map(resource => {
      if (resource === 'telegrafs') {
        perms[resource] = props.telegrafPermissions
      } else if (resource === 'buckets') {
        perms[resource] = props.bucketPermissions
      } else {
        perms[resource] = {read: false, write: false}
      }
    })
    this.state = {
      permissions: perms,
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!props.telegrafPermissions) {
      return null
    }
    const perms = {}
    props.resources.map(resource => {
      if (resource === 'telegrafs') {
        perms[resource] = props.telegrafPermissions
      } else if (resource === 'buckets') {
        perms[resource] = props.bucketPermissions
      } else {
        perms[resource] = {read: false, write: false}
      }
    })
    return {
      ...state,
      permissions: perms,
    }
  }

  public render() {
    const {resources} = this.props
    const {permissions} = this.state

    if (!resources) {
      return null
    }
    return resources.map(resource => {
      const resourceName = resource.charAt(0).toUpperCase() + resource.slice(1)

      return (
        <Accordion key={resource}>
          <ResourceAccordionHeader
            resourceName={resourceName}
            permissions={permissions[resource]}
            onToggleAll={this.handleToggleAll}
          />
          {resourceName === 'Telegrafs' || resourceName === 'Buckets' ? (
            <GetResources resources={[ResourceType[resourceName]]}>
              {!isEmpty(permissions[resource].sublevelPermissions) &&
                this.getAccordionBody(resourceName, resource)}
            </GetResources>
          ) : null}
        </Accordion>
      )
    })
  }

  getAccordionBody = (resourceName, resource) => {
    const {permissions} = this.state
    if (resourceName === 'Telegrafs') {
      return (
        <ResourceAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          onToggle={this.handleIndividualToggle}
          title="Individual Telegraf Configuration Names"
        />
      )
    } else if (resourceName === 'Buckets') {
      return (
        <ResourceAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          onToggle={this.handleIndividualToggle}
          title="Individual Bucket Names"
        />
      )
    } else {
      return null
    }
  }

  handleToggleAll = (resourceName, permission) => {
    const {permissions} = this.state
    const newPerm = {...permissions}
    const name = resourceName.toLowerCase()
    if (newPerm[name].sublevelPermissions) {
      Object.keys(newPerm[name].sublevelPermissions).map(key => {
        newPerm[name].sublevelPermissions[key].permissions[
          permission
        ] = !newPerm[name][permission]
      })
    }
    newPerm[name][permission] = !newPerm[name][permission]

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
  const telegrafPermissions = {
    read: false,
    write: false,
    sublevelPermissions: {},
  }
  telegrafs.forEach(telegraf => {
    telegrafPermissions.sublevelPermissions[telegraf.id] = {
      id: telegraf.id,
      orgID: telegraf.orgID,
      name: telegraf.name,
      permissions: {read: false, write: false},
    }
  })

  const buckets = getAll<Bucket>(state, ResourceType.Buckets)
  const bucketPermissions = {
    read: false,
    write: false,
    sublevelPermissions: {},
  }
  buckets.forEach(bucket => {
    bucketPermissions.sublevelPermissions[bucket.id] = {
      id: bucket.id,
      orgID: bucket.orgID,
      name: bucket.name,
      permissions: {read: false, write: false},
    }
  })

  return {telegrafPermissions, bucketPermissions}
}

export default connect<StateProps>(mstp, null)(ResourceAccordion)
