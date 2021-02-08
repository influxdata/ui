// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Components
import {IconFont, ComponentColor, ResourceCard} from '@influxdata/clockface'
import {Context} from 'src/clockface'
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

  private handleCloneDashboard = () => {
    const {id, name, onCloneDashboard} = this.props

    onCloneDashboard(id, name)
  }

  private get contextMenu(): JSX.Element {
    return (
      <Context>
        <Context.Menu icon={IconFont.CogThick} testID="context-export-menu">
          <Context.Item
            label="Export"
            action={this.handleExport}
            testID="context-menu-item-export"
          />
        </Context.Menu>
        <Context.Menu
          icon={IconFont.Duplicate}
          color={ComponentColor.Secondary}
        >
          <Context.Item
            label="Clone"
            action={this.handleCloneDashboard}
            testID="clone-dashboard"
          />
        </Context.Menu>
        <Context.Menu
          icon={IconFont.Trash}
          color={ComponentColor.Danger}
          testID="context-delete-menu"
        >
          <Context.Item
            label="Delete"
            action={this.handleDeleteDashboard}
            testID="context-delete-dashboard"
          />
        </Context.Menu>
      </Context>
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

  private handleExport = () => {
    const {
      history,
      match: {
        params: {orgID},
      },
      id,
    } = this.props

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
