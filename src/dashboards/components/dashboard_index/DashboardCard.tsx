// Libraries
import React, {createRef, PureComponent, RefObject} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

import {downloadDashboardTemplate} from 'src/dashboards/apis'

// Components
import {
  IconFont,
  ComponentColor,
  ResourceCard,
  FlexBox,
  ComponentSize,
  Appearance,
  ButtonShape,
  ConfirmationButton,
  List,
  Popover,
  SquareButton,
} from '@influxdata/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'

// Actions
import {
  cloneDashboard,
  deleteDashboard,
  updateDashboard,
  addDashboardLabel,
  removeDashboardLabel,
} from 'src/dashboards/actions/thunks'
import {resetViews} from 'src/views/actions/creators'

// Selectors
import {selectIsNewIOxOrg} from 'src/shared/selectors/app'

// Types
import {Label, AppState} from 'src/types'

// Constants
import {DEFAULT_DASHBOARD_NAME} from 'src/dashboards/constants'

// Utilities
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import {shouldOpenLinkInNewTab} from 'src/utils/crossPlatform'
import {safeBlankLinkOpen} from 'src/utils/safeBlankLinkOpen'
import {notify} from 'src/shared/actions/notifications'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {PROJECT_NAME} from 'src/flows'

interface OwnProps {
  id: string
  name: string
  description: string
  updatedAt: string
  labels: string[]
  onFilterChange: (searchTerm: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps & RouteComponentProps<{orgID: string}>

const fontWeight = {fontWeight: '500px'}
const minWidth = {minWidth: '165px'}

class DashboardCard extends PureComponent<Props> {
  public render() {
    const {
      id,
      name,
      description,
      onFilterChange,
      labels,
      updatedAt,
      match: {
        params: {orgID},
      },
    } = this.props

    let dashboardUrl = `/orgs/${orgID}/dashboards/${id}`

    if (isFlagEnabled('boardWithFlows')) {
      dashboardUrl = `/${PROJECT_NAME.toLowerCase()}/from/dashboard/${id}`
    }

    return (
      <ResourceCard
        key={`dashboard-id--${id}`}
        testID="dashboard-card"
        contextMenu={this.contextMenu}
      >
        <ResourceCard.EditableName
          onUpdate={this.handleUpdateDashboard}
          onClick={this.handleClickDashboard}
          name={name}
          noNameString={DEFAULT_DASHBOARD_NAME}
          testID="dashboard-card--name"
          buttonTestID="dashboard-card--name-button"
          inputTestID="dashboard-card--input"
          href={dashboardUrl}
        />
        <ResourceCard.EditableDescription
          onUpdate={this.handleUpdateDescription}
          description={description}
          placeholder={`Describe ${name}`}
        />
        <ResourceCard.Meta>
          {relativeTimestampFormatter(updatedAt, 'Last modified ')}
        </ResourceCard.Meta>
        <InlineLabels
          selectedLabelIDs={labels}
          onFilterChange={onFilterChange}
          onAddLabel={this.handleAddLabel}
          onRemoveLabel={this.handleRemoveLabel}
        />
      </ResourceCard>
    )
  }

  private handleUpdateDashboard = (name: string) => {
    const {id, onUpdateDashboard} = this.props

    onUpdateDashboard(id, {name})
  }

  private handleCloneDashboard = () => {
    const {id, name, onCloneDashboard} = this.props

    onCloneDashboard(id, name)
  }

  private get contextMenu(): JSX.Element {
    const settingsRef: RefObject<HTMLButtonElement> = createRef()

    return (
      <FlexBox margin={ComponentSize.ExtraSmall}>
        <ConfirmationButton
          color={ComponentColor.Colorless}
          icon={IconFont.Trash_New}
          shape={ButtonShape.Square}
          size={ComponentSize.ExtraSmall}
          confirmationLabel="Yes, delete this dashboard"
          onConfirm={this.handleDeleteDashboard}
          confirmationButtonText="Confirm"
          testID="context-delete-menu"
        />
        <SquareButton
          ref={settingsRef}
          size={ComponentSize.ExtraSmall}
          icon={IconFont.CogSolid_New}
          color={ComponentColor.Colorless}
          testID="context-menu-dashboard"
        />
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          style={minWidth}
          contents={_ => (
            <List>
              {this.props.shouldShowTemplates && (
                <List.Item
                  onClick={this.handleExport}
                  size={ComponentSize.Small}
                  style={fontWeight}
                  testID="context-export-dashboard"
                >
                  Download Template
                </List.Item>
              )}
              <List.Item
                onClick={this.handleCloneDashboard}
                size={ComponentSize.Small}
                style={fontWeight}
                testID="context-clone-dashboard"
              >
                Clone
              </List.Item>
            </List>
          )}
          triggerRef={settingsRef}
        />
      </FlexBox>
    )
  }

  private handleDeleteDashboard = () => {
    const {id, name, onDeleteDashboard} = this.props
    onDeleteDashboard(id, name)
  }

  private handleClickDashboard = event => {
    const {
      onResetViews,
      history,
      id,
      match: {
        params: {orgID},
      },
    } = this.props

    let dashboardUrl = `/orgs/${orgID}/dashboards/${id}`

    if (isFlagEnabled('boardWithFlows')) {
      dashboardUrl = `/${PROJECT_NAME.toLowerCase()}/from/dashboard/${id}`
    }

    if (shouldOpenLinkInNewTab(event)) {
      safeBlankLinkOpen(dashboardUrl)
    } else {
      history.push(dashboardUrl)
    }

    onResetViews()
  }

  private handleUpdateDescription = (description: string) => {
    const {id, onUpdateDashboard} = this.props

    onUpdateDashboard(id, {description})
  }

  private handleAddLabel = (label: Label) => {
    const {onAddDashboardLabel, id} = this.props

    onAddDashboardLabel(id, label)
  }

  private handleRemoveLabel = (label: Label) => {
    const {onRemoveDashboardLabel, id} = this.props

    onRemoveDashboardLabel(id, label)
  }

  private handleExport = () => {
    downloadDashboardTemplate(this.props.dashboard)
  }
}

const mdtp = {
  onAddDashboardLabel: addDashboardLabel,
  onRemoveDashboardLabel: removeDashboardLabel,
  onResetViews: resetViews,
  onCloneDashboard: cloneDashboard,
  onDeleteDashboard: deleteDashboard,
  onUpdateDashboard: updateDashboard,
  sendNotification: notify,
}

const mstp = (state: AppState, props: OwnProps) => {
  const dashboard = state.resources.dashboards.byID[props.id]
  const shouldShowTemplates =
    !selectIsNewIOxOrg(state) || isFlagEnabled('showTemplatesInNewIOx')

  return {
    dashboard,
    shouldShowTemplates,
  }
}
const connector = connect(mstp, mdtp)

export default connector(withRouter(DashboardCard))
