// Libraries
import React, {createRef, FC, RefObject} from 'react'
import {useSelector, useDispatch} from 'react-redux'
import {createDateTimeFormatter} from 'src/utils/datetime/formatters'

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

const formatter = createDateTimeFormatter(UPDATED_AT_TIME_FORMAT)

interface Props {
  auth: Authorization
}

const ContextMenu: FC<Props> = ({auth}) => {
  const dispatch = useDispatch()
  const authorizations = useSelector(
    (state: AppState) => state.resources.tokens.byID
  )

  const handleDelete = () => {
    dispatch(deleteAuthorization(auth.id, auth.description))
  }

  const handleClone = async () => {
    const {description} = auth
    const allTokenDescriptions = Object.values(authorizations).map(
      auth => auth.description
    )

    try {
      await dispatch(
        createAuthorization({
          ...auth,
          description: incrementCloneName(allTokenDescriptions, description),
        })
      )
      event('token.clone.success', {id: auth.id, name: description})
      dispatch(showOverlay('access-cloned-token', null, () => dismissOverlay()))
    } catch {
      event('token.clone.failure', {id: auth.id, name: description})
    }
  }

  const settingsRef: RefObject<HTMLButtonElement> = createRef()

  return (
    <FlexBox margin={ComponentSize.ExtraSmall}>
      <ConfirmationButton
        color={ComponentColor.Colorless}
        icon={IconFont.Trash_New}
        shape={ButtonShape.Square}
        size={ComponentSize.ExtraSmall}
        confirmationLabel="Yes, delete this token"
        onConfirm={handleDelete}
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
              onClick={handleClone}
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

interface TokenProps {
  onClickDescription: (authID: string) => void
}

export const TokenRow: FC<Props & TokenProps> = ({
  auth,
  onClickDescription,
}) => {
  const dispatch = useDispatch()

  const handleClickDescription = () => {
    event('token_row.edit_overlay.opened')
    onClickDescription(auth.id)
  }

  const handleUpdateName = (value: string) => {
    dispatch(updateAuthorization({...auth, description: value}))
    event('token.desciption.edited', {
      id: auth.id,
      description: value,
    })
  }
  const {description} = auth
  const date = new Date(auth.createdAt)

  return (
    <ResourceCard
      contextMenu={<ContextMenu auth={auth} />}
      disabled={auth.status !== 'active'}
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
          onUpdate={handleUpdateName}
          onClick={handleClickDescription}
          name={description}
          noNameString={DEFAULT_TOKEN_DESCRIPTION}
          testID={`token-name ${auth.description}`}
        />
        <ResourceCard.Meta>
          <>Created at: {formatter.format(date)}</>
          <>Owner: {auth.user}</>
          <>Last Used: {relativeTimestampFormatter(auth.updatedAt)}</>
        </ResourceCard.Meta>
      </FlexBox>
    </ResourceCard>
  )
}

export default TokenRow
