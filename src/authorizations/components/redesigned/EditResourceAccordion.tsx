// Libraries
import React, {Component} from 'react'
import {isEmpty} from 'lodash'

import {Accordion} from '@influxdata/clockface'

import {ResourceAccordionHeader} from './ResourceAccordionHeader'
import {ResourceAccordionBody} from './ResourceAccordionBody'

interface Props {
  permissions: any
}

export class EditResourceAccordion extends Component<Props, {}> {
  public render() {
    const {permissions} = this.props
    if (!permissions) {
      return null
    }

    return Object.keys(permissions).map(key => {
      const resourceName = key.charAt(0).toUpperCase() + key.slice(1)
      console.log('resourceName: ', resourceName)
      return (
        <Accordion key={key}>
          <ResourceAccordionHeader
            resourceName={resourceName}
            permissions={permissions[key]}
            onToggleAll={(random, blah) => console.log('ahhh')}
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
          onToggle={(random, blah) => console.log('ahhh')}
          title="Individual Telegraf Configuration Names"
          disabled={true}
        />
      )
    } else if (resourceName === 'Buckets') {
      return (
        <ResourceAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          onToggle={(random, blah) => console.log('ahhh')}
          title="Individual Bucket Names"
          disabled={true}
        />
      )
    }
  }
}
