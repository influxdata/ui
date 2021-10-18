// Libraries
import React, {Component} from 'react'
import {isEmpty} from 'lodash'

// Clockface
import {Accordion} from '@influxdata/clockface'

// Components
import {ResourceAccordionHeader} from 'src/authorizations/components/redesigned/ResourceAccordionHeader'
import {AllAccordionBody} from 'src/authorizations/components/redesigned/AllAccordionBody'
import {IndividualAccordionBody} from 'src/authorizations/components/redesigned/IndividualAccordionBody'
import FilterList from 'src/shared/components/FilterList'

// Types
import {Resource} from 'src/client'

interface OwnProps {
  resources: string[][]
  permissions: any
  onToggleAll: (resourceName: string, permission: string) => void
  onIndividualToggle: (
    resourceName: string,
    id: number,
    permission: string
  ) => void
  searchTerm: string
}

const Filter = FilterList<Resource>()

class ResourceAccordion extends Component<OwnProps> {
  public render() {
    const {resources, permissions, onToggleAll} = this.props

    if (!resources || isEmpty(permissions)) {
      return null
    }

    return (
      <>
        {resources[0].map(resource => {
          const resourceName =
            resource.charAt(0).toUpperCase() + resource.slice(1)

          return (
            <Accordion key={resource}>
              <ResourceAccordionHeader resourceName={resourceName} />
              <AllAccordionBody
                resourceName={resourceName}
                permissions={permissions[resource]}
                onToggleAll={onToggleAll}
                disabled={false}
              />
              {!permissions[resource].read && !permissions[resource].write
                ? !isEmpty(permissions[resource].sublevelPermissions) &&
                  this.getAccordionBody(resourceName, resource)
                : null}
            </Accordion>
          )
        })}
        <Accordion key="Other Resources">
          <ResourceAccordionHeader resourceName="Other Resources" />
          <AllAccordionBody
            resourceName="Other Resources"
            permissions={permissions.otherResources}
            onToggleAll={onToggleAll}
            disabled={false}
          />
          {!permissions.otherResources.read && !permissions.otherResources.write
            ? resources[1].map(resource => {
                const resourceName =
                  resource.charAt(0).toUpperCase() + resource.slice(1)

                return (
                  <AllAccordionBody
                    key={resource}
                    resourceName={resourceName}
                    permissions={permissions[resource]}
                    onToggleAll={onToggleAll}
                    disabled={false}
                  />
                )
              })
            : null}
        </Accordion>
      </>
    )
  }

  getAccordionBody = (resourceName, resource) => {
    const {permissions, onIndividualToggle} = this.props
    const permissionNames = []
    if (resourceName === 'Telegrafs') {
      for (const [, value] of Object.entries(
        permissions[resource].sublevelPermissions
      )) {
        permissionNames.push(value)
      }
      return (
        <Filter
          list={permissionNames}
          searchTerm={this.props.searchTerm}
          searchKeys={['name']}
        >
          {filteredNames => (
            <IndividualAccordionBody
              resourceName={resource}
              permissions={filteredNames}
              onToggle={onIndividualToggle}
              title="Individual Telegraf Configuration Names"
              disabled={false}
            />
          )}
        </Filter>
      )
    } else if (resourceName === 'Buckets') {
      for (const [, value] of Object.entries(
        permissions[resource].sublevelPermissions
      )) {
        permissionNames.push(value)
      }
      return (
        <Filter
          list={permissionNames}
          searchTerm={this.props.searchTerm}
          searchKeys={['name']}
        >
          {filteredNames => (
            <IndividualAccordionBody
              resourceName={resource}
              permissions={filteredNames}
              onToggle={onIndividualToggle}
              title="Individual Bucket Names"
              disabled={false}
            />
          )}
        </Filter>
      )
    }
  }
}

export default ResourceAccordion
