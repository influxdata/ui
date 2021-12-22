// Libraries
import React, {FC} from 'react'

// Components
import {
    Button,
  ComponentColor,
  ComponentSize,
  InputLabel,
  InputToggleType,
  Overlay,
  Toggle,
} from '@influxdata/clockface'

// Types
import {Account as UserAccount} from 'src/client/unityRoutes'

interface Props {
  userAccounts: UserAccount[]
  onDismissOverlay: () => void
}

interface ToggleProps {
  userAccounts: UserAccount[]
}

const ToggleGroup: FC<ToggleProps> = ({userAccounts}) => {
  const onChange = ack => {
    console.log('clicked on change....', ack)
  }

  return (
    <React.Fragment>
      {userAccounts.map((account, index) => {
        const idString = `accountSwitch-toggle-choice-${index}`

        return (
          <Toggle
            tabIndex={index + 1}
            value={`${account.id}`}
            onChange={onChange}
            type={InputToggleType.Radio}
            size={ComponentSize.ExtraSmall}
            color={ComponentColor.Primary}
            testID={idString}
            name={idString}
            key={idString}
          >
            <InputLabel htmlFor={idString}>{account.name}</InputLabel>
          </Toggle>
        )
      })}
    </React.Fragment>
  )
}

export const SwitchAccountOverlay: FC<Props> = ({
  onDismissOverlay,
  userAccounts,
}) => {
  return (
    <Overlay.Container maxWidth={630}>
      <Overlay.Header
        title="Switch Account"
        wrapText={true}
      />
      <Overlay.Body>
          <ToggleGroup userAccounts={userAccounts}/>
      </Overlay.Body>
        <Overlay.Footer>
            <Button text='Cancel'
                    onClick={onDismissOverlay}/>
        </Overlay.Footer>
    </Overlay.Container>
  )
}
