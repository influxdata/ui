// Libraries
import React, {PureComponent, createRef, RefObject} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {
  IconFont,
  ComponentColor,
  ResourceCard,
  ConfirmationButton,
  FlexBox,
  ComponentSize,
  ButtonShape,
  SquareButton,
  ButtonRef,
  Popover,
  Appearance,
  List,
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

// Types
import {Label} from 'src/types'

// Constants
import {DEFAULT_DASHBOARD_NAME} from 'src/dashboards/constants'

// Utilities
import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'

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

class DashboardCard extends PureComponent<Props> {
  private contextOptionsRef: RefObject<ButtonRef> = createRef()

  public render() {
    const {
      id,
      name,
      description,
      onFilterChange,
      labels,
      updatedAt,
    } = this.props

    return (
      <ResourceCard
        key={`dashboard-id--${id}`}
        testID="dashboard-card"
        contextMenu={this.contextMenu}
        contextMenuInteraction="alwaysVisible"
      >
        <ResourceCard.EditableName
          onUpdate={this.handleUpdateDashboard}
          onClick={this.handleClickDashboard}
          name={name}
          noNameString={DEFAULT_DASHBOARD_NAME}
          testID="dashboard-card--name"
          buttonTestID="dashboard-card--name-button"
          inputTestID="dashboard-card--input"
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

  private handleCloneDashboard = (onHide: () => void) => () => {
    const {id, name, onCloneDashboard} = this.props

    onHide()
    onCloneDashboard(id, name)
  }

  private get contextMenu(): JSX.Element {
    return (
      <>
        <FlexBox margin={ComponentSize.Small}>
          <SquareButton
            icon={IconFont.CogThick}
            size={ComponentSize.ExtraSmall}
            testID="context-options"
            ref={this.contextOptionsRef}
          />
          <ConfirmationButton
            size={ComponentSize.ExtraSmall}
            shape={ButtonShape.Square}
            color={ComponentColor.Danger}
            icon={IconFont.Trash}
            confirmationLabel="Are you sure? This cannot be undone"
            confirmationButtonText="Confirm"
            onConfirm={this.handleDeleteDashboard}
            testID="context-delete"
          />
        </FlexBox>
        <Popover
          triggerRef={this.contextOptionsRef}
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          contents={onHide => (
            <List style={{width: '86px'}}>
              <List.Item
                size={ComponentSize.ExtraSmall}
                testID="context-export"
                onClick={this.handleExport(onHide)}
              >
                <List.Icon glyph={IconFont.Export} />
                Export
              </List.Item>
              <List.Item
                size={ComponentSize.ExtraSmall}
                testID="context-clone"
                onClick={this.handleCloneDashboard(onHide)}
              >
                <List.Icon glyph={IconFont.Duplicate} />
                Clone
              </List.Item>
            </List>
          )}
        />
      </>
    )
  }

  private handleDeleteDashboard = () => {
    const {id, name, onDeleteDashboard} = this.props
    onDeleteDashboard(id, name)
  }

  private handleClickDashboard = e => {
    const {
      onResetViews,
      history,
      id,
      match: {
        params: {orgID},
      },
    } = this.props

    if (e.metaKey) {
      window.open(`/orgs/${orgID}/dashboards/${id}`, '_blank')
    } else {
      history.push(`/orgs/${orgID}/dashboards/${id}`)
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

  private handleExport = (onHide: () => void) => () => {
    const {
      history,
      match: {
        params: {orgID},
      },
      id,
    } = this.props

    onHide()
    history.push(`/orgs/${orgID}/dashboards-list/${id}/export`)
  }
}

const mdtp = {
  onAddDashboardLabel: addDashboardLabel,
  onRemoveDashboardLabel: removeDashboardLabel,
  onResetViews: resetViews,
  onCloneDashboard: cloneDashboard,
  onDeleteDashboard: deleteDashboard,
  onUpdateDashboard: updateDashboard,
}

const connector = connect(null, mdtp)

export default connector(withRouter(DashboardCard))
