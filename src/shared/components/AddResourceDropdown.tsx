// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  IconFont,
  ComponentColor,
  ComponentSize,
  Dropdown,
  ComponentStatus,
} from '@influxdata/clockface'

// Actions
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Types
import {LimitStatus} from 'src/cloud/actions/limits'

// Constants
import {CLOUD} from 'src/shared/constants'

interface OwnProps {
  onSelectNew: () => void
  onSelectImport?: () => void
  onSelectTemplate?: () => void
  resourceName: string
  limitStatus?: LimitStatus['status']
}

interface DefaultProps {
  status: ComponentStatus
  titleText: string
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = OwnProps & DefaultProps & ReduxProps

class AddResourceDropdown extends PureComponent<Props> {
  public static defaultProps: DefaultProps = {
    status: ComponentStatus.Default,
    titleText: null,
  }

  public render() {
    const {titleText, status} = this.props
    return (
      <Dropdown
        style={{width: this.props.resourceName === 'Task' ? '180px' : '232px'}}
        testID="add-resource-dropdown"
        button={(active, onClick) => (
          <Dropdown.Button
            testID="add-resource-dropdown--button"
            active={active}
            onClick={onClick}
            color={ComponentColor.Primary}
            size={ComponentSize.Small}
            icon={IconFont.Plus_New}
            status={status}
            style={{textTransform: 'uppercase', letterSpacing: '0.07em'}}
          >
            {titleText || `Create ${this.props.resourceName}`}
          </Dropdown.Button>
        )}
        menu={onCollapse => (
          <Dropdown.Menu
            onCollapse={onCollapse}
            testID="add-resource-dropdown--menu"
          >
            {this.optionItems}
          </Dropdown.Menu>
        )}
      >
        {this.optionItems}
      </Dropdown>
    )
  }

  private get optionItems(): JSX.Element[] {
    const importOption = this.importOption
    const newOption = this.newOption
    const templateOption = this.templateOption
    const fromDashboard = this.props.resourceName === 'Dashboard'

    const templateFromDashboard = (
      <Dropdown.Item
        id={templateOption}
        key={templateOption}
        onClick={this.handleSelect}
        value={templateOption}
        testID="add-resource-dropdown--template"
      >
        {templateOption}
      </Dropdown.Item>
    )

    const items = [
      <Dropdown.Item
        id={newOption}
        key={newOption}
        onClick={this.handleSelect}
        value={newOption}
        testID="add-resource-dropdown--new"
      >
        {newOption}
      </Dropdown.Item>,
      <Dropdown.Item
        id={importOption}
        key={importOption}
        onClick={this.handleSelect}
        value={importOption}
        testID="add-resource-dropdown--import"
      >
        {importOption}
      </Dropdown.Item>,
      ...(fromDashboard ? [templateFromDashboard] : []),
    ]

    return items
  }

  private get newOption(): string {
    return `New ${this.props.resourceName}`
  }

  private get importOption(): string {
    return `Import ${this.props.resourceName}`
  }

  private get templateOption(): string {
    return `Add a Template`
  }

  private handleLimit = (): void => {
    const {resourceName, onShowOverlay, onDismissOverlay} = this.props
    onShowOverlay('asset-limit', {asset: `${resourceName}s`}, onDismissOverlay)
  }

  private handleSelect = (selection: string): void => {
    const {
      onSelectNew,
      onSelectImport,
      onSelectTemplate,
      limitStatus = 'ok',
    } = this.props

    if (CLOUD && limitStatus === 'exceeded') {
      this.handleLimit()
      return
    }

    if (selection === this.newOption) {
      onSelectNew()
    }
    if (selection === this.importOption) {
      onSelectImport()
    }
    if (selection == this.templateOption) {
      onSelectTemplate()
    }
  }
}

const mdtp = {
  onShowOverlay: showOverlay,
  onDismissOverlay: dismissOverlay,
}

const connector = connect(null, mdtp)

export default connector(AddResourceDropdown)
