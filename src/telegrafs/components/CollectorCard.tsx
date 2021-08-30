// Libraries
import React, {PureComponent, MouseEvent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps, Link} from 'react-router-dom'

// Components
import {
  ResourceCard,
  IconFont,
  FlexBox,
  ComponentSize,
  ConfirmationButton,
  ButtonShape,
  SquareButton,
} from '@influxdata/clockface'
import {ComponentColor} from '@influxdata/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'

// Actions
import {
  addTelegrafLabelsAsync,
  removeTelegrafLabelsAsync,
} from 'src/telegrafs/actions/thunks'

import {createTelegraf} from 'src/telegrafs/actions/thunks'
// Selectors
import {getOrg} from 'src/organizations/selectors'

// Constants
import {DEFAULT_COLLECTOR_NAME} from 'src/dashboards/constants'

// Types
import {AppState, Label, Telegraf} from 'src/types'

// Utils
import {incrementCloneName} from 'src/utils/naming'

interface OwnProps {
  collector: Telegraf
  onDelete: (telegraf: Telegraf) => void
  onUpdate: (telegraf: Telegraf) => void
  onFilterChange: (searchTerm: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>
type Props = OwnProps & ReduxProps

class CollectorRow extends PureComponent<
  Props & RouteComponentProps<{orgID: string}>
> {
  public render() {
    const {collector, org} = this.props

    return (
      <ResourceCard
        key={`telegraf-id--${collector.id}`}
        testID="resource-card"
        contextMenu={this.contextMenu}
      >
        <ResourceCard.EditableName
          onUpdate={this.handleUpdateName}
          onClick={this.handleNameClick}
          name={collector.name}
          noNameString={DEFAULT_COLLECTOR_NAME}
          testID="collector-card--name"
          buttonTestID="collector-card--name-button"
          inputTestID="collector-card--input"
        />
        <ResourceCard.EditableDescription
          onUpdate={this.handleUpdateDescription}
          description={collector.description}
          placeholder={`Describe ${collector.name}`}
        />
        <ResourceCard.Meta>
          <span key={`bucket-key--${collector.id}`} data-testid="bucket-name">
            {/* todo(glinton): verify what sets this. It seems like it is using the 'config' section of 'influxdb_v2' output?? */}
            Bucket: {collector.metadata.buckets.join(', ')}
          </span>
          <Link
            to={`/orgs/${org.id}/load-data/telegrafs/${collector.id}/instructions`}
            data-testid="setup-instructions-link"
          >
            Setup Instructions
          </Link>
        </ResourceCard.Meta>
        {this.labels}
      </ResourceCard>
    )
  }

  private get contextMenu(): JSX.Element {
    return (
      /* <Context>
        <Context.Menu
          icon={IconFont.Duplicate}
          color={ComponentColor.Secondary}
          testID="telegraf-clone-menu"
        >
          <Context.Item
            label="Clone"
            action={this.cloneTelegraf}
            testID="telegraf-clone-button"
          />
        </Context.Menu>
        <Context.Menu
          testID="telegraf-delete-menu"
          icon={IconFont.Trash}
          color={ComponentColor.Danger}
        >
          <Context.Item
            testID="telegraf-delete-button"
            label="Delete"
            action={this.handleDeleteConfig}
          />
        </Context.Menu>
      </Context> */

      <FlexBox margin={ComponentSize.ExtraSmall}>
        <SquareButton
          size={ComponentSize.ExtraSmall}
          icon={IconFont.Duplicate_New}
          color={ComponentColor.Colorless}
          onClick={this.cloneTelegraf}
          testID={`context-clone-menu`}
        />
        <ConfirmationButton
          size={ComponentSize.ExtraSmall}
          color={ComponentColor.Colorless}
          icon={IconFont.Trash_New}
          confirmationLabel={'Yes, delete this configuration'}
          onConfirm={this.handleDeleteConfig}
          confirmationButtonText={'Confirm'}
          testID={`context-delete-menu`}
          shape={ButtonShape.Square}
        ></ConfirmationButton>
      </FlexBox>
    )
  }

  private handleUpdateName = (name: string) => {
    const {onUpdate, collector} = this.props

    onUpdate({...collector, name})
  }

  private handleUpdateDescription = (description: string) => {
    const {onUpdate, collector} = this.props

    onUpdate({...collector, description})
  }

  private get labels(): JSX.Element {
    const {collector, onFilterChange} = this.props

    return (
      <InlineLabels
        selectedLabelIDs={collector.labels}
        onFilterChange={onFilterChange}
        onAddLabel={this.handleAddLabel}
        onRemoveLabel={this.handleRemoveLabel}
      />
    )
  }

  private handleAddLabel = async (label: Label) => {
    const {collector, onAddLabels} = this.props

    await onAddLabels(collector.id, [label])
  }

  private handleRemoveLabel = async (label: Label) => {
    const {collector, onRemoveLabels} = this.props

    await onRemoveLabels(collector.id, [label])
  }

  private handleNameClick = (e: MouseEvent) => {
    e.preventDefault()

    this.handleOpenConfig()
  }

  private handleOpenConfig = (): void => {
    const {collector, history, org} = this.props
    history.push(`/orgs/${org.id}/load-data/telegrafs/${collector.id}/view`)
  }

  private cloneTelegraf = (): void => {
    const allTelegrafNames = Object.values(this.props.telegrafs).map(
      t => t.name
    )
    this.props.onCloneTelegraf({
      ...this.props.collector,
      name: incrementCloneName(allTelegrafNames, this.props.collector.name),
    })
  }
  private handleDeleteConfig = (): void => {
    this.props.onDelete(this.props.collector)
  }
}

const mstp = (state: AppState) => {
  const org = getOrg(state)
  const telegrafs = state.resources.telegrafs.byID
  return {org, telegrafs}
}

const mdtp = {
  onCloneTelegraf: createTelegraf,
  onAddLabels: addTelegrafLabelsAsync,
  onRemoveLabels: removeTelegrafLabelsAsync,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(CollectorRow))
