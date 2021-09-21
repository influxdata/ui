// Libraries
import React, {Component} from 'react'
import {isEmpty, capitalize} from 'lodash'

// Clockface
import {Accordion} from '@influxdata/clockface'
import {ResourceAccordionHeader} from 'src/authorizations/components/redesigned/ResourceAccordionHeader'
import {ResourceAccordionBody} from 'src/authorizations/components/redesigned/ResourceAccordionBody'

interface OwnProps {
  resources: string[]
  permissions: any
  onToggleAll: (resourceName: string, permission: string) => void
  onIndividualToggle: (
    resourceName: string,
    id: number,
    permission: string
  ) => void
}

class ResourceAccordion extends Component<OwnProps> {
  public render() {
    const {resources, permissions, onToggleAll} = this.props

    if (!resources || isEmpty(permissions)) {
      return null
    }

    return resources.map(resource => {
      const resourceName = capitalize(resource)

      return (
        <Accordion key={resource}>
          <ResourceAccordionHeader
            resourceName={resourceName}
            permissions={permissions[resource]}
            onToggleAll={onToggleAll}
            disabled={false}
          />
          
            
              {!isEmpty(permissions[resource].sublevelPermissions) &&
                this.getAccordionBody(resourceName, resource)}
            
          
        </Accordion>
      )
    })
  }

  getAccordionBody = (resourceName, resource) => {
    const {permissions, onIndividualToggle} = this.props
    if (resourceName === 'Telegrafs') {
      return (
        <ResourceAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          onToggle={onIndividualToggle}
          title="Individual Telegraf Configuration Names"
          disabled={false}
        />
      )
    } else if (resourceName === 'Buckets') {
      return (
        <ResourceAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          onToggle={onIndividualToggle}
          title="Individual Bucket Names"
          disabled={false}
        />
      )
    }
  }
}

export default ResourceAccordion
