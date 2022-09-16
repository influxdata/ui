// Libraries
import React, {FC, useContext, useEffect, useState} from 'react'

import {CLOUD_URL} from 'src/shared/constants'

// Components
import {
  Button,
  ComponentColor,
  ComponentSize,
  ComponentStatus,
  InputLabel,
  InputToggleType,
  Overlay,
  Toggle,
} from '@influxdata/clockface'

// Metrics
import {event} from 'src/cloud/utils/reporting'

import {UserAccountContext} from 'src/accounts/context/userAccount'

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
    const numAcct = parseInt(strValue, 10)
    onClickAcct(numAcct)
    setSelectedAcct(numAcct)
  }

  const style = {marginBottom: 17}

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
  const {activeAccountId, handleSetDefaultAccount, defaultAccountId} =
    useContext(UserAccountContext)

  const defaultBtnStatus =
    activeAccountId === defaultAccountId
      ? ComponentStatus.Disabled
      : ComponentStatus.Default

  const [newAccountId, setNewAccountId] = useState<number>(activeAccountId)
  const [switchButtonStatus, setSwitchButtonStatus] = useState(
    ComponentStatus.Disabled
  )

  const [defaultButtonStatus, setDefaultButtonStatus] =
    useState(defaultBtnStatus)

  const doSwitchAccount = () => {
    onDismissOverlay()
    event('multiAccount.switchAccount')
    window.location.href = `${CLOUD_URL}/accounts/${newAccountId}`
  }

  const doSetDefaultAccount = () => {
    handleSetDefaultAccount(newAccountId)
    onDismissOverlay()
    event('multiAccount.switchDefaultAccount')
  }

  useEffect(() => {
    const bStatus =
      !newAccountId || newAccountId === activeAccountId
        ? ComponentStatus.Disabled
        : ComponentStatus.Default

    setSwitchButtonStatus(bStatus)

    if (newAccountId) {
      // something has been set, so let's change the default switch btn status:
      const defaultSwitchStatus =
        newAccountId === defaultAccountId
          ? ComponentStatus.Disabled
          : ComponentStatus.Default
      setDefaultButtonStatus(defaultSwitchStatus)
    }
  }, [newAccountId])

  const disabledTitleText =
    'Select a Different Account to Enable the Switch Button'

  return (
    <Overlay.Container maxWidth={420} testID="switch-account--dialog">
      <Overlay.Header
        title="Switch account"
        wrapText={true}
        onDismiss={onDismissOverlay}
      />
      <Overlay.Body>
        <ToggleGroup onClickAcct={setNewAccountId} />
      </Overlay.Body>
      <Overlay.Footer>
        <Button
          text="Cancel"
          testID="multi-account-switch-cancel"
          onClick={onDismissOverlay}
          color={ComponentColor.Tertiary}
        />
        <Button
          testID="switch-default-account--btn"
          text="Set as default"
          status={defaultButtonStatus}
          onClick={doSetDefaultAccount}
        />
        <Button
          text="Switch"
          onClick={doSwitchAccount}
          status={switchButtonStatus}
          disabledTitleText={disabledTitleText}
          testID="actually-switch-account--btn"
          color={ComponentColor.Primary}
        />
      </Overlay.Footer>
    </Overlay.Container>
  )
}
