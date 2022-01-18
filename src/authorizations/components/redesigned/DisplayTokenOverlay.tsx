import React, {FC, useContext} from 'react'
import {connect, ConnectedProps} from 'react-redux'

// Components
import {
  Overlay,
  FlexBox,
  Alert,
  IconFont,
  ComponentColor,
  AlignItems,
  FlexDirection,
  ComponentSize,
} from '@influxdata/clockface'
import CodeSnippet from 'src/shared/components/CodeSnippet'

// Contexts
import {OverlayContext} from 'src/overlays/components/OverlayController'

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>

type Props = ReduxProps

const DisplayTokenOverlay: FC<Props> = props => {
  const {onClose} = useContext(OverlayContext)

  return (
    <Overlay.Container maxWidth={750}>
      <Overlay.Header
        title="You've successfully created an API token"
        onDismiss={onClose}
        wrapText={true}
      />
      <Overlay.Body>
        <FlexBox
          direction={FlexDirection.Column}
          margin={ComponentSize.Large}
          alignItems={AlignItems.Stretch}
        >
          <Alert icon={IconFont.AlertTriangle} color={ComponentColor.Primary}>
            Make sure to copy your new custom API token now. You won't be able
            to see it again!
          </Alert>

          <CodeSnippet text={props.auth.token} type="Token" />
        </FlexBox>
      </Overlay.Body>
    </Overlay.Container>
  )
}

const mstp = (state: AppState) => {
  const auth = state.resources.tokens.currentAuth.item
  return {auth}
}

const connector = connect(mstp, null)
export default connector(DisplayTokenOverlay)
