// Libraries
import React, {Component} from 'react'
import {isEmpty, capitalize} from 'lodash'

import {Accordion} from '@influxdata/clockface'

import {ResourceAccordionHeader} from 'src/authorizations/components/redesigned/ResourceAccordionHeader'
import {ResourceAccordionBody} from 'src/authorizations/components/redesigned/ResourceAccordionBody'

interface Props {
  permissions: any
}

export class EditResourceAccordion extends Component<Props> {
  public render() {
    const {permissions} = this.props
    if (!permissions) {
      return null
    }

    return Object.keys(permissions).map(key => {
      const resourceName = capitalize(key)
      return (
        <Accordion key={key} expanded={true}>
          <ResourceAccordionHeader
            resourceName={resourceName}
            permissions={permissions[key]}
            disabled={true}
          />
          {resourceName === 'Telegrafs' ||
            (resourceName === 'Buckets' &&
              !isEmpty(permissions[key].sublevelPermissions) &&
              this.getAccordionBody(resourceName, key))}
        </Accordion>
      )
    })
  }

  getAccordionBody = (resourceName, resource) => {
    const {permissions} = this.props
    if (resourceName === 'Telegrafs') {
      return (
        <ResourceAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          title="Individual Telegraf Configuration Names"
          disabled={true}
        />
      )
    } else if (resourceName === 'Buckets') {
      return (
        <ResourceAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          title="Individual Bucket Names"
          disabled={true}
        />
      )
    }
  }
}
