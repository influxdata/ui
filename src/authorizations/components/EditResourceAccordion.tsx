// Libraries
import React, {Component} from 'react'
import {isEmpty, capitalize} from 'lodash'

import {Accordion} from '@influxdata/clockface'

import {ResourceAccordionHeader} from 'src/authorizations/components/ResourceAccordionHeader'
import {IndividualAccordionBody} from 'src/authorizations/components/IndividualAccordionBody'
import {AllAccordionBody} from './AllAccordionBody'
import {formatResources} from 'src/authorizations/utils/permissions'
import {FilterListContainer} from 'src/shared/components/FilterList'

// Types
import {Resource} from 'src/client'
interface Props {
  permissions: any
  searchTerm: string
}

const Filter = FilterListContainer<Resource>()
export class EditResourceAccordion extends Component<Props> {
  public render() {
    const {permissions} = this.props
    if (!permissions || isEmpty(permissions)) {
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
                {this.hideAllAccordion(permissions[resource]) ? null : (
                  <AllAccordionBody
                    resourceName={resourceName}
                    permissions={permissions[resource]}
                    disabled={true}
                  />
                )}
                {this.hideAccordionBody(permissions[resource])
                  ? this.getAccordionBody(resourceName, resource)
                  : null}
              </Accordion>
            )
          }
        })}
        {!isEmpty(allResourceNames[1]) && (
          <Accordion key="Other Resources" expanded={true}>
            <ResourceAccordionHeader resourceName="Other Resources" />
            {this.getOtherResourceAccordionBody(allResourceNames)}
          </Accordion>
        )}
      </>
    )
  }

  hideAllAccordion = resource => {
    // if all resource read or all resource write is selected then don't hide all accordion body
    if (!resource.read && !resource.write) {
      return true
    }
    return false
  }

  hideAccordionBody = resource => {
    // if all resource read and all resource write is selected then collapse accordion body
    if (resource.read && resource.write) {
      return false
    } else if (isEmpty(resource.sublevelPermissions)) {
      return false
    }
    return true
  }

  getOtherResourceAccordionBody = allResourceNames => {
    const {permissions, searchTerm} = this.props
    const resourcePermissions = []
    allResourceNames[1].forEach(resource => {
      resourcePermissions.push({name: resource, perm: permissions[resource]})
    })
    return (
      <Filter
        list={resourcePermissions}
        searchTerm={searchTerm}
        searchKeys={['name']}
      >
        {filteredNames => (
          <AllAccordionBody
            resourceName="All Resources"
            permissions={filteredNames}
            disabled={true}
          />
        )}
      </Filter>
    )
  }

  getAccordionBody = (resourceName, resource) => {
    const {permissions, searchTerm} = this.props
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
          searchTerm={searchTerm}
          searchKeys={['name']}
        >
          {filteredNames => (
            <IndividualAccordionBody
              resourceName={resource}
              permissions={filteredNames}
              disabled={true}
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
          searchTerm={searchTerm}
          searchKeys={['name']}
        >
          {filteredNames => (
            <IndividualAccordionBody
              resourceName={resource}
              permissions={filteredNames}
              disabled={true}
            />
          )}
        </Filter>
      )
    }
  }
}
