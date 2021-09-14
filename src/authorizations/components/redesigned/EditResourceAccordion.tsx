// Libraries
import React, {Component} from 'react'
import {isEmpty} from 'lodash'

import {Accordion} from '@influxdata/clockface'

import {ResourceAccordionHeader} from './ResourceAccordionHeader'
import GetResources from 'src/resources/components/GetResources'
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

    return <>{this.getAccordionHeader()}</>
  }

  getAccordionHeader = () => {
    const {permissions} = this.props

    return Object.keys(permissions).map(key => {
      const resourceName = key.charAt(0).toUpperCase() + key.slice(1)
      console.log('resourceName: ', resourceName)
      return (
        <Accordion key={key}>
          <ResourceAccordionHeader
            resourceName={resourceName}
            permissions={permissions[key]} // props.bucketPermissions
            onToggleAll={(random, blah) => console.log('ahhh')}
          />
          {/* {resourceName === 'Telegrafs' ||
              (resourceName === 'Buckets' && (
                  !isEmpty(permissions[key].sublevelPermissions) &&
                    this.getAccordionBody(resourceName, key)
              ))} */}
        </Accordion>
      )
    })
  }
}

// getAccordionBody = (resourceName, resource) => {
//   const {permissions} = this.props
//   if (resourceName === 'Telegrafs') {
//     return (
//       <ResourceAccordionBody
//         resourceName={resource}
//         permissions={permissions[resource].sublevelPermissions}
//         onToggle={this.handleIndividualToggle}
//         title="Individual Telegraf Configuration Names"
//       />
//     )
//   } else if (resourceName === 'Buckets') {
//     return (
//       <ResourceAccordionBody
//         resourceName={resource}
//         permissions={permissions[resource].sublevelPermissions}
//         onToggle={this.handleIndividualToggle}
//         title="Individual Bucket Names"
//       />
//     )
//   }
