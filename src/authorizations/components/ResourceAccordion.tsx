// Libraries
import React, {Component} from 'react'
import {isEmpty} from 'lodash'
import 'src/authorizations/components/customApiTokenOverlay.scss'

// Clockface
import {Accordion, DapperScrollbars} from '@influxdata/clockface'

// Components
import {ResourceAccordionHeader} from 'src/authorizations/components/ResourceAccordionHeader'
import {AllAccordionBody} from 'src/authorizations/components/AllAccordionBody'
import {IndividualAccordionBody} from 'src/authorizations/components/IndividualAccordionBody'
import {FilterListContainer} from 'src/shared/components/FilterList'

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

const Filter = FilterListContainer<Resource>()

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
              <DapperScrollbars
                autoHide={true}
                autoSize={true}
                // this width is max-width of modal - padding left and right
                style={{width: '100%', maxWidth: '752px', maxHeight: '300px'}}
              >
                <AllAccordionBody
                  resourceName={resourceName}
                  permissions={permissions[resource]}
                  onToggleAll={onToggleAll}
                  disabled={false}
                />
                {this.isCollapsible(resource)
                  ? !isEmpty(permissions[resource].sublevelPermissions) &&
                    this.getAccordionBody(resourceName, resource)
                  : null}
              </DapperScrollbars>
            </Accordion>
          )
        })}
        <Accordion key="Other Resources">
          <ResourceAccordionHeader resourceName="Other Resources" />
          <DapperScrollbars
            autoHide={true}
            autoSize={true}
            // this width is max-width of modal - padding left and right
            style={{width: '100%', maxWidth: '752px', maxHeight: '300px'}}
          >
            <AllAccordionBody
              resourceName="Other Resources"
              permissions={permissions.otherResources}
              onToggleAll={onToggleAll}
              disabled={false}
            />
            {this.isCollapsible('otherResources')
              ? this.otherResourcesAccordionBody()
              : null}
          </DapperScrollbars>
        </Accordion>
      </>
    )
  }

  isCollapsible = resource => {
    const {permissions} = this.props
    // if all resource read and all resource write is selected then collapse accordion body
    if (permissions[resource].read && permissions[resource].write) {
      return false
    }
    return true
  }

  otherResourcesAccordionBody = () => {
    const {onToggleAll, resources, permissions} = this.props
    const resourcePermissions = []

    resources[1].forEach(resource => {
      resourcePermissions.push({name: resource, perm: permissions[resource]})
    })

    return (
      <Filter
        list={resourcePermissions}
        searchTerm={this.props.searchTerm}
        searchKeys={['name']}
      >
        {filteredNames => (
          <AllAccordionBody
            resourceName="All Resources"
            permissions={filteredNames}
            onToggleAll={onToggleAll}
            disabled={false}
          />
        )}
      </Filter>
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
