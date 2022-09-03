// Libraries
import React, {PureComponent, MouseEvent, RefObject, createRef} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {withRouter, RouteComponentProps, Link} from 'react-router-dom'

// Components
import {
  Appearance,
  ButtonShape,
  ComponentSize,
  ConfirmationButton,
  FlexBox,
  IconFont,
  List,
  Popover,
  SquareButton,
  ResourceCard,
} from '@influxdata/clockface'
import {ComponentColor} from '@influxdata/clockface'
import InlineLabels from 'src/shared/components/inlineLabels/InlineLabels'

// Actions
import {
  addTelegrafLabelAsync,
  removeTelegrafLabelAsync,
} from 'src/telegrafs/actions/thunks'
import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

import {cloneTelegraf} from 'src/telegrafs/actions/thunks'
// Selectors
import {getOrg} from 'src/organizations/selectors'

// Constants
import {DEFAULT_COLLECTOR_NAME} from 'src/dashboards/constants'

// Types
import {AppState, Label, Telegraf} from 'src/types'

// Utils
import {setCloneName} from 'src/utils/naming'

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
    const {collector} = this.props

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
          <Link
            to={''}
            data-testid="setup-instructions-link"
            onClick={this.openInstructionsOverlay}
          >
            Setup Instructions
          </Link>
        </ResourceCard.Meta>
        {this.labels}
      </ResourceCard>
    )
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
          confirmationLabel="Yes, delete this configuration"
          onConfirm={this.handleDeleteConfig}
          confirmationButtonText="Confirm"
          testID="context-delete-menu"
        />
        <SquareButton
          ref={settingsRef}
          size={ComponentSize.ExtraSmall}
          icon={IconFont.CogSolid_New}
          color={ComponentColor.Colorless}
          testID="context-menu-telegraf"
        />
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          style={{minWidth: '80px'}}
          contents={() => (
            <List>
              <List.Item
                onClick={this.cloneTelegraf}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-clone-telegraf"
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

  private openInstructionsOverlay = e => {
    e.preventDefault()
    const {showOverlay, dismissOverlay, collector} = this.props
    return showOverlay(
      'telegraf-instructions',
      {collectorId: collector.id},
      dismissOverlay
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
    const {collector, onAddLabel} = this.props

    await onAddLabel(collector.id, label)
  }

  private handleRemoveLabel = async (label: Label) => {
    const {collector, onRemoveLabel} = this.props

    await onRemoveLabel(collector.id, label)
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
    this.props.cloneTelegraf({
      ...this.props.collector,
      name: setCloneName(this.props.collector.name),
    })
  }
  private handleDeleteConfig = (): void => {
    this.props.onDelete(this.props.collector)
  }
}

const mstp = (state: AppState) => {
  const org = getOrg(state)
  return {org}
}

const mdtp = {
  cloneTelegraf,
  onAddLabel: addTelegrafLabelAsync,
  onRemoveLabel: removeTelegrafLabelAsync,
  showOverlay,
  dismissOverlay,
}

const connector = connect(mstp, mdtp)

export default connector(withRouter(CollectorRow))
