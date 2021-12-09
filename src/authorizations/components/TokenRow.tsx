// Libraries
import React, {PureComponent} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

// Actions
import {
  deleteAuthorization,
  updateAuthorization,
} from 'src/authorizations/actions/thunks'

// Components
import {
  ComponentSize,
  FlexBox,
  InputLabel,
  SlideToggle,
  ComponentColor,
  ResourceCard,
  IconFont,
  ConfirmationButton,
  ButtonShape,
} from '@influxdata/clockface'

// Types
import {Authorization} from 'src/types'
import {
  DEFAULT_TOKEN_DESCRIPTION,
  UPDATED_AT_TIME_FORMAT,
} from 'src/dashboards/constants'

interface OwnProps {
  auth: Authorization
  onClickDescription: (authID: string) => void
}

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps & OwnProps

const formatter = createDateTimeFormatter(UPDATED_AT_TIME_FORMAT)
class TokenRow extends PureComponent<Props> {
  public render() {
    const {description} = this.props.auth
    const {auth} = this.props
    const labelText = this.isTokenEnabled ? 'Active' : 'Inactive'
    const date = new Date(auth.createdAt)

    return (
      <ResourceCard
        contextMenu={this.contextMenu}
        testID={`token-card ${auth.description}`}
        disabled={!this.isTokenEnabled}
      >
        <ResourceCard.EditableName
          onUpdate={this.handleUpdateName}
          onClick={this.handleClickDescription}
          name={description}
          noNameString={DEFAULT_TOKEN_DESCRIPTION}
          testID={`token-name ${auth.description}`}
        />
        <ResourceCard.Meta>
          {[
            <React.Fragment key={auth.id}>
              Created at: {formatter.format(date)}
            </React.Fragment>,
          ]}
        </ResourceCard.Meta>
        <FlexBox margin={ComponentSize.Small}>
          <SlideToggle
            active={this.isTokenEnabled}
            size={ComponentSize.ExtraSmall}
            onChange={this.changeToggle}
          />
          <InputLabel active={this.isTokenEnabled}>{labelText}</InputLabel>
        </FlexBox>
      </ResourceCard>
    )
  }

  private get contextMenu(): JSX.Element {
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
      </FlexBox>
    )
  }

  private get isTokenEnabled(): boolean {
    const {auth} = this.props
    return auth.status === 'active'
  }

  private changeToggle = () => {
    const {auth, onUpdate} = this.props
    if (auth.status === 'active') {
      auth.status = 'inactive'
    } else {
      auth.status = 'active'
    }
    onUpdate(auth)
  }

  private handleDelete = () => {
    const {id, description} = this.props.auth
    this.props.onDelete(id, description)
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

const mdtp = {
  onDelete: deleteAuthorization,
  onUpdate: updateAuthorization,
}

const connector = connect(null, mdtp)

export default connector(TokenRow)
