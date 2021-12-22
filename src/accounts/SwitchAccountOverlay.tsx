// Libraries
import React, {FC, useContext} from 'react'

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
//import {Account as UserAccount} from 'src/client/unityRoutes'
import {UserAccountContext} from "./context/userAccount";

interface Props {
  onDismissOverlay: () => void
}



const ToggleGroup: FC = () => {
    const {userAccounts, defaultAccountId, activeAccountId} = useContext(UserAccountContext)

    console.log('(tg) arghh, default account id?', defaultAccountId)
    console.log('(tg) active acct id???', activeAccountId)
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
            id={idString}
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
}) => {
  return (
    <Overlay.Container maxWidth={630}>
      <Overlay.Header title="Switch Account" wrapText={true} />
      <Overlay.Body>
        <ToggleGroup/>
      </Overlay.Body>
      <Overlay.Footer>
        <Button text="Cancel" onClick={onDismissOverlay} />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
