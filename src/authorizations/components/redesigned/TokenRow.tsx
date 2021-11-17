// Libraries
import React, {createRef, PureComponent, RefObject} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'
import {withRouter, RouteComponentProps} from 'react-router-dom'

// Actions
import {
  deleteAuthorization,
  updateAuthorization,
  createAuthorization,
} from 'src/authorizations/actions/thunks'

import {showOverlay, dismissOverlay} from 'src/overlays/actions/overlays'

// Components
import {
  ComponentSize,
  FlexBox,
  AlignItems,
  FlexDirection,
  JustifyContent,
  ComponentColor,
  ResourceCard,
  IconFont,
  ButtonShape,
  Appearance,
  ConfirmationButton,
  List,
  Popover,
  SquareButton,
} from '@influxdata/clockface'

// Types
import {Authorization, AppState} from 'src/types'
import {
  UPDATED_AT_TIME_FORMAT,
  DEFAULT_TOKEN_DESCRIPTION,
} from 'src/dashboards/constants'

import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import {incrementCloneName} from 'src/utils/naming'
import {event} from 'src/cloud/utils/reporting'

interface OwnProps {
  auth: Authorization
  onClickDescription: (authID: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps & RouteComponentProps<{orgID: string}>

const formatter = createDateTimeFormatter(UPDATED_AT_TIME_FORMAT)
class TokensRow extends PureComponent<Props> {
  public render() {
    const {description} = this.props.auth
    const {auth} = this.props
    const date = new Date(auth.createdAt)
    return (
      <ResourceCard
        contextMenu={this.contextMenu}
        testID={`token-card ${auth.description}`}
        direction={FlexDirection.Row}
        justifyContent={JustifyContent.SpaceBetween}
        alignItems={AlignItems.Center}
        margin={ComponentSize.Large}
      >
        <FlexBox
          alignItems={AlignItems.FlexStart}
          direction={FlexDirection.Column}
          margin={ComponentSize.Large}
        >
          <ResourceCard.EditableName
            onUpdate={this.handleUpdateName}
            onClick={this.handleClickDescription}
            name={description}
            noNameString={DEFAULT_TOKEN_DESCRIPTION}
            testID={`token-name ${auth.description}`}
          />
          <ResourceCard.Meta>
            <>Created at: {formatter.format(date)}</>
            <>Created by: {auth.user}</>
            <>Last Used: {relativeTimestampFormatter(auth.updatedAt)}</>
          </ResourceCard.Meta>
        </FlexBox>
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
          confirmationLabel="Yes, delete this token"
          onConfirm={this.handleDelete}
          confirmationButtonText="Confirm"
          testID="context-delete-menu"
        />
        <SquareButton
          ref={settingsRef}
          size={ComponentSize.ExtraSmall}
          icon={IconFont.CogSolid_New}
          color={ComponentColor.Colorless}
          testID="context-menu-token"
        />
        <Popover
          appearance={Appearance.Outline}
          enableDefaultStyles={false}
          style={{minWidth: '112px'}}
          contents={() => (
            <List>
              <List.Item
                onClick={this.handleClone}
                size={ComponentSize.Small}
                style={{fontWeight: 500}}
                testID="context-clone-token"
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

  private handleDelete = () => {
    const {id, description} = this.props.auth
    this.props.deleteAuthorization(id, description)
  }

  private handleClone = async () => {
    const {description} = this.props.auth
    const allTokenDescriptions = Object.values(this.props.authorizations).map(
      auth => auth.description
    )

    try {
      await this.props.createAuthorization({
        ...this.props.auth,
        description: incrementCloneName(allTokenDescriptions, description),
      })
      event('token.clone.success', {id: this.props.auth.id, name: description})
      this.props.showOverlay('access-token', null, () => dismissOverlay())
    } catch {
      event('token.clone.failure', {id: this.props.auth.id, name: description})
    }
  }

  private handleClickDescription = () => {
    const {onClickDescription, auth} = this.props
    event('token_row.edit_overlay.opened')
    onClickDescription(auth.id)
  }

  private handleUpdateName = (value: string) => {
    const {auth, updateAuthorization} = this.props
    updateAuthorization({...auth, description: value})
    event('token.desciption.edited', {
      id: this.props.auth.id,
      description: value,
    })
  }
}

const mstp = (state: AppState) => {
  const authorizations = state.resources.tokens.byID
  return {authorizations}
}

const mdtp = {
  deleteAuthorization,
  updateAuthorization,
  createAuthorization,
  showOverlay,
  dismissOverlay,
}

const connector = connect(mstp, mdtp)

export const TokenRow = connector(withRouter(TokensRow))
