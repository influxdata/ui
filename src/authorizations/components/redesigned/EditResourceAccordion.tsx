// Libraries
import React, {Component} from 'react'
import {isEmpty, capitalize} from 'lodash'

import {Accordion} from '@influxdata/clockface'

import {ResourceAccordionHeader} from 'src/authorizations/components/redesigned/ResourceAccordionHeader'
import {IndividualAccordionBody} from 'src/authorizations/components/redesigned/IndividualAccordionBody'
import {AllAccordionBody} from './AllAccordionBody'
import {formatResources} from 'src/authorizations/utils/permissions'

interface Props {
  permissions: any
}

export class EditResourceAccordion extends Component<Props> {
  public render() {
    const {permissions} = this.props
    if (!permissions) {
      return null
    }
    const allResourceNames = formatResources(Object.keys(permissions))

    return (
      <>
        {allResourceNames[0].map(resource => {
          if (!permissions[resource]) {
            return
          }
          const resourceName = capitalize(resource)
          if (resourceName === 'Telegrafs' || resourceName === 'Buckets') {
            return (
              <Accordion key={resource} expanded={true}>
                <ResourceAccordionHeader resourceName={resourceName} />
                {isEmpty(permissions[resource].sublevelPermissions) ? (
                  <AllAccordionBody
                    resourceName={resourceName}
                    permissions={permissions[resource]}
                    disabled={true}
                  />
                ) : (
                  this.getAccordionBody(resourceName, resource)
                )}
              </Accordion>
            )
          }
        })}
        {!isEmpty(allResourceNames[1]) && (
          <Accordion key="Other Resources" expanded={true}>
            <ResourceAccordionHeader resourceName="Other Resources" />
            {allResourceNames[1].map(resource => {
              const resourceName =
                resource.charAt(0).toUpperCase() + resource.slice(1)

              return (
                <>
                  <AllAccordionBody
                    resourceName={resourceName}
                    permissions={permissions[resource]}
                    disabled={true}
                  />
                </>
              )
            })}
          </Accordion>
        )}
      </>
    )
  }

  getAccordionBody = (resourceName, resource) => {
    const {permissions} = this.props
    if (resourceName === 'Telegrafs') {
      return (
        <IndividualAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          title="Individual Telegraf Configuration Names"
          disabled={true}
        />
      )
    } else if (resourceName === 'Buckets') {
      return (
        <IndividualAccordionBody
          resourceName={resource}
          permissions={permissions[resource].sublevelPermissions}
          title="Individual Bucket Names"
          disabled={true}
        />
      )
    }
  }
}
