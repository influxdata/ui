// Libraries
import React, {PureComponent} from 'react'
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
  Button,
  ResourceCard,
  IconFont,
  ButtonShape,
} from '@influxdata/clockface'

import {Context} from 'src/clockface'

// Types
import {Authorization, AppState} from 'src/types'
import {
  DEFAULT_TOKEN_DESCRIPTION,
  UPDATED_AT_TIME_FORMAT,
} from 'src/dashboards/constants'

import {relativeTimestampFormatter} from 'src/shared/utils/relativeTimestampFormatter'
import {incrementCloneName} from 'src/utils/naming'

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
    return (
      <Context>
        <FlexBox margin={ComponentSize.Medium}>
          <Button
            icon={IconFont.Duplicate}
            color={ComponentColor.Secondary}
            text="Clone"
            onClick={this.handleClone}
            testID="clone-token"
            size={ComponentSize.ExtraSmall}
          />

          <Context.Menu
            icon={IconFont.Trash}
            color={ComponentColor.Danger}
            text="Delete"
            shape={ButtonShape.StretchToFit}
            size={ComponentSize.ExtraSmall}
          >
            <Context.Item
              label="Confirm"
              action={this.handleDelete}
              testID="delete-token"
            />
          </Context.Menu>
        </FlexBox>
      </Context>
    )
  }

  private handleDelete = () => {
    const {id, description} = this.props.auth
    this.props.onDelete(id, description)
  }

  private handleClone = () => {
    const {description} = this.props.auth

    const allTokenDescriptions = Object.values(this.props.authorizations).map(
      auth => auth.description
    )

    this.props.onClone({
      ...this.props.auth,
      description: incrementCloneName(allTokenDescriptions, description),
    })
    this.props.showOverlay('access-token', null, () => dismissOverlay())
  }

  private handleClickDescription = () => {
    const {onClickDescription, auth} = this.props
    onClickDescription(auth.id)
  }

  private handleUpdateName = (value: string) => {
    const {auth, onUpdate} = this.props
    onUpdate({...auth, description: value})
  }
}

const mstp = (state: AppState) => {
  const authorizations = state.resources.tokens.byID
  return {authorizations}
}

const mdtp = {
  onDelete: deleteAuthorization,
  onUpdate: updateAuthorization,
  onClone: createAuthorization,
  showOverlay,
  dismissOverlay,
}

const connector = connect(mstp, mdtp)

export const TokenRow = connector(withRouter(TokensRow))
