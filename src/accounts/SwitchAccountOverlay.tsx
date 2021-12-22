// Libraries
import React, {FC, useContext, useState} from 'react'

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
import {UserAccountContext} from './context/userAccount'

interface Props {
  onDismissOverlay: () => void
}

interface ToggleProps {
  onClickAcct: (acct: number) => void
}

const ToggleGroup: FC<ToggleProps> = ({onClickAcct}) => {
  const {userAccounts, activeAccountId} = useContext(UserAccountContext)

  const [selectedAcct, setSelectedAcct] = useState(activeAccountId)

  // need to change it to a number, so that the equality for
  // active and isChecked works properly
  // it is a string because that is how the toggle works
  const onChange = strValue => {
    const numAcct = parseInt(strValue)
    onClickAcct(numAcct)
    setSelectedAcct(numAcct)
  }

  const style = {marginBottom: 7}

  return (
    <React.Fragment>
      {userAccounts.map((account, index) => {
        const idString = `accountSwitch-toggle-choice-${index}`
        const displayName = account.isDefault
          ? `${account.name} (default)`
          : account.name

        return (
          <Toggle
            tabIndex={index + 1}
            value={`${account.id}`}
            onChange={onChange}
            type={InputToggleType.Radio}
            size={ComponentSize.Small}
            color={ComponentColor.Primary}
            testID={`${idString}-ID`}
            name={idString}
            id={idString}
            key={idString}
            style={style}
            checked={account.id === selectedAcct}
          >
            <InputLabel htmlFor={idString} active={account.id === selectedAcct}>
              {displayName}
            </InputLabel>
          </Toggle>
        )
      })}
    </React.Fragment>
  )
}

export const SwitchAccountOverlay: FC<Props> = ({onDismissOverlay}) => {
  const [newAccountId, setNewAccountId] = useState<number>(null)

  const doSwitchAccount = () => {
    console.log('would switch account to this now: ', newAccountId)
    // todo: set window.location correctly!  (on a timeout?) investigate!
    onDismissOverlay()
    window.location.href = `/accounts/${newAccountId}`
  }

  return (
    <Overlay.Container maxWidth={630}>
      <Overlay.Header title="Switch Account" wrapText={true} />
      <Overlay.Body>
        <ToggleGroup onClickAcct={setNewAccountId} />
      </Overlay.Body>
      <Overlay.Footer>
        <Button text="Cancel" onClick={onDismissOverlay} />
        <Button text="Switch Account" onClick={doSwitchAccount} />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
