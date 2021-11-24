// Libraries
import React, {Component} from 'react'
import {isEmpty, capitalize} from 'lodash'

import {Accordion} from '@influxdata/clockface'

import {ResourceAccordionHeader} from 'src/authorizations/components/redesigned/ResourceAccordionHeader'
import {IndividualAccordionBody} from 'src/authorizations/components/redesigned/IndividualAccordionBody'
import {AllAccordionBody} from './AllAccordionBody'
import {formatResources} from 'src/authorizations/utils/permissions'
import FilterList from 'src/shared/components/FilterList'

// Types
import {Resource} from 'src/client'

interface Props {
  permissions: any
  searchTerm: string
}

const Filter = FilterList<Resource>()

export class EditResourceAccordion extends Component<Props> {
  public render() {
    const {permissions} = this.props
    if (!permissions) {
      return null
    }
    console.log('permissions from props ', permissions)
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
            {this.getOtherResourceAccordionBody(allResourceNames)}
          </Accordion>
        )}
      </>
    )
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
            resourceName={'All Resources'}
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
              title="Individual Telegraf Configuration Names"
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
              title="Individual Bucket Names"
              disabled={true}
            />
          )}
        </Filter>
      )
    }
  }
}
