// Libraries
import React, {PureComponent} from 'react'

// Components
import {Overlay} from '@influxdata/clockface'
import PermissionsWidget, {
  PermissionsWidgetMode,
  PermissionsWidgetSelection,
} from 'src/shared/components/permissionsWidget/PermissionsWidget'
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Types
import {Authorization, Permission} from 'src/types'

interface Props {
  auth: Authorization
  onDismissOverlay: () => void
}

export default class ViewTokenOverlay extends PureComponent<Props> {
  public render() {
    const {description} = this.props.auth

    const permissions = this.permissions

    return (
      <Overlay.Container maxWidth={830}>
        <Overlay.Header
          title={description}
          onDismiss={this.handleDismiss}
          wrapText={true}
        />
        <Overlay.Body>
          <CodeSnippet
            text={this.props.auth.token}
            label={description}
            type="Token"
          />
          <PermissionsWidget
            mode={PermissionsWidgetMode.Read}
            heightPixels={500}
          >
            {Object.keys(permissions).map(type => {
              return (
                <PermissionsWidget.Section
                  key={type}
                  id={type}
                  title={type}
                  mode={PermissionsWidgetMode.Read}
                >
                  {permissions[type].map((action, i) => (
                    <PermissionsWidget.Item
                      key={i}
                      label={action}
                      id={this.itemID(type, action)}
                      selected={PermissionsWidgetSelection.Selected}
                    />
                  ))}
                </PermissionsWidget.Section>
              )
            })}
          </PermissionsWidget>
        </Overlay.Body>
      </Overlay.Container>
    )
  }

  private get permissions(): {[x: string]: Permission['action'][]} {
    const p = this.props.auth.permissions.reduce((acc, {action, resource}) => {
      const {type} = resource
      const name = resource?.name ?? ''
      let key = `${type}`
      if (name) {
        key = `${type}-${name}`
      }

      let actions = acc?.[key] ?? []

      if (name && actions) {
        return {...acc, [key]: [...actions, action]}
      }

      actions = (acc?.[key] || resource.type) ?? []
      return {...acc, [type]: [...actions, action]}
    }, {})

    return p
  }

  private itemID = (
    permission: string,
    action: Permission['action']
  ): string => {
    return `${permission}-${action}-${permission || '*'}-${permission || '*'}`
  }

  private handleDismiss = () => {
    this.props.onDismissOverlay()
  }
}
